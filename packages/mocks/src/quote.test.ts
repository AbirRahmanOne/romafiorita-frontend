import { describe, expect, it } from 'vitest';
import { computeQuote } from './quote';

describe('computeQuote', () => {
  it('sums variant prices by quantity', () => {
    const q = computeQuote({ items: [{ variant_id: 'rosa-classica-premium', quantity: 2 }] });
    expect(q.subtotal_cents).toBe(9800);
    expect(q.total_cents).toBe(9800); // standard delivery, no time fee
  });

  it('adds the exact-time fee', () => {
    const q = computeQuote({
      items: [{ variant_id: 'rosa-classica-standard', quantity: 1 }],
      delivery_type: 'exact',
    });
    expect(q.time_fee_cents).toBe(900);
    expect(q.total_cents).toBe(q.subtotal_cents + 900);
  });

  it('includes add-on prices per unit', () => {
    const base = computeQuote({ items: [{ variant_id: 'rosa-classica-premium', quantity: 2 }] });
    const withAddons = computeQuote({
      items: [{ variant_id: 'rosa-classica-premium', quantity: 2, addons: ['chocolates', 'vase'] }],
    });
    // (1200 + 1800) added per unit × 2
    expect(withAddons.subtotal_cents).toBe(base.subtotal_cents + (1200 + 1800) * 2);
  });

  it('throws on an unknown variant', () => {
    expect(() => computeQuote({ items: [{ variant_id: 'nope', quantity: 1 }] })).toThrow();
  });
});
