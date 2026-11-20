import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Product } from '@rf/mocks';
import { CatalogGrid } from './catalog-grid';

/**
 * Shared SEO landing layout (Rome hub, neighbourhoods, cities, national). Copy is
 * passed in already-translated; the template only lays it out. Nothing fabricated —
 * place names are real, the prose is templated per place in the i18n files.
 */
export async function Landing({
  eyebrow,
  title,
  intro,
  products,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro: string;
  products: Product[];
  children?: ReactNode;
}) {
  const t = await getTranslations('product');
  const l = await getTranslations('landing');

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-12">
      {eyebrow ? (
        <span className="text-xs uppercase tracking-[0.14em] text-accent-700">{eyebrow}</span>
      ) : null}
      <h1 className="mt-3 max-w-3xl font-heading text-5xl leading-none lg:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">{intro}</p>
      {children}
      <h2 className="mb-6 mt-16 font-heading text-3xl">{l('shopTitle')}</h2>
      <CatalogGrid products={products} fromLabel={t('from')} />
    </div>
  );
}
