import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { romeAreas, settings } from '@rf/mocks';
import { getProducts } from '@/lib/catalog';
import { altMeta, breadcrumbLd, floristLd, JsonLd, pathFor } from '@/lib/seo';
import { Landing } from '@/components/sections/landing';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return romeAreas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; area: string }>;
}): Promise<Metadata> {
  const { locale, area } = await params;
  const found = romeAreas.find((a) => a.slug === area);
  if (!found) return {};
  const t = await getTranslations({ locale, namespace: 'landing' });
  return {
    title: t('area.title', { area: found.name, city: settings.city }),
    description: t('area.intro', { area: found.name, city: settings.city }),
    alternates: altMeta(locale, { pathname: '/flower-delivery-rome/[area]', params: { area } }),
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ locale: Locale; area: string }>;
}) {
  const { locale, area } = await params;
  setRequestLocale(locale);
  const found = romeAreas.find((a) => a.slug === area);
  if (!found) notFound();

  const t = await getTranslations('landing');
  const city = settings.city;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: pathFor(locale, '/') },
          { name: city, path: pathFor(locale, '/flower-delivery-rome') },
          {
            name: found.name,
            path: pathFor(locale, { pathname: '/flower-delivery-rome/[area]', params: { area } }),
          },
        ])}
      />
      <JsonLd data={floristLd(`${found.name}, ${city}`)} />
      <Landing
        eyebrow={city}
        title={t('area.title', { area: found.name, city })}
        intro={t('area.intro', { area: found.name, city })}
        products={getProducts()}
      />
    </>
  );
}
