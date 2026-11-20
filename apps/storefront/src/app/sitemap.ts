import type { MetadataRoute } from 'next';
import { cities, journal, occasions, products, romeAreas } from '@rf/mocks';
import { pathFor, SITE } from '@/lib/seo';
import { routing } from '@/i18n/routing';

type Href = Parameters<typeof pathFor>[1];

/** Indexable routes only. pay/verify/cart/checkout/track/confirmation are excluded. */
function routes(): Href[] {
  return [
    '/',
    '/bouquets',
    '/flower-delivery-rome',
    '/send-flowers-to-italy',
    '/journal',
    '/delivery',
    '/faq',
    '/about',
    '/contact',
    ...occasions.map((o) => ({ pathname: '/occasions/[slug]', params: { slug: o.slug } }) as Href),
    ...products.map((p) => ({ pathname: '/product/[slug]', params: { slug: p.slug } }) as Href),
    ...romeAreas.map(
      (a) => ({ pathname: '/flower-delivery-rome/[area]', params: { area: a.slug } }) as Href,
    ),
    ...cities
      .filter((c) => c.zone !== 'ROME')
      .map((c) => ({ pathname: '/city/[slug]', params: { slug: c.slug } }) as Href),
    ...journal.map((p) => ({ pathname: '/journal/[slug]', params: { slug: p.slug } }) as Href),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes().flatMap((href) => {
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE}${pathFor(l, href)}`]),
    );
    return routing.locales.map((locale) => ({
      url: `${SITE}${pathFor(locale, href)}`,
      lastModified: new Date(),
      alternates: { languages },
    }));
  });
}
