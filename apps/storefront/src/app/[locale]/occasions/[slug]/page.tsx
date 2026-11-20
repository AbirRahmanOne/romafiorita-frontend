import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { occasions } from '@rf/mocks';
import { getProductsByOccasion, occasionName } from '@/lib/catalog';
import { CatalogGrid } from '@/components/sections/catalog-grid';

export function generateStaticParams() {
  return occasions.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: occasionName(slug, locale), alternates: { canonical: `/occasions/${slug}` } };
}

export default async function OccasionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!occasions.some((o) => o.slug === slug)) notFound();

  const p = await getTranslations('product');
  const products = getProductsByOccasion(slug);

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-12">
      <h1 className="mb-8 font-heading text-5xl leading-none lg:text-6xl">
        {occasionName(slug, locale)}
      </h1>
      <CatalogGrid products={products} fromLabel={p('from')} />
    </div>
  );
}
