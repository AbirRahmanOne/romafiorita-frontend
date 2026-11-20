import { products, addons } from './seed';

export interface QuoteItem {
  variant_id: string;
  quantity: number;
  addons?: string[];
}
export interface QuoteInput {
  items: QuoteItem[];
  delivery_type?: 'standard' | 'window' | 'exact' | 'courier';
}
export interface Quote {
  subtotal_cents: number;
  delivery_cents: number;
  time_fee_cents: number;
  total_cents: number;
  currency: 'EUR';
}

/** Time fees in cents. Delivery is all-in (0); window/exact add a fee. */
const TIME_FEE = { standard: 0, courier: 0, window: 500, exact: 900 } as const;

const variantPrice = (id: string): number => {
  for (const p of products) {
    const v = p.variants.find((x) => x.id === id);
    if (v) return v.price_cents;
  }
  throw new Error(`unknown variant_id: ${id}`);
};

const addonPrice = (id: string): number => addons.find((a) => a.id === id)?.price_cents ?? 0;

/** Server-side total. The frontend must display this, never compute its own. */
export function computeQuote({ items, delivery_type = 'standard' }: QuoteInput): Quote {
  const subtotal_cents = items.reduce((sum, it) => {
    const addonTotal = (it.addons ?? []).reduce((a, id) => a + addonPrice(id), 0);
    return sum + (variantPrice(it.variant_id) + addonTotal) * it.quantity;
  }, 0);
  const time_fee_cents = TIME_FEE[delivery_type];
  return {
    subtotal_cents,
    delivery_cents: 0,
    time_fee_cents,
    total_cents: subtotal_cents + time_fee_cents,
    currency: 'EUR',
  };
}
