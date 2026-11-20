import { http, HttpResponse } from 'msw';
import {
  addons,
  adminCatalogue,
  adminOrders,
  business,
  img,
  occasions,
  products,
  reviews,
  settings,
  stats,
  type AdminOrder,
  type AdminStatus,
} from './seed';
import {
  adminSettings,
  balance,
  disputes,
  insights,
  payments,
  paymentRequests,
  payouts,
  type PaymentRequest,
} from './seed-admin';
import { cities, journal } from './content';
import { computeQuote, type QuoteInput } from './quote';

const API = '*/v1';

/** Rome postcodes are 001xx; anything else is NATIONAL courier. */
function zoneFor(postcode: string): 'ROME' | 'NATIONAL' {
  return /^001\d{2}$/.test(postcode.trim()) ? 'ROME' : 'NATIONAL';
}

/** In-memory orders created at checkout, so /orders/track works on mocks. */
interface TrackedOrder {
  order_number: string;
  token: string;
  status: string;
  total_cents: number;
  delivery_slot: string;
  items: { name: string; tier: string }[];
}

/** Resolve ordered variant_ids back to product name + tier for display (cart sends ids only). */
function orderItems(ids: { variant_id: string }[]): { name: string; tier: string }[] {
  return ids.flatMap(({ variant_id }) => {
    const product = products.find((p) => p.variants.some((v) => v.id === variant_id));
    const variant = product?.variants.find((v) => v.id === variant_id);
    return product && variant ? [{ name: product.name, tier: variant.tier }] : [];
  });
}
const tracked = new Map<string, TrackedOrder>();

/** Mutable copy of admin orders so lifecycle changes persist within a session. */
const liveOrders: AdminOrder[] = adminOrders.map((o) => ({ ...o }));
const catalogue = adminCatalogue.map((c) => ({ ...c, variants: c.variants.map((v) => ({ ...v })) }));

function decorate(o: AdminOrder) {
  return {
    ...o,
    thumb: img(o.imageKey, 120, 120),
    image: img(o.imageKey, 600, 600),
  };
}

function buildSlots(): { time: string; available: boolean }[] {
  const out: { time: string; available: boolean }[] = [];
  for (let h = 7; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      out.push({ time, available: !['19:45', '12:30', '20:15'].includes(time) });
    }
  }
  return out;
}

