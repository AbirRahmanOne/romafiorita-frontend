/**
 * Seed data derived from the design prototypes. Money is integer cents.
 * Reviews/ratings/stats are intentionally empty (see content-rules skill) so the
 * UI hides those blocks rather than shipping invented social proof.
 */

export type Tier = 'STANDARD' | 'PREMIUM' | 'LUXURY';

export interface Variant {
  id: string;
  tier: Tier;
  price_cents: number;
  description_it: string;
  description_en: string;
  images: string[];
  active: boolean;
  is_default: boolean;
  same_day: boolean;
  exact_time: boolean;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  occasion: string;
  category: 'Roses' | 'Seasonal' | 'Dried';
  tags: string[];
  images: string[];
  variants: Variant[];
}

const UNSPLASH: Record<string, string> = {
  redroses: 'photo-1589095181425-c038b3871b6a',
  bouquet: 'photo-1572454591674-2739f30d8c40',
  orchid: 'photo-1561848355-890d054dc55a',
  peony: 'photo-1561181286-d3fee7d55364',
  tulips: 'photo-1776193550326-fb87ffba0442',
  sunflowers: 'photo-1778101410311-6cca527142d6',
  whiteroses: 'photo-1523693916903-027d144a2b7d',
  olivetree: 'photo-1763073064881-9bf81eadd3e2',
  dried: 'photo-1622658641558-235f26dd270b',
};

export const img = (key: string, w = 600, h = 750): string =>
  `https://images.unsplash.com/${UNSPLASH[key] ?? UNSPLASH.bouquet}?w=${w}&h=${h}&fit=crop&q=75&auto=format`;

/** Three fixed tiers around a Premium base price (cents). Ascending. */
function tiers(slug: string, key: string, premiumCents: number, descs: [string, string][]): Variant[] {
  const spec: { tier: Tier; cents: number; def: boolean }[] = [
    { tier: 'STANDARD', cents: Math.round(premiumCents * 0.8), def: false },
    { tier: 'PREMIUM', cents: premiumCents, def: true },
    { tier: 'LUXURY', cents: Math.round(premiumCents * 1.4), def: false },
  ];
  return spec.map((s, i) => ({
    id: `${slug}-${s.tier.toLowerCase()}`,
    tier: s.tier,
    price_cents: s.cents,
    description_en: descs[i]?.[0] ?? '',
    description_it: descs[i]?.[1] ?? '',
    images: [img(key)],
    active: true,
    is_default: s.def,
    same_day: true,
    exact_time: true,
  }));
}

export const products: Product[] = [
  {
    slug: 'rosa-classica',
    name: 'Rosa Classica',
    subtitle: 'Long-stem red roses, hand-tied',
    occasion: 'love',
    category: 'Roses',
    tags: ['Same-day', 'Exact time'],
    images: [img('redroses')],
    variants: tiers('rosa-classica', 'redroses', 4900, [
      ['12 long-stem red roses', '12 rose rosse a stelo lungo'],
      ['18 long-stem red roses', '18 rose rosse a stelo lungo'],
      ['24 red roses + premium wrap', '24 rose rosse + confezione premium'],
    ]),
  },
  {
    slug: 'giardino-dautunno',
    name: "Giardino d'autunno",
    subtitle: 'Garden roses, dahlias, eucalyptus',
    occasion: 'birthday',
    category: 'Seasonal',
    tags: ['Same-day'],
    images: [img('bouquet')],
    variants: tiers('giardino-dautunno', 'bouquet', 5800, [
      ['Seasonal garden bouquet', 'Mazzo di stagione'],
      ['Larger garden bouquet', 'Mazzo di stagione grande'],
      ['Deluxe garden bouquet', 'Mazzo di stagione deluxe'],
    ]),
  },
  {
    slug: 'peonia-rosa',
    name: 'Peonia Rosa',
    subtitle: 'Blush peonies',
    occasion: 'love',
    category: 'Seasonal',
    tags: ['Same-day', 'Exact time'],
    images: [img('peony')],
    variants: tiers('peonia-rosa', 'peony', 6500, [
      ['10 blush peonies', '10 peonie rosa'],
      ['15 blush peonies', '15 peonie rosa'],
      ['24 blush peonies', '24 peonie rosa'],
    ]),
  },
  {
    slug: 'fiori-secchi',
    name: 'Fiori Secchi',
    subtitle: 'Dried bouquet, lasts 12+ months',
    occasion: 'thanks',
    category: 'Dried',
    tags: ['Courier'],
    images: [img('dried')],
    variants: tiers('fiori-secchi', 'dried', 4500, [
      ['Small dried bouquet', 'Mazzo secco piccolo'],
      ['Medium dried bouquet', 'Mazzo secco medio'],
      ['Large dried bouquet', 'Mazzo secco grande'],
    ]),
  },
];

export interface Addon {
  id: string;
  name_en: string;
  name_it: string;
  price_cents: number;
}

export const addons: Addon[] = [
  { id: 'card', name_en: 'Handwritten card', name_it: 'Biglietto scritto a mano', price_cents: 0 },
  { id: 'chocolates', name_en: 'Box of chocolates', name_it: 'Scatola di cioccolatini', price_cents: 1200 },
  { id: 'vase', name_en: 'Glass vase', name_it: 'Vaso di vetro', price_cents: 1800 },
];

