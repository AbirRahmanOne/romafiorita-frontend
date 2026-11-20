/**
 * SEO landing content. Cities and Rome neighbourhoods are real geography — the copy
 * is templated per place in the storefront i18n files, so nothing here is fabricated
 * social proof. Journal is EMPTY by design (like reviews): articles are real editorial
 * content the client writes via the CMS/API. Never ship invented blog posts.
 */

export interface City {
  slug: string;
  name: string;
  zone: 'ROME' | 'NATIONAL';
}

/** Rome first (own riders, same-day); the rest are next-day courier. */
export const cities: City[] = [
  { slug: 'roma', name: 'Roma', zone: 'ROME' },
  { slug: 'milano', name: 'Milano', zone: 'NATIONAL' },
  { slug: 'firenze', name: 'Firenze', zone: 'NATIONAL' },
  { slug: 'napoli', name: 'Napoli', zone: 'NATIONAL' },
  { slug: 'bologna', name: 'Bologna', zone: 'NATIONAL' },
  { slug: 'torino', name: 'Torino', zone: 'NATIONAL' },
  { slug: 'venezia', name: 'Venezia', zone: 'NATIONAL' },
  { slug: 'palermo', name: 'Palermo', zone: 'NATIONAL' },
];

export interface RomeArea {
  slug: string;
  name: string;
}

export const romeAreas: RomeArea[] = [
  { slug: 'trastevere', name: 'Trastevere' },
  { slug: 'prati', name: 'Prati' },
  { slug: 'parioli', name: 'Parioli' },
  { slug: 'monti', name: 'Monti' },
  { slug: 'testaccio', name: 'Testaccio' },
  { slug: 'eur', name: 'EUR' },
  { slug: 'centro-storico', name: 'Centro Storico' },
];

export interface JournalPost {
  slug: string;
  title_en: string;
  title_it: string;
  date: string; // ISO
  excerpt_en: string;
  excerpt_it: string;
  body_en: string;
  body_it: string;
  cover: string;
}

/** Empty by design — real articles come from the CMS/API (see docs/content-todo.md). */
export const journal: JournalPost[] = [];
