/** Phase 5 mock data: payments, insights, settings, payment requests. Money in cents. */

export type PaymentSource = 'website' | 'phone' | 'custom';
export type PaymentStatus = 'held' | 'captured' | 'failed' | 'refunded' | 'disputed';
export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'klarna';

export interface Payment {
  id: string;
  date: string;
  order_number: string;
  source: PaymentSource;
  customer: string;
  country: string;
  method: PaymentMethod;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  status: PaymentStatus;
  hold_expires_at?: string;
  refunded_cents?: number;
  refund_reason?: string;
}

const daysFromNow = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

export const payments: Payment[] = [
  ['pay_1', '2026-10-24', 'RF-2026-24833', 'website', 'Tanvir Ahmed', 'Bangladesh', 'card', 4200, 180, 4020, 'held', daysFromNow(6)],
  ['pay_2', '2026-10-24', 'RF-2026-24835', 'website', 'Claire Dubois', 'France', 'paypal', 7100, 290, 6810, 'held', daysFromNow(12)],
  ['pay_3', '2026-10-24', 'RF-2026-24821', 'website', 'Jonas Müller', 'Germany', 'klarna', 7400, 340, 7060, 'captured'],
  ['pay_4', '2026-10-23', 'RF-2026-24817', 'website', 'Sofia Ricci', 'Canada', 'apple_pay', 4900, 200, 4700, 'captured'],
  ['pay_5', '2026-10-23', 'RF-2026-24812', 'phone', 'Olivia Martin', 'Australia', 'card', 5400, 220, 5180, 'captured'],
  ['pay_6', '2026-10-22', 'RF-2026-24790', 'custom', 'Mei Chen', 'Singapore', 'card', 12800, 480, 12320, 'captured'],
  ['pay_7', '2026-10-22', 'RF-2026-24781', 'website', 'Lucas Silva', 'Brazil', 'google_pay', 3900, 170, 3730, 'refunded'],
  ['pay_8', '2026-10-21', 'RF-2026-24770', 'website', 'Daniel Kim', 'South Korea', 'card', 6500, 260, 6240, 'disputed'],
].map(
  ([id, date, order_number, source, customer, country, method, amount, fee, net, status, hold]) =>
    ({
      id,
      date,
      order_number,
      source,
      customer,
      country,
      method,
      amount_cents: amount,
      fee_cents: fee,
      net_cents: net,
      status,
      ...(hold ? { hold_expires_at: hold } : {}),
    }) as Payment,
);

export const payouts = [
  { id: 'po_1', date: '2026-10-20', amount_cents: 184200, status: 'paid' },
  { id: 'po_2', date: '2026-10-27', amount_cents: 96400, status: 'pending' },
];

export const balance = { available_cents: 96400, pending_cents: 21880 };

export const disputes = [
  {
    id: 'dp_1',
    order_number: 'RF-2026-24770',
    amount_cents: 6500,
    reason: 'product_not_received',
    deadline: daysFromNow(4),
    status: 'needs_response',
  },
];

