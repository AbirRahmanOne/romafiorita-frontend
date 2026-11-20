import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { romeAreas, settings } from '@rf/mocks';
import { getProducts } from '@/lib/catalog';
import { altMeta, breadcrumbLd, floristLd, JsonLd, pathFor } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import { Landing } from '@/components/sections/landing';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  return {
    title: t('rome.title', { city: settings.city }),
    description: t('rome.intro', { city: settings.city }),
    alternates: altMeta(locale, '/flower-delivery-rome'),
  };
}

export default async function RomeHub({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');
  const city = settings.city;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: pathFor(locale, '/') },
          { name: city, path: pathFor(locale, '/flower-delivery-rome') },
        ])}
      />
      <JsonLd data={floristLd(city)} />
      <Landing
        eyebrow={t('rome.eyebrow', { city })}
        title={t('rome.title', { city })}
        intro={t('rome.intro', { city })}
        products={getProducts()}
      >
        <nav aria-label={t('rome.areasTitle')} className="mt-10">
          <h2 className="mb-4 font-heading text-2xl">{t('rome.areasTitle')}</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            {romeAreas.map((a) => (
              <li key={a.slug}>
                <Link
                  href={{ pathname: '/flower-delivery-rome/[area]', params: { area: a.slug } }}
                  className="inline-flex min-h-11 items-center rounded-full border border-divider px-4 text-sm hover:border-accent hover:text-accent-700"
                >
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Landing>
    </>
  );
}
