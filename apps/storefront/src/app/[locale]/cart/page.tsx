'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney, EmptyState } from '@rf/ui';
import { useCart } from '@/lib/cart';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import type { Quote } from '@rf/mocks';

export default function CartPage() {
  const t = useTranslations('cart');
  const tp = useTranslations('product');
  const locale = useLocale();
  const cart = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (cart.items.length === 0) {
      setQuote(null);
      return;
    }
    let active = true;
    api
      .quote({
        items: cart.items.map((i) => ({
          variant_id: i.variantId,
          quantity: i.quantity,
          addons: i.addons,
        })),
        delivery_type: cart.delivery?.type ?? 'standard',
      })
      .then((q) => active && setQuote(q))
      .catch(() => active && setQuote(null));
    return () => {
      active = false;
    };
  }, [cart.items, cart.delivery]);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-12">
        <h1 className="mb-6 font-heading text-5xl">{t('title')}</h1>
        <EmptyState
          title={t('empty')}
          action={
            <Link href="/bouquets" className="btn btn-primary">
              {t('emptyCta')}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-shell gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-12">
      <div>
        <h1 className="mb-6 font-heading text-5xl">{t('title')}</h1>
        <ul className="flex flex-col divide-y divide-divider border-y border-divider">
          {cart.items.map((item) => (
            <li key={item.key} className="flex gap-4 py-5">
              <Image
                src={item.image}
                alt={item.name}
                width={96}
                height={120}
                className="aspect-[4/5] w-24 rounded-md object-cover"
              />
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-heading text-xl">
                  {t('lineTitle', { name: item.name, tier: tp(`tiers.${item.tier}`) })}
                </span>
                {item.cardMessage ? (
                  <span className="text-sm italic text-muted">“{item.cardMessage}”</span>
                ) : null}
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    {t('quantity')}
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => cart.setQuantity(item.key, Number(e.target.value))}
                      className="min-h-11 w-16 rounded-md border border-divider px-2 text-base"
                    />
                  </label>
                  <button
                    type="button"
                    className="text-sm text-accent-700 underline"
                    onClick={() => cart.remove(item.key)}
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
              <span className="font-heading text-lg tabular-nums">
                {formatMoney(item.unitPriceCents * item.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-md border border-divider bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="mb-4 font-heading text-2xl">{t('total')}</h2>
        {quote ? (
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt>{t('subtotal')}</dt>
              <dd className="tabular-nums">{formatMoney(quote.subtotal_cents, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t('deliveryLine')}</dt>
              <dd className="tabular-nums">{t('included')}</dd>
            </div>
            {quote.time_fee_cents > 0 ? (
              <div className="flex justify-between">
                <dt>{t('timeFee')}</dt>
                <dd className="tabular-nums">{formatMoney(quote.time_fee_cents, locale)}</dd>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-divider pt-3 text-base font-semibold">
              <dt>{t('total')}</dt>
              <dd className="tabular-nums">{formatMoney(quote.total_cents, locale)}</dd>
            </div>
          </dl>
        ) : null}
        <Link href="/checkout" className="btn btn-primary mt-5 w-full">
          {t('checkout')}
        </Link>
      </aside>
    </div>
  );
}