/** SEO insights (Search Console) — mirrors the design's shape. */
function series(n: number, base: number, growth: number) {
  return Array.from({ length: n }, (_, i) => Math.round(base + i * growth + ((i * 37) % 11) * (base * 0.01)));
}
export const insights = {
  kpis: [
    { label: 'Organic visitors', value: '4,820', delta: '▲ 14% vs previous 28 days' },
    { label: 'Orders from Google', value: '126', delta: '▲ 9% · 2.6% conversion' },
    { label: 'Organic revenue', value: '€8,940', delta: '▲ 11% vs previous period' },
    { label: 'Avg. Google position', value: '12.4', delta: '▲ improved 2.1 positions' },
  ],
  clicks: series(28, 96, 1.4),
  impressions: series(28, 2900, 26),
  health: {
    indexed: 142,
    total: 150,
    crawl_errors: 3,
    vitals: [
      { k: 'LCP', v: '2.1s', ok: true },
      { k: 'INP', v: '180ms', ok: true },
      { k: 'CLS', v: '0.12', ok: false },
    ],
    sitemap: 'Last read 2 days ago',
  },
  queries: [
    { q: 'consegna fiori roma', c: 412, i: 8900, ctr: '4.6%', p: 3.2 },
    { q: 'send flowers to rome', c: 288, i: 14300, ctr: '2.0%', p: 7.8 },
    { q: 'fioraio roma', c: 241, i: 6100, ctr: '4.0%', p: 4.1 },
    { q: 'flower delivery italy', c: 198, i: 5400, ctr: '3.7%', p: 9.5 },
    { q: 'rose rosse a domicilio roma', c: 156, i: 3200, ctr: '4.9%', p: 2.9 },
  ],
  landing: [
    { p: '/', note: '(Home)', v: 1640, o: 41, r: '€2,870' },
    { p: '/bouquet/rosa-classica', note: '', v: 720, o: 28, r: '€1,960' },
    { p: '/consegna-fiori-roma', note: '', v: 610, o: 19, r: '€1,330' },
    { p: '/send-flowers-to-italy', note: '', v: 540, o: 22, r: '€1,780' },
  ],
  keywords: [
    { kw: 'fiori a domicilio roma', lang: 'IT', pos: 4.2, change: 1.8, page: '/consegna-fiori-roma' },
    { kw: 'consegna fiori oggi roma', lang: 'IT', pos: 6.1, change: 2.4, page: '/consegna-fiori-roma' },
    { kw: 'send flowers to italy from abroad', lang: 'EN', pos: 5.3, change: 3.1, page: '/send-flowers-to-italy' },
    { kw: 'anniversary flowers rome', lang: 'EN', pos: 11.4, change: 0.9, page: '/occasions/anniversary' },
    { kw: 'birthday flowers italy delivery', lang: 'EN', pos: 14.2, change: -2.3, page: '/occasions/birthday' },
  ],
};

export const adminSettings = {
  zones: [
    { name: 'Roma (own riders)', type: 'ROME', fee_cents: 0 },
    { name: 'Rest of Italy (courier)', type: 'NATIONAL', fee_cents: 0 },
  ],
  slot_pricing: { window_cents: 500, exact_cents: 900 },
  cutoffs: { rome_hour: 16, suburbs_hour: 13 },
  blocked_dates: ['2026-12-25', '2026-01-01'],
  daily_capacity: 40,
  notification_recipients: ['ordini@romafiorita.com'],
  staff: [
    { name: 'Owner', role: 'OWNER' },
    { name: 'Manager', role: 'MANAGER' },
    { name: 'Florist', role: 'FLORIST' },
    { name: 'Rider', role: 'RIDER' },
  ],
};

export type PaymentRequestStatus = 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled';
export interface PaymentRequest {
  id: string;
  order_number: string;
  customer: string;
  email: string;
  whatsapp: string;
  amount_cents: number;
  currency: 'EUR';
  status: PaymentRequestStatus;
  token: string;
  expires_at: string;
  last_viewed_at: string | null;
  items: { title: string; price_cents: number }[];
  recipient: string;
  delivery_slot: string;
  card_message: string;
  discount_cents?: number;
  hide_sender?: boolean;
}

export const paymentRequests: PaymentRequest[] = [
  {
    id: 'pr_1',
    order_number: 'RF-2026-24790',
    customer: 'Sofia Greco',
    email: 'sofia.greco@mail.com',
    whatsapp: '+391234567890',
    amount_cents: 8400,
    currency: 'EUR',
    status: 'viewed',
    token: 'pay_demotoken123',
    expires_at: daysFromNow(2),
    last_viewed_at: new Date().toISOString(),
    items: [{ title: 'Custom bridal bouquet', price_cents: 8400 }],
    recipient: 'Aurora Greco · Monti',
    delivery_slot: 'Sat 24 Oct · 11:00',
    card_message: 'Con tutto il mio amore.',
  },
];
