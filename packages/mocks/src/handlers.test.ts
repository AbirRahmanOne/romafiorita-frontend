import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from './server';

const BASE = 'http://localhost/v1';
const json = async (p: string, init?: RequestInit) => (await fetch(`${BASE}${p}`, init)).json();
const post = (p: string, body?: unknown) =>
  json(p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('mock api', () => {
  it('maps a Rome postcode to ROME zone with 15-min slots', async () => {
    const check = await json('/delivery/check?postcode=00153');
    expect(check.zone).toBe('ROME');
    expect(check.types).toContain('exact');
    const { slots } = await json('/delivery/slots?postcode=00153');
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s: { available: boolean }) => !s.available)).toBe(true);
  });

  it('treats a non-Rome postcode as NATIONAL courier with no slots', async () => {
    const check = await json('/delivery/check?postcode=20121');
    expect(check.zone).toBe('NATIONAL');
    const { slots } = await json('/delivery/slots?postcode=20121');
    expect(slots).toHaveLength(0);
  });

  it('checkout creates an order that track can find', async () => {
    const co = await json('/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [{ variant_id: 'rosa-classica-premium', quantity: 1 }],
        delivery_type: 'exact',
        delivery_slot: '19:30',
      }),
    });
    expect(co.order_number).toMatch(/^RF-2026-\d{5}$/);
    const tr = await json(`/orders/track/${co.token}`);
    expect(tr.order_number).toBe(co.order_number);
    expect(tr.timeline).toHaveLength(5);
    expect(tr.total_cents).toBe(co.total_cents);
    // track resolves variant_id → product name + tier (shown on confirmation/tracking)
    expect(tr.items).toEqual([{ name: 'Rosa Classica', tier: 'PREMIUM' }]);
  });

  it('admin dashboard returns KPIs and a 14-day revenue series', async () => {
    const d = await json('/admin/dashboard');
    expect(d.revenue_series).toHaveLength(14);
    expect(d.kpis.orders_today).toBeGreaterThan(0);
    expect(Array.isArray(d.pending_photos)).toBe(true);
  });

  it('admin order lifecycle advances status', async () => {
    const list = await json('/admin/orders?status=new&q=');
    const id = list.items[0].id;
    const accepted = await post(`/admin/orders/${id}/accept`);
    expect(accepted.status).toBe('awaiting');
    const detail = await json(`/admin/orders/${id}`);
    expect(detail.status).toBe('awaiting');
  });

  it('bulk price preview computes the new price without applying', async () => {
    const before = await json('/admin/products');
    const lux = before.items[0].variants.find((v: { tier: string }) => v.tier === 'LUXURY');
    const res = await post('/admin/products/bulk-price', { tier: 'LUXURY', pct: 10, apply: false });
    const row = res.preview.find((r: { slug: string }) => r.slug === before.items[0].slug);
    expect(row.new_cents).toBe(Math.round(lux.price_cents * 1.1));
    expect(res.applied).toBe(false);
  });

  it('payments returns KPIs and captures a held payment', async () => {
    const list = await json('/admin/payments?source=all&status=all');
    expect(list.kpis.gross_cents).toBeGreaterThan(0);
    const held = list.items.find((p: { status: string }) => p.status === 'held');
    const captured = await post(`/admin/payments/${held.id}/capture`);
    expect(captured.status).toBe('captured');
  });

  it('refunds a payment (partial) and builds a monthly report', async () => {
    const list = await json('/admin/payments?source=all&status=all');
    const cap = list.items.find((p: { status: string }) => p.status === 'captured');
    const refunded = await post(`/admin/payments/${cap.id}/refund`, { amount_cents: 500, reason: 'partial' });
    expect(refunded.status).toBe('refunded');
    expect(refunded.refunded_cents).toBe(500);

    const report = await json('/admin/payments/reports/monthly?month=2026-10');
    expect(report.filename).toContain('2026-10');
    expect(report.csv.split('\n')[0]).toContain('order');
  });

  it('edits a payment request before payment and regenerates the token', async () => {
    const created = await post('/admin/payment-requests', {
      customer: 'Edit Me',
      email: 'edit@mail.com',
      items: [{ title: 'Bouquet', price_cents: 5000 }],
    });
    const edited = await json(`/admin/payment-requests/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [{ title: 'Bouquet', price_cents: 6000 }] }),
    });
    expect(edited.amount_cents).toBe(6000);
    expect(edited.token).not.toBe(created.token); // old link dies
  });

  it('custom order → pay → verify roundtrip', async () => {
    const created = await post('/admin/payment-requests', {
      customer: 'Giulia Verdi',
      email: 'giulia@mail.com',
      whatsapp: '+391112223334',
      recipient: 'Marco · Prati',
      delivery_slot: 'Sat · 11:00',
      card_message: 'Auguri!',
      items: [{ title: 'Custom bouquet', price_cents: 8400 }],
      expiry_hours: 48,
    });
    expect(created.amount_cents).toBe(8400);

    const summary = await json(`/pay/${created.token}`);
    expect(summary.status).toBe('viewed'); // viewing the link marks it viewed

    const intent = await post(`/pay/${created.token}/intent`);
    expect(intent.client_secret).toContain('pi_mock');

    const verify = await post('/verify', { order_number: created.order_number, email: 'giulia@mail.com' });
    expect(verify.genuine).toBe(true);
    expect(verify.status).toBe('paid');
  });
});
