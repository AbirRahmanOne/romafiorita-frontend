import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { settings } from '@rf/mocks';
import { getProducts } from '@/lib/catalog';
import { CatalogGrid } from '@/components/sections/catalog-grid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return { title: t('title'), alternates: { canonical: '/bouquets' } };
}

export default async function BouquetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');
  const p = await getTranslations('product');
  const products = getProducts();

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-12">
      <h1 className="font-heading text-5xl leading-none lg:text-6xl">{t('title')}</h1>
      <p className="mt-3 max-w-xl text-muted">{t('subtitle', { city: settings.city })}</p>
      <p className="mb-8 mt-6 text-sm text-muted">{t('results', { count: products.length })}</p>
      <CatalogGrid products={products} fromLabel={p('from')} />
    </div>
  );
}
