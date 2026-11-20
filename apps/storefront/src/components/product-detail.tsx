'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@rf/ui';
import type { Addon, Product } from '@rf/mocks';
import { useCart } from '@/lib/cart';
import { useRouter } from '@/i18n/routing';
import { DeliveryChecker, type DeliverySelection } from './delivery-checker';

export function ProductDetail({ product, addons }: { product: Product; addons: Addon[] }) {
  const t = useTranslations('product');
  const locale = useLocale();
  const cart = useCart();
  const router = useRouter();

  const defaultVariant =
    product.variants.find((v) => v.is_default && v.active) ??
    product.variants.find((v) => v.active) ??
    product.variants[0]!;
  const [variantId, setVariantId] = useState(defaultVariant.id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [cardMessage, setCardMessage] = useState('');
  const [delivery, setDelivery] = useState<DeliverySelection | null>(null);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? defaultVariant,
    [product.variants, variantId, defaultVariant],
  );
  const image = variant.images[0] ?? product.images[0]!;
  const description = locale === 'it' ? variant.description_it : variant.description_en;

  function addToBasket() {
    cart.add({
      slug: product.slug,
      name: product.name,
      image,
      variantId: variant.id,
      tier: variant.tier,
      unitPriceCents: variant.price_cents,
      quantity: 1,
      addons: selectedAddons,
      cardMessage,
    });
    if (delivery) {
      cart.setDelivery({
        postcode: delivery.postcode,
        date: delivery.date,
        type: delivery.type,
        slot: delivery.slot,
      });
    }
    router.push('/cart');
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <Image
          src={image}
          alt={`${product.name} · ${t(`tiers.${variant.tier}`)}`}
          width={800}
          height={1000}
          priority
          className="aspect-[4/5] w-full rounded-md object-cover"
        />
      </div>

      {/* Buy panel */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-5xl leading-none">{product.name}</h1>
          <p className="mt-2 text-muted">{product.subtitle}</p>
        </div>

        {/* Tier selector */}
        <div>
          <p className="mb-2 text-sm font-medium">{t('chooseSize')}</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('chooseSize')}>
            {product.variants.map((v) => {
              const on = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v.active}
                  onClick={() => setVariantId(v.id)}
                  className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left ${
                    !v.active
                      ? 'cursor-not-allowed border-divider opacity-50'
                      : on
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-divider hover:border-accent'
                  }`}
                >
                  <span className="font-heading text-lg">{t(`tiers.${v.tier}`)}</span>
                  <span className="text-sm tabular-nums">{formatMoney(v.price_cents, locale)}</span>
                  {!v.active ? (
                    <span className="text-xs text-muted">{t('unavailableToday')}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* What's included */}
        <div>
          <p className="text-sm font-medium">{t('whatsIncluded')}</p>
          <p className="mt-1 text-muted">{description}</p>
        </div>

        {/* Add-ons */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t('addonsTitle')}</legend>
          <div className="flex flex-col gap-2">
            {addons.map((a) => (
              <label key={a.id} className="flex min-h-11 items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(a.id)}
                    onChange={(e) =>
                      setSelectedAddons((cur) =>
                        e.target.checked ? [...cur, a.id] : cur.filter((x) => x !== a.id),
                      )
                    }
                  />
                  {locale === 'it' ? a.name_it : a.name_en}
                </span>
                <span className="tabular-nums text-muted">
                  {a.price_cents ? formatMoney(a.price_cents, locale) : t('from')}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Card message with live preview */}
        <div>
          <label className="text-sm font-medium" htmlFor="card-message">
            {t('cardMessage')}
          </label>
          <textarea
            id="card-message"
            value={cardMessage}
            onChange={(e) => setCardMessage(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder={t('cardPlaceholder')}
            className="mt-1 w-full rounded-md border border-divider bg-surface p-3 text-base"
          />
          {cardMessage ? (
            <figure className="mt-2 rounded-md bg-accent-soft p-4">
              <figcaption className="text-xs uppercase tracking-wider text-accent-700">
                {t('cardPreview')}
              </figcaption>
              <p className="mt-1 font-heading text-xl italic">“{cardMessage}”</p>
            </figure>
          ) : null}
        </div>

        {/* Delivery checker */}
        <div className="rounded-md border border-divider p-4">
          <p className="mb-3 font-heading text-xl">{t('deliveryTitle')}</p>
          <DeliveryChecker onChange={setDelivery} />
        </div>

        <button type="button" className="btn btn-primary text-base" onClick={addToBasket}>
          {t('addToBasket')} · {formatMoney(variant.price_cents, locale)}
        </button>

        {/* Trust strip */}
        <ul className="grid gap-2 border-t border-divider pt-4 text-sm text-muted sm:grid-cols-3">
          <li>{t('trustPhoto')}</li>
          <li>{t('trustAllIn')}</li>
          <li>{t('trustOnTime')}</li>
        </ul>

        {/* Details + substitution */}
        <div className="border-t border-divider pt-4">
          <p className="text-sm font-medium">{t('detailsTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('substitution')}</p>
        </div>
      </div>
    </div>
  );
}
