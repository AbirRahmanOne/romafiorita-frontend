import type { Metadata } from 'next';
import { getPathname, routing, type Locale } from '@/i18n/routing';
import { business } from '@rf/mocks';

export const SITE = 'https://romafiorita.com';

type Href = Parameters<typeof getPathname>[0]['href'];

/**
 * Canonical + hreflang (en/it/x-default) for a typed route. metadataBase makes the
 * returned relative paths absolute. Keep the route map in i18n/routing so all three
 * agree. Do NOT call this for pay/verify — those are noindex and off the sitemap.
 */
export function altMeta(locale: Locale, href: Href): Metadata['alternates'] {
  return {
    canonical: getPathname({ locale, href }),
    languages: {
      en: getPathname({ locale: 'en', href }),
      it: getPathname({ locale: 'it', href }),
      'x-default': getPathname({ locale: 'en', href }),
    },
  };
}

/** localised path incl. locale prefix, for sitemap entries. */
export function pathFor(locale: Locale, href: Href): string {
  return getPathname({ locale, href });
}

export const allLocales = routing.locales;

type Dict = Record<string, unknown>;
const omitEmpty = (o: Dict): Dict =>
  Object.fromEntries(
    Object.entries(o).filter(
      ([, v]) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  );

/** Business identity fields come from config — empty ones are omitted (no fake P.IVA). */
export function organizationLd() {
  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: business.name || 'Roma Fiorita',
    url: SITE,
    telephone: business.phone,
    email: business.pec,
  });
}

export function floristLd(areaServed = 'Italia') {
  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: business.name || 'Roma Fiorita',
    url: SITE,
    telephone: business.phone,
    address: business.address,
    areaServed,
    priceRange: '€€',
  });
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