export const handlers = [
  // ---- Public (storefront) ----
  http.get(`${API}/catalog/products`, ({ request }) => {
    const url = new URL(request.url);
    const occasion = url.searchParams.get('occasion');
    const category = url.searchParams.get('category');
    const items = products.filter(
      (p) => (!occasion || p.occasion === occasion) && (!category || p.category === category),
    );
    return HttpResponse.json({ items });
  }),
  http.get(`${API}/catalog/products/:slug`, ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${API}/catalog/occasions`, () => HttpResponse.json({ items: occasions })),
  http.get(`${API}/catalog/addons`, () => HttpResponse.json({ items: addons })),

  http.get(`${API}/delivery/check`, ({ request }) => {
    const postcode = new URL(request.url).searchParams.get('postcode') ?? '';
    const zone = zoneFor(postcode);
    return HttpResponse.json({
      zone,
      types: zone === 'ROME' ? ['standard', 'window', 'exact'] : ['courier'],
      fees: { standard_cents: 0, window_cents: 500, exact_cents: 900 },
      cutoff: zone === 'ROME' ? new Date().toISOString() : null,
    });
  }),
  http.get(`${API}/delivery/slots`, ({ request }) => {
    const postcode = new URL(request.url).searchParams.get('postcode') ?? '';
    if (zoneFor(postcode) !== 'ROME') return HttpResponse.json({ slots: [] });
    return HttpResponse.json({ slots: buildSlots() });
  }),
  http.post(`${API}/cart/quote`, async ({ request }) => {
    const body = (await request.json()) as QuoteInput;
    try {
      return HttpResponse.json(computeQuote(body));
    } catch {
      return new HttpResponse(null, { status: 422 });
    }
  }),
  http.post(`${API}/checkout`, async ({ request }) => {
    const body = (await request.json()) as QuoteInput & { delivery_slot?: string };
    const quote = computeQuote(body);
    const seq = String(24850 + tracked.size + 1).padStart(5, '0');
    const order_number = `RF-2026-${seq}`;
    const token = `trk_${Math.random().toString(36).slice(2, 12)}`;
    tracked.set(token, {
      order_number,
      token,
      status: 'awaiting',
      total_cents: quote.total_cents,
      delivery_slot: body.delivery_slot ?? 'Standard',
      items: orderItems(body.items ?? []),
    });
    return HttpResponse.json({ order_number, token, client_secret: `pi_mock_${token}_secret`, ...quote });
  }),
  http.get(`${API}/orders/track/:token`, ({ params }) => {
    const order = tracked.get(String(params.token));
    if (!order) return new HttpResponse(null, { status: 404 });
    const FLOW = ['awaiting', 'photo-sent', 'approved', 'out-for-delivery', 'delivered'];
    const idx = FLOW.indexOf(order.status);
    return HttpResponse.json({
      order_number: order.order_number,
      status: order.status,
      timeline: FLOW.map((s, i) => ({ status: s, done: i <= idx })),
      bouquet_photo: null,
      delivery_slot: order.delivery_slot,
      total_cents: order.total_cents,
      items: order.items,
    });
  }),

  http.get(`${API}/content/reviews`, () => HttpResponse.json({ items: reviews })),
  http.get(`${API}/content/stats`, () => HttpResponse.json(stats)),
  http.get(`${API}/content/cities`, () => HttpResponse.json({ items: cities })),
  http.get(`${API}/content/journal`, () => HttpResponse.json({ items: journal })),
  http.get(`${API}/config/business`, () => HttpResponse.json(business)),
  http.get(`${API}/config/settings`, () => HttpResponse.json(settings)),

  // ---- Admin ----
  http.get(`${API}/admin/dashboard`, () => {
    const revenue_series = [1420, 1610, 1380, 1890, 2240, 2980, 2110, 1540, 1720, 1650, 1980, 2310, 3140, 2486].map(
      (cents, i) => ({ day: 11 + i, revenue_cents: cents * 100 }),
    );
    return HttpResponse.json({
      kpis: {
        revenue_today_cents: liveOrders.reduce((s, o) => s + o.total_cents, 0) + 185700,
        orders_today: liveOrders.length + 28,
        on_time_pct: 97.4,
        photos_to_send: liveOrders.filter((o) => o.status === 'awaiting').length,
      },
      google: { clicks: 1240, delta_pct: 8, orders_from_search: 31 },
      revenue_series,
      schedule: liveOrders.filter((o) => o.slot !== 'Next day').map(decorate),
      pending_photos: liveOrders.filter((o) => o.status === 'awaiting').map(decorate),
    });
  }),

  http.get(`${API}/admin/orders`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    let items = liveOrders;
    if (status && status !== 'all') items = items.filter((o) => o.status === status);
    if (q)
      items = items.filter((o) =>
        [o.id, o.sender, o.recipient, o.product, o.area].join(' ').toLowerCase().includes(q),
      );
    const counts: Record<string, number> = { all: liveOrders.length };
    for (const o of liveOrders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return HttpResponse.json({ items: items.map(decorate), counts });
  }),

  http.get(`${API}/admin/orders/:id`, ({ params }) => {
    const o = liveOrders.find((x) => x.id === params.id);
    return o ? HttpResponse.json(decorate(o)) : new HttpResponse(null, { status: 404 });
  }),

  // Lifecycle transitions.
  ...(
    [
      ['accept', 'awaiting'],
      ['send-photo', 'photo-sent'],
      ['approve', 'approved'],
      ['dispatch', 'out-for-delivery'],
      ['deliver', 'delivered'],
      ['decline', 'declined'],
      ['refund', 'refunded'],
    ] as [string, AdminStatus][]
  ).map(([action, next]) =>
    http.post(`${API}/admin/orders/:id/${action}`, ({ params }) => {
      const o = liveOrders.find((x) => x.id === params.id);
      if (!o) return new HttpResponse(null, { status: 404 });
      o.status = next;
      return HttpResponse.json(decorate(o));
    }),
  ),

  http.post(`${API}/admin/orders/:id/photo`, ({ params }) => {
    const o = liveOrders.find((x) => x.id === params.id);
    if (!o) return new HttpResponse(null, { status: 404 });
    o.bouquet_photo = img(o.imageKey, 800, 800);
    return HttpResponse.json(decorate(o));
  }),

  http.get(`${API}/admin/products`, () =>
    HttpResponse.json({
      items: catalogue.map((c) => ({
        ...c,
        image: img(c.imageKey, 500, 375),
        price_range_cents: [
          Math.min(...c.variants.filter((v) => v.active).map((v) => v.price_cents)),
          Math.max(...c.variants.filter((v) => v.active).map((v) => v.price_cents)),
        ],
      })),
    }),
  ),

  http.patch(`${API}/admin/products/:slug`, async ({ params, request }) => {
    const c = catalogue.find((x) => x.slug === params.slug);
    if (!c) return new HttpResponse(null, { status: 404 });
    Object.assign(c, (await request.json()) as Record<string, unknown>);
    return HttpResponse.json(c);
  }),

  http.post(`${API}/admin/products`, async ({ request }) => {
    const body = (await request.json()) as { slug: string };
    catalogue.push({ ...(body as (typeof catalogue)[number]) });
    return HttpResponse.json(body, { status: 201 });
  }),

  http.post(`${API}/admin/products/bulk-price`, async ({ request }) => {
    const { tier, pct, apply } = (await request.json()) as {
      tier: string;
      pct: number;
      apply?: boolean;
    };
    const preview = catalogue.map((c) => {
      const v = c.variants.find((x) => x.tier === tier);
      const old_cents = v?.price_cents ?? 0;
      const new_cents = Math.round(old_cents * (1 + pct / 100));
      if (apply && v) v.price_cents = new_cents;
      return { slug: c.slug, name: c.name, old_cents, new_cents };
    });
    return HttpResponse.json({ preview, applied: !!apply });
  }),

  http.post(`${API}/admin/uploads/sign`, () =>
    HttpResponse.json({
      upload_url: 'https://mock-r2.romafiorita.com/upload',
      public_url: img('bouquet', 800, 800),
    }),
  ),

  // ---- Payments (OWNER/MANAGER only; the UI enforces the role) ----
  http.get(`${API}/admin/payments`, ({ request }) => {
    const url = new URL(request.url);
    const source = url.searchParams.get('source');
    const status = url.searchParams.get('status');
    const items = payments.filter(
      (p) => (!source || source === 'all' || p.source === source) && (!status || status === 'all' || p.status === status),
    );
    const sum = (f: (p: (typeof payments)[number]) => number) => payments.reduce((a, p) => a + f(p), 0);
    return HttpResponse.json({
      kpis: {
        gross_cents: sum((p) => p.amount_cents),
        fees_cents: sum((p) => p.fee_cents),
        refunds_cents: payments.filter((p) => p.status === 'refunded').reduce((a, p) => a + p.amount_cents, 0),
        net_cents: sum((p) => p.net_cents),
      },
      items,
    });
  }),
  http.get(`${API}/admin/payments/held`, () =>
    HttpResponse.json({ items: payments.filter((p) => p.status === 'held') }),
  ),
  http.post(`${API}/admin/payments/:id/capture`, ({ params }) => {
    const p = payments.find((x) => x.id === params.id);
    if (p) p.status = 'captured';
    return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${API}/admin/payments/:id/cancel-hold`, ({ params }) => {
    const p = payments.find((x) => x.id === params.id);
    if (p) p.status = 'failed';
    return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${API}/admin/payments/:id/refund`, async ({ params, request }) => {
    const p = payments.find((x) => x.id === params.id);
    if (!p) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as { amount_cents?: number; reason?: string };
    p.status = 'refunded';
    p.refunded_cents = Math.min(body.amount_cents ?? p.amount_cents, p.amount_cents);
    p.refund_reason = body.reason ?? '';
    return HttpResponse.json(p);
  }),
  http.get(`${API}/admin/payments/refunds`, () =>
    HttpResponse.json({ items: payments.filter((p) => p.status === 'refunded') }),
  ),
  // Accountant's monthly report → prebuilt CSV the client downloads (title configurable later).
  http.get(`${API}/admin/payments/reports/monthly`, ({ request }) => {
    const month = new URL(request.url).searchParams.get('month') ?? new Date().toISOString().slice(0, 7);
    const rows = payments.filter((p) => p.date.startsWith(month));
    const header = 'date,order,source,customer,country,method,amount,fee,net,status';
    const csv = [
      header,
      ...rows.map((p) =>
        [p.date, p.order_number, p.source, p.customer, p.country, p.method, p.amount_cents / 100, p.fee_cents / 100, p.net_cents / 100, p.status].join(','),
      ),
    ].join('\n');
    return HttpResponse.json({ month, filename: `roma-fiorita-${month}.csv`, csv });
  }),
  http.get(`${API}/admin/payouts`, () => HttpResponse.json({ items: payouts, balance })),
  http.get(`${API}/admin/disputes`, () => HttpResponse.json({ items: disputes })),

  http.get(`${API}/admin/insights/seo`, () => HttpResponse.json(insights)),

  http.get(`${API}/admin/settings`, () => HttpResponse.json(adminSettings)),
  http.patch(`${API}/admin/settings`, async ({ request }) => {
    Object.assign(adminSettings, (await request.json()) as Record<string, unknown>);
    return HttpResponse.json(adminSettings);
  }),

  // ---- Payment requests (custom orders) ----
  http.get(`${API}/admin/payment-requests`, ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const items =
      status && status !== 'all' ? paymentRequests.filter((p) => p.status === status) : paymentRequests;
    return HttpResponse.json({ items });
  }),
  http.post(`${API}/admin/payment-requests`, async ({ request }) => {
    const body = (await request.json()) as Partial<PaymentRequest> & {
      items: { title: string; price_cents: number }[];
      expiry_hours?: number;
      discount_cents?: number;
    };
    const total = Math.max(
      0,
      body.items.reduce((a, it) => a + it.price_cents, 0) - (body.discount_cents ?? 0),
    );
    const seq = String(24790 + paymentRequests.length + 1).padStart(5, '0');
    const token = `pay_${Math.random().toString(36).slice(2, 14)}`;
    const pr: PaymentRequest = {
      id: `pr_${paymentRequests.length + 1}`,
      order_number: `RF-2026-${seq}`,
      customer: body.customer ?? '',
      email: body.email ?? '',
      whatsapp: body.whatsapp ?? '',
      amount_cents: total,
      currency: 'EUR',
      status: 'sent',
      token,
      expires_at: new Date(Date.now() + (body.expiry_hours ?? 48) * 3600e3).toISOString(),
      last_viewed_at: null,
      items: body.items,
      recipient: body.recipient ?? '',
      delivery_slot: body.delivery_slot ?? '',
      card_message: body.card_message ?? '',
      discount_cents: body.discount_cents ?? 0,
      hide_sender: body.hide_sender ?? false,
    };
    paymentRequests.unshift(pr);
    return HttpResponse.json(pr, { status: 201 });
  }),
  http.post(`${API}/admin/payment-requests/:id/cancel`, ({ params }) => {
    const pr = paymentRequests.find((p) => p.id === params.id);
    if (pr) pr.status = 'cancelled';
    return pr ? HttpResponse.json(pr) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${API}/admin/payment-requests/:id/resend`, ({ params }) => {
    const pr = paymentRequests.find((p) => p.id === params.id);
    if (pr) pr.status = 'sent';
    return pr ? HttpResponse.json(pr) : new HttpResponse(null, { status: 404 });
  }),
  // Edit is only allowed before payment and regenerates the token (old link dies).
  http.patch(`${API}/admin/payment-requests/:id`, async ({ params, request }) => {
    const pr = paymentRequests.find((p) => p.id === params.id);
    if (!pr) return new HttpResponse(null, { status: 404 });
    if (pr.status === 'paid') return new HttpResponse(null, { status: 409 });
    const body = (await request.json()) as Partial<PaymentRequest> & {
      items?: { title: string; price_cents: number }[];
    };
    Object.assign(pr, body);
    if (body.items) pr.amount_cents = body.items.reduce((a, it) => a + it.price_cents, 0);
    pr.token = `pay_${Math.random().toString(36).slice(2, 14)}`;
    pr.status = 'sent';
    return HttpResponse.json(pr);
  }),
  http.post(`${API}/admin/payment-requests/:id/duplicate`, ({ params }) => {
    const src = paymentRequests.find((p) => p.id === params.id);
    if (!src) return new HttpResponse(null, { status: 404 });
    const seq = String(24790 + paymentRequests.length + 1).padStart(5, '0');
    const copy: PaymentRequest = {
      ...src,
      id: `pr_${paymentRequests.length + 1}`,
      order_number: `RF-2026-${seq}`,
      token: `pay_${Math.random().toString(36).slice(2, 14)}`,
      status: 'sent',
      last_viewed_at: null,
      expires_at: new Date(Date.now() + 48 * 3600e3).toISOString(),
    };
    paymentRequests.unshift(copy);
    return HttpResponse.json(copy, { status: 201 });
  }),
  // Branded "Order summary / Payment request" PDF (not "Invoice" — no VAT number yet).
  http.get(`${API}/admin/payment-requests/:id/pdf`, ({ params }) => {
    const pr = paymentRequests.find((p) => p.id === params.id);
    if (!pr) return new HttpResponse(null, { status: 404 });
    const text = `%PDF-1.4\nRoma Fiorita — Order summary / Payment request\n${pr.order_number} · ${(pr.amount_cents / 100).toFixed(2)} EUR\n`;
    return new HttpResponse(text, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${pr.order_number}.pdf"`,
      },
    });
  }),

  // ---- Public pay / verify ----
  http.get(`${API}/pay/:token`, ({ params }) => {
    const pr = paymentRequests.find((p) => p.token === params.token);
    if (!pr) return new HttpResponse(null, { status: 404 });
    if (pr.status === 'sent') pr.status = 'viewed';
    pr.last_viewed_at = new Date().toISOString();
    const expired = new Date(pr.expires_at).getTime() < Date.now();
    return HttpResponse.json({
      order_number: pr.order_number,
      items: pr.items,
      recipient: pr.recipient,
      delivery_slot: pr.delivery_slot,
      card_message: pr.card_message,
      amount_cents: pr.amount_cents,
      currency: pr.currency,
      // The backend owns FX (frontend never computes amounts). Demo estimate only.
      local_estimate: { currency: 'USD', amount_cents: Math.round(pr.amount_cents * 1.08) },
      status: expired && pr.status !== 'paid' ? 'expired' : pr.status,
      expires_at: pr.expires_at,
    });
  }),
  http.post(`${API}/pay/:token/intent`, ({ params }) => {
    const pr = paymentRequests.find((p) => p.token === params.token);
    if (!pr) return new HttpResponse(null, { status: 404 });
    pr.status = 'paid';
    return HttpResponse.json({ client_secret: `pi_mock_${pr.token}_secret`, order_number: pr.order_number });
  }),
  http.post(`${API}/verify`, async ({ request }) => {
    const { order_number, email } = (await request.json()) as { order_number: string; email: string };
    const pr = paymentRequests.find(
      (p) => p.order_number === order_number && p.email.toLowerCase() === email.toLowerCase(),
    );
    return HttpResponse.json(
      pr
        ? { genuine: true, order_number: pr.order_number, amount_cents: pr.amount_cents, status: pr.status }
        : { genuine: false },
    );
  }),
];
