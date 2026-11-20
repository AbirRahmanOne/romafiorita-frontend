import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { products } from '@rf/mocks';
import { getAddons, getProduct, getRelated } from '@/lib/catalog';
import { Link } from '@/i18n/routing';
import { ProductDetail } from '@/components/product-detail';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.subtitle,
    alternates: { canonical: `/product/${slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations('product');
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const related = getRelated(slug);
  const active = product.variants.filter((v) => v.active);
  const low = Math.min(...active.map((v) => v.price_cents)) / 100;
  const high = Math.max(...active.map((v) => v.price_cents)) / 100;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.subtitle,
    image: product.images,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: low,
      highPrice: high,
      offerCount: active.length,
    },
  };

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} addons={getAddons()} />

      {related.length ? (
        <section className="mt-20">
          <h2 className="mb-6 font-heading text-3xl">{t('relatedTitle')}</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
            {related.map((p) => {
              const activeR = p.variants.filter((v) => v.active);
              const fromCents = Math.min(...activeR.map((v) => v.price_cents));
              return (
                <Link
                  key={p.slug}
                  href={{ pathname: '/product/[slug]', params: { slug: p.slug } }}
                  className="flex flex-col gap-2 text-text"
                >
                  <Image
                    src={p.images[0]!}
                    alt={p.name}
                    width={400}
                    height={500}
                    className="aspect-[4/5] w-full rounded-md object-cover"
                  />
                  <span className="font-heading text-xl">{p.name}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {t('from')} {money.format(fromCents / 100)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
