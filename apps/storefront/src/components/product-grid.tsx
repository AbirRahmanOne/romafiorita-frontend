'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@rf/ui';
import type { Product } from '@rf/mocks';
import { useCart } from '@/lib/cart';

const FILTERS = ['all', 'Roses', 'Seasonal', 'Dried'] as const;
type Filter = (typeof FILTERS)[number];

function fromPrice(p: Product): number {
  return Math.min(...p.variants.filter((v) => v.active).map((v) => v.price_cents));
}

export function ProductGrid({ products }: { products: Product[] }) {
  const t = useTranslations('products');
  const locale = useLocale();
  const cart = useCart();
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const shown = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  function add(p: Product) {
    const variant =
      p.variants.find((v) => v.is_default && v.active) ?? p.variants.find((v) => v.active) ?? p.variants[0]!;
    cart.add({
      slug: p.slug,
      name: p.name,
      image: p.images[0]!,
      variantId: variant.id,
      tier: variant.tier,
      unitPriceCents: variant.price_cents,
      quantity: 1,
      addons: [],
      cardMessage: '',
    });
    setToast(t('added', { name: p.name }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }

  return (
    <section id="bouquets" className="mx-auto max-w-shell px-4 pt-20 sm:px-6 lg:px-12 lg:pt-28">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-4xl font-normal leading-none lg:text-6xl">{t('heading')}</h2>
        <div
          role="radiogroup"
          aria-label={t('heading')}
          className="flex flex-wrap gap-1 rounded-full border border-divider p-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full px-4 text-sm ${
                filter === f ? 'bg-accent text-white' : 'text-muted hover:text-accent-700'
              }`}
            >
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => (
          <article key={p.slug} className="flex flex-col gap-3">
            <div className="relative">
              <Image
                src={p.images[0]!}
                alt={p.name}
                width={600}
                height={750}
                className="aspect-[4/5] w-full rounded-md object-cover"
              />
              {p.tags.length ? (
                <span className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-700"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-heading text-2xl leading-tight">{p.name}</span>
                <span className="text-sm text-muted">{p.subtitle}</span>
                <span className="text-xs text-muted">
                  {t('sizes', { count: p.variants.filter((v) => v.active).length })}
                </span>
              </div>
              <span className="whitespace-nowrap text-right font-heading text-lg tabular-nums">
                <span className="block text-[11px] font-body uppercase tracking-wider text-muted">
                  {t('from')}
                </span>
                {formatMoney(fromPrice(p), locale)}
              </span>
            </div>
            <button type="button" className="btn btn-secondary self-start" onClick={() => add(p)}>
              {t('addToBasket')}
            </button>
          </article>
        ))}
      </div>

      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-40 flex max-w-sm items-center gap-3 rounded-md border border-accent bg-surface px-4 py-3.5 text-sm shadow-md">
          <span className="text-accent">✓</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </section>
  );
}
