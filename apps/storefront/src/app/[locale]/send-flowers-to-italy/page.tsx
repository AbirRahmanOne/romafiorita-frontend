import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cities } from '@rf/mocks';
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
    title: t('national.title'),
    description: t('national.intro'),
    alternates: altMeta(locale, '/send-flowers-to-italy'),
  };
}

export default async function NationalHub({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: pathFor(locale, '/') },
          { name: t('national.title'), path: pathFor(locale, '/send-flowers-to-italy') },
        ])}
      />
      <JsonLd data={floristLd('Italia')} />
      <Landing
        eyebrow={t('national.eyebrow')}
        title={t('national.title')}
        intro={t('national.intro')}
        products={getProducts()}
      >
        <nav aria-label={t('national.citiesTitle')} className="mt-10">
          <h2 className="mb-4 font-heading text-2xl">{t('national.citiesTitle')}</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            <li>
              <Link
                href="/flower-delivery-rome"
                className="inline-flex min-h-11 items-center rounded-full border border-accent px-4 text-sm italic text-accent-700"
              >
                Roma
              </Link>
            </li>
            {cities
              .filter((c) => c.zone !== 'ROME')
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={{ pathname: '/city/[slug]', params: { slug: c.slug } }}
                    className="inline-flex min-h-11 items-center rounded-full border border-divider px-4 text-sm hover:border-accent hover:text-accent-700"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Landing>
    </>
  );
}
