import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { settings } from '@rf/mocks';
import { getProducts } from '@/lib/catalog';
import { Hero } from '@/components/sections/hero';
import { WhereWhenBar } from '@/components/where-when-bar';
import { Promises } from '@/components/sections/promises';
import { OccasionsGrid } from '@/components/sections/occasions-grid';
import { ProductGrid } from '@/components/product-grid';
import { PhotoPromise } from '@/components/sections/photo-promise';
import { ExactTimeSection } from '@/components/exact-time-section';
import { ReviewsSection } from '@/components/sections/reviews-section';
import { CitiesList } from '@/components/sections/cities-list';
import { FaqSection } from '@/components/sections/faq-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Roma Fiorita',
    description: t('subtitle'),
    alternates: {
      canonical: '/',
      languages: { en: '/en', it: '/it', 'x-default': '/en' },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { city } = settings;

  return (
    <>
      <Hero city={city} />
      <WhereWhenBar />
      <Promises city={city} />
      <OccasionsGrid />
      <ProductGrid products={getProducts()} />
      <PhotoPromise />
      <ExactTimeSection city={city} />
      <ReviewsSection />
      <CitiesList city={city} />
      <FaqSection city={city} />
    </>
  );
}