export const occasions = [
  { slug: 'love', name_en: 'Love & anniversary', name_it: 'Amore e anniversario' },
  { slug: 'birthday', name_en: 'Birthday', name_it: 'Compleanno' },
  { slug: 'thanks', name_en: 'Thank you', name_it: 'Grazie' },
  { slug: 'sympathy', name_en: 'Sympathy', name_it: 'Cordoglio' },
  { slug: 'baby', name_en: 'New baby', name_it: 'Nuovo arrivo' },
  { slug: 'getwell', name_en: 'Get well', name_it: 'Pronta guarigione' },
];

export type AdminStatus =
  | 'new'
  | 'awaiting'
  | 'photo-sent'
  | 'approved'
  | 'out-for-delivery'
  | 'delivered'
  | 'declined'
  | 'refunded';

export interface AdminOrder {
  id: string;
  placed: string;
  sender: string;
  country: string;
  email: string;
  recipient: string;
  area: string;
  address: string;
  product: string;
  tier: Tier;
  imageKey: string;
  slot: string;
  rider: string;
  total_cents: number;
  status: AdminStatus;
  card_message: string;
  bouquet_photo: string | null;
}

const email = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@mail.com`;

/** Rome placeholders only — no Florence leftovers (content-rules). */
export const adminOrders: AdminOrder[] = [
  ['RF-2026-24833', '11:20', 'Tanvir Ahmed', 'Bangladesh', 'Sara Moretti', 'EUR', 'Viale Europa 21, 00144', 'Tramonto', 'tulips', '16:30', 4200, 'new', 'Sara', 'Congratulations on the new job! Proud of you.'],
  ['RF-2026-24835', '11:48', 'Claire Dubois', 'France', 'Marta Galli', 'Testaccio', 'Via Marmorata 40, 00153', 'Avorio', 'orchid', '17:45', 7100, 'awaiting', 'Marco', 'Get well soon — the office isn’t the same without you.'],
  ['RF-2026-24838', '12:15', 'Daniel Kim', 'South Korea', 'Lucia Ferri', 'San Lorenzo', 'Via dei Volsci 12, 00185', 'Peonia Rosa', 'peony', '19:30', 6500, 'awaiting', 'Luca', '100 days together. Many more to come.'],
  ['RF-2026-24821', '09:40', 'Jonas Müller', 'Germany', 'Giulia Conti', 'Prati', 'Via Cola di Rienzo 88, 00192', 'Peonia Rosa', 'peony', '12:30', 7400, 'photo-sent', 'Luca', 'Happy birthday, amore.'],
  ['RF-2026-24826', '10:05', 'Priya Shah', 'United Kingdom', 'Elena Rossi', 'Monti', 'Via del Boschetto 9, 00184', "Giardino d'autunno", 'bouquet', '13:15', 5800, 'approved', 'Luca', 'Thank you for everything this year.'],
  ['RF-2026-24817', '08:12', 'Sofia Ricci', 'Canada', 'Anna Ricci', 'Trastevere', 'Via della Lungaretta 14, 00153', 'Rosa Classica', 'redroses', '09:00', 4900, 'out-for-delivery', 'Marco', 'Buon compleanno, mamma.'],
  ['RF-2026-24812', '07:50', 'Olivia Martin', 'Australia', 'Paola Esposito', 'Testaccio', 'Via Galvani 55, 00153', 'Campo Toscano', 'olivetree', 'Next day', 5400, 'delivered', 'Courier', 'For your new garden. Love from Sydney.'],
].map(
  ([id, placed, sender, country, recipient, area, address, product, imageKey, slot, total, status, rider, card]) => ({
    id: id as string,
    placed: placed as string,
    sender: sender as string,
    country: country as string,
    email: email(sender as string),
    recipient: recipient as string,
    area: area as string,
    address: address as string,
    product: product as string,
    tier: 'PREMIUM' as Tier,
    imageKey: imageKey as string,
    slot: slot as string,
    rider: rider as string,
    total_cents: total as number,
    status: status as AdminStatus,
    card_message: card as string,
    bouquet_photo: null,
  }),
);

/** Admin catalogue rows: product + ops metadata (sold this week, cold-room stock). */
export const adminCatalogue = products.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  imageKey: ['redroses', 'bouquet', 'peony', 'dried'][i] ?? 'bouquet',
  variants: p.variants,
  occasion: p.occasion,
  sold_this_week: [142, 96, 118, 45][i] ?? 0,
  stock: [310, 180, 64, 22][i] ?? 0,
  active: true,
  same_day: true,
  exact_time: p.variants.some((v) => v.exact_time),
  seo_title: '',
  seo_description: '',
}));

/** Shop settings — cut-off and city come from here, never hard-coded in UI. */
export const settings = {
  city: 'Roma',
  same_day_cutoff_hour: 16, // Europe/Rome; the backend owns the real value
  timezone: 'Europe/Rome',
};

/** Empty by default — never fabricate reviews/stats (content-rules). */
export const reviews: unknown[] = [];
export const stats = { bouquets_sent: null, countries: null, founded_year: null };
export const business = { name: '', address: '', piva: '', pec: '', phone: '', whatsapp: '', payment_methods: [] as string[] };
