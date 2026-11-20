import { ensureMocks } from './mocks-client';
import type { Quote } from '@rf/mocks';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureMocks();
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export interface DeliveryCheck {
  zone: 'ROME' | 'NATIONAL';
  types: ('standard' | 'window' | 'exact' | 'courier')[];
  fees: { standard_cents: number; window_cents: number; exact_cents: number };
  cutoff: string | null;
}
export interface Slot {
  time: string;
  available: boolean;
}
export interface CheckoutResult extends Quote {
  order_number: string;
  token: string;
  client_secret: string;
}
export interface TrackResult {
  order_number: string;
  status: string;
  timeline: { status: string; done: boolean }[];
  bouquet_photo: string | null;
  delivery_slot: string;
  total_cents: number;
  items: { name: string; tier: string }[];
}

export interface QuoteBody {
  items: { variant_id: string; quantity: number; addons?: string[] }[];
  delivery_type?: 'standard' | 'window' | 'exact' | 'courier';
}

export const api = {
  checkDelivery: (postcode: string, date?: string) =>
    request<DeliveryCheck>(
      `/v1/delivery/check?postcode=${encodeURIComponent(postcode)}${date ? `&date=${date}` : ''}`,
    ),
  slots: (postcode: string, date?: string) =>
    request<{ slots: Slot[] }>(
      `/v1/delivery/slots?postcode=${encodeURIComponent(postcode)}${date ? `&date=${date}` : ''}`,
    ),
  quote: (body: QuoteBody) =>
    request<Quote>('/v1/cart/quote', { method: 'POST', body: JSON.stringify(body) }),
  checkout: (body: QuoteBody & { delivery_slot?: string }) =>
    request<CheckoutResult>('/v1/checkout', { method: 'POST', body: JSON.stringify(body) }),
  track: (token: string) => request<TrackResult>(`/v1/orders/track/${encodeURIComponent(token)}`),
  payGet: (token: string) => request<PaySummary>(`/v1/pay/${encodeURIComponent(token)}`),
  payIntent: (token: string) =>
    request<{ client_secret: string; order_number: string }>(
      `/v1/pay/${encodeURIComponent(token)}/intent`,
      { method: 'POST' },
    ),
  verify: (order_number: string, email: string) =>
    request<VerifyResult>('/v1/verify', {
      method: 'POST',
      body: JSON.stringify({ order_number, email }),
    }),
};

export interface PaySummary {
  order_number: string;
  items: { title: string; price_cents: number }[];
  recipient: string;
  delivery_slot: string;
  card_message: string;
  amount_cents: number;
  currency: string;
  /** Backend-computed FX estimate in the customer's currency (frontend never computes amounts). */
  local_estimate?: { currency: string; amount_cents: number };
  status: 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled';
  expires_at: string;
}
export interface VerifyResult {
  genuine: boolean;
  order_number?: string;
  amount_cents?: number;
  status?: string;
}
