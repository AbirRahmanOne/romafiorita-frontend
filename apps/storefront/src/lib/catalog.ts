import { products, occasions, reviews, addons, type Addon, type Product } from '@rf/mocks';

/**
 * Home-page data. In mock mode this reads the seed directly; swap to the generated
 * api-client (GET /v1/catalog/*, /v1/content/reviews) when the backend is live.
 * Reviews come back empty by design so the block hides (content-rules).
 */

const OCCASION_IMG: Record<string, string> = {
  love: 'photo-1533616688419-b7a585564566',
  birthday: 'photo-1522673607200-164d1b6ce486',
  thanks: 'photo-1562690868-60bbe7293e94',
  sympathy: 'photo-1561848355-890d054dc55a',
  baby: 'photo-1582794543139-8ac9cb0f7b11',
  getwell: 'photo-1763073064881-9bf81eadd3e2',
};

const unsplash = (id: string, w = 600, h = 750) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=75&auto=format`;

export interface HomeOccasion {
  slug: string;
  name_en: string;
  name_it: string;
  img: string;
}

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByOccasion(slug: string): Product[] {
  return products.filter((p) => p.occasion === slug);
}

export function getRelated(slug: string, limit = 4): Product[] {
  const self = getProduct(slug);
  return products
    .filter((p) => p.slug !== slug && (!self || p.category === self.category))
    .concat(products.filter((p) => p.slug !== slug))
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, limit);
}

export function getAddons(): Addon[] {
  return addons;
}

export function occasionName(slug: string, locale: string): string {
  const o = occasions.find((x) => x.slug === slug);
  if (!o) return slug;
  return locale === 'it' ? o.name_it : o.name_en;
}

export function getOccasions(): HomeOccasion[] {
  return occasions.map((o) => ({
    ...o,
    img: unsplash(OCCASION_IMG[o.slug] ?? 'photo-1522673607200-164d1b6ce486'),
  }));
}

export function getReviews(): unknown[] {
  return reviews;
}

/** Lowest active-tier price in cents (for "from €X" cards). */
export function fromPriceCents(product: Product): number {
  const active = product.variants.filter((v) => v.active);
  return Math.min(...active.map((v) => v.price_cents));
}

export function activeTierCount(product: Product): number {
  return product.variants.filter((v) => v.active).length;
}
