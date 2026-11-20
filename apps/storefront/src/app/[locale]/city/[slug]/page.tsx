import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cities } from '@rf/mocks';
import { getProducts } from '@/lib/catalog';
import { altMeta, breadcrumbLd, floristLd, JsonLd, pathFor } from '@/lib/seo';
import { Landing } from '@/components/sections/landing';
import type { Locale } from '@/i18n/routing';

/** Rome has its own hub (/flower-delivery-rome); these are the next-day courier cities. */
const national = cities.filter((c) => c.zone !== 'ROME');

export function generateStaticParams() {
  return national.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const city = national.find((c) => c.slug === slug);
  if (!city) return {};
  const t = await getTranslations({ locale, namespace: 'landing' });
  return {
    title: t('city.title', { city: city.name }),
    description: t('city.intro', { city: city.name }),
    alternates: altMeta(locale, { pathname: '/city/[slug]', params: { slug } }),
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const city = national.find((c) => c.slug === slug);
  if (!city) notFound();

  const t = await getTranslations('landing');

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: pathFor(locale, '/') },
          { name: city.name, path: pathFor(locale, { pathname: '/city/[slug]', params: { slug } }) },
        ])}
      />
      <JsonLd data={floristLd(city.name)} />
      <Landing
        eyebrow={city.name}
        title={t('city.title', { city: city.name })}
        intro={t('city.intro', { city: city.name })}
        products={getProducts()}
      />
    </>
  );
}
