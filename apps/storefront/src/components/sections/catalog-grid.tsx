import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Product } from '@rf/mocks';
import { Link } from '@/i18n/routing';

/** Catalog cards that link to the product page. "from €X" uses the lowest active tier. */
export async function CatalogGrid({ products, fromLabel }: { products: Product[]; fromLabel: string }) {
  const locale = await getLocale();
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const active = p.variants.filter((v) => v.active);
        const fromCents = Math.min(...active.map((v) => v.price_cents));
        return (
          <Link
            key={p.slug}
            href={{ pathname: '/product/[slug]', params: { slug: p.slug } }}
            className="flex flex-col gap-3 text-text"
          >
            <div className="relative">
              <Image
                src={p.images[0]!}
                alt={p.name}
                width={600}
                height={750}
                sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
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
              </div>
              <span className="whitespace-nowrap text-right font-heading text-lg tabular-nums">
                <span className="block font-body text-[11px] uppercase tracking-wider text-muted">
                  {fromLabel}
                </span>
                {money.format(fromCents / 100)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
