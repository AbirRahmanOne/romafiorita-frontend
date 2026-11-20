import type {
  AdminOrder,
  AdminStatus,
  Payment,
  PaymentRequest,
  Tier,
  Variant,
} from '@rf/mocks';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/v1/admin${path}`, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export type DecoratedOrder = AdminOrder & { thumb: string; image: string };

export interface Dashboard {
  kpis: {
    revenue_today_cents: number;
    orders_today: number;
    on_time_pct: number;
    photos_to_send: number;
  };
  google: { clicks: number; delta_pct: number; orders_from_search: number };
  revenue_series: { day: number; revenue_cents: number }[];
  schedule: DecoratedOrder[];
  pending_photos: DecoratedOrder[];
}

export interface ProductRow {
  slug: string;
  name: string;
  image: string;
  variants: Variant[];
  occasion: string;
  sold_this_week: number;
  stock: number;
  active: boolean;
  same_day: boolean;
  exact_time: boolean;
  seo_title: string;
  seo_description: string;
  price_range_cents: [number, number];
}

export interface BulkPricePreview {
  preview: { slug: string; name: string; old_cents: number; new_cents: number }[];
  applied: boolean;
}

export const adminApi = {
  dashboard: () => req<Dashboard>('/dashboard'),
  orders: (status: string, q: string) =>
    req<{ items: DecoratedOrder[]; counts: Record<string, number> }>(
      `/orders?status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`,
    ),
  order: (id: string) => req<DecoratedOrder>(`/orders/${id}`),
  transition: (id: string, action: string, body?: unknown) =>
    req<DecoratedOrder>(`/orders/${id}/${action}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  products: () => req<{ items: ProductRow[] }>('/products'),
  patchProduct: (slug: string, patch: Partial<ProductRow>) =>
    req<ProductRow>(`/products/${slug}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  bulkPrice: (tier: Tier, pct: number, apply: boolean) =>
    req<BulkPricePreview>('/products/bulk-price', {
      method: 'POST',
      body: JSON.stringify({ tier, pct, apply }),
    }),
  signUpload: () =>
    req<{ upload_url: string; public_url: string }>('/uploads/sign', { method: 'POST' }),

  payments: (source: string, status: string) =>
    req<{ kpis: PaymentKpis; items: Payment[] }>(
      `/payments?source=${encodeURIComponent(source)}&status=${encodeURIComponent(status)}`,
    ),
  capturePayment: (id: string) => req<Payment>(`/payments/${id}/capture`, { method: 'POST' }),
  cancelHold: (id: string) => req<Payment>(`/payments/${id}/cancel-hold`, { method: 'POST' }),
  refundPayment: (id: string, amount_cents: number, reason: string) =>
    req<Payment>(`/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount_cents, reason }),
    }),
  monthlyReport: (month?: string) =>
    req<{ month: string; filename: string; csv: string }>(
      `/payments/reports/monthly${month ? `?month=${month}` : ''}`,
    ),
  payouts: () => req<{ items: Payout[]; balance: Balance }>('/payouts'),
  disputes: () => req<{ items: Dispute[] }>('/disputes'),

  insights: () => req<Insights>('/insights/seo'),

  settings: () => req<Settings>('/settings'),
  patchSettings: (patch: Partial<Settings>) =>
    req<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),

  paymentRequests: (status: string) =>
    req<{ items: PaymentRequest[] }>(`/payment-requests?status=${encodeURIComponent(status)}`),
  createPaymentRequest: (body: CreatePaymentRequest) =>
    req<PaymentRequest>('/payment-requests', { method: 'POST', body: JSON.stringify(body) }),
  cancelPaymentRequest: (id: string) =>
    req<PaymentRequest>(`/payment-requests/${id}/cancel`, { method: 'POST' }),
  resendPaymentRequest: (id: string) =>
    req<PaymentRequest>(`/payment-requests/${id}/resend`, { method: 'POST' }),
  duplicatePaymentRequest: (id: string) =>
    req<PaymentRequest>(`/payment-requests/${id}/duplicate`, { method: 'POST' }),
  updatePaymentRequest: (id: string, body: Partial<CreatePaymentRequest>) =>
    req<PaymentRequest>(`/payment-requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  paymentRequestPdf: async (id: string) => {
    const res = await fetch(`${BASE}/v1/admin/payment-requests/${id}/pdf`, { credentials: 'include' });
    if (!res.ok) throw new Error(`pdf ${res.status}`);
    return res.blob();
  },
};

export interface PaymentKpis {
  gross_cents: number;
  fees_cents: number;
  refunds_cents: number;
  net_cents: number;
}
export interface Payout {
  id: string;
  date: string;
  amount_cents: number;
  status: string;
}
export interface Balance {
  available_cents: number;
  pending_cents: number;
}
export interface Dispute {
  id: string;
  order_number: string;
  amount_cents: number;
  reason: string;
  deadline: string;
  status: string;
}
export interface Insights {
  kpis: { label: string; value: string; delta: string }[];
  clicks: number[];
  impressions: number[];
  health: {
    indexed: number;
    total: number;
    crawl_errors: number;
    vitals: { k: string; v: string; ok: boolean }[];
    sitemap: string;
  };
  queries: { q: string; c: number; i: number; ctr: string; p: number }[];
  landing: { p: string; note: string; v: number; o: number; r: string }[];
  keywords: { kw: string; lang: string; pos: number; change: number; page: string }[];
}
export interface Settings {
  zones: { name: string; type: string; fee_cents: number }[];
  slot_pricing: { window_cents: number; exact_cents: number };
  cutoffs: { rome_hour: number; suburbs_hour: number };
  blocked_dates: string[];
  daily_capacity: number;
  notification_recipients: string[];
  staff: { name: string; role: string }[];
}
export interface CreatePaymentRequest {
  customer: string;
  email: string;
  whatsapp: string;
  recipient: string;
  delivery_slot: string;
  card_message: string;
  items: { title: string; price_cents: number }[];
  expiry_hours: number;
  discount_cents?: number;
  hide_sender?: boolean;
}

export type { AdminStatus };
