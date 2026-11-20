'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@rf/ui';
import { useCart } from '@/lib/cart';
import { useRouter } from '@/i18n/routing';
import { api, type CheckoutResult } from '@/lib/api';
import type { Quote } from '@rf/mocks';
import { DeliveryChecker, type DeliverySelection } from '@/components/delivery-checker';
import { StripePayment } from '@/components/stripe-payment';
import { convertFromRome, visitorZone } from '@/lib/time';

const STEPS = ['recipient', 'delivery', 'sender', 'payment'] as const;
const ADDRESS_TYPES = ['home', 'office', 'hospital', 'funeralHome', 'hotel'] as const;

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tp = useTranslations('product');
  const locale = useLocale();
  const cart = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState({ name: '', street: '', postcode: '', addressType: 'home' });
  const [delivery, setDelivery] = useState<DeliverySelection | null>(null);
  const [sender, setSender] = useState({ name: '', email: '' });
  const [accepted, setAccepted] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);

  const body = useMemo(
    () => ({
      items: cart.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity, addons: i.addons })),
      delivery_type: delivery?.type ?? cart.delivery?.type ?? 'standard',
    }),
    [cart.items, cart.delivery, delivery],
  );

  useEffect(() => {
    if (cart.items.length === 0) return;
    let active = true;
    api.quote(body).then((q) => active && setQuote(q));
    return () => {
      active = false;
    };
  }, [body, cart.items.length]);

  async function placeOrder() {
    const res = await api.checkout({ ...body, delivery_slot: delivery?.slot ?? delivery?.type });
    setCheckout(res);
  }

  function onPaid() {
    const token = checkout?.token ?? '';
    const number = checkout?.order_number ?? '';
    // Carry the tracking token so the confirmation page can link to /track.
    if (typeof window !== 'undefined' && number) sessionStorage.setItem(`rf-token-${number}`, token);
    cart.clear();
    router.push({ pathname: '/order/confirmation/[number]', params: { number } });
  }

  const empty = cart.items.length === 0 && !checkout;
  useEffect(() => {
    if (empty) router.replace('/cart');
  }, [empty, router]);

  const canNext =
    step === 0
      ? recipient.name && /^\d{5}$/.test(recipient.postcode) && recipient.street
      : step === 1
        ? !!delivery
        : step === 2
          ? sender.name && /.+@.+/.test(sender.email)
          : true;

  if (empty) return null;

  return (
    <div className="mx-auto grid max-w-shell gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-12">
      <div>
        <h1 className="mb-6 font-heading text-5xl">{t('title')}</h1>

        <ol className="mb-8 flex flex-wrap gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`rounded-full px-3 py-1 ${
                i === step ? 'bg-accent text-white' : i < step ? 'bg-accent-soft text-accent-700' : 'bg-surface text-muted'
              }`}
            >
              {i + 1}. {t(`steps.${s}`)}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <div className="flex flex-col gap-4">
            <Field label={t('recipientName')} value={recipient.name} onChange={(v) => setRecipient((r) => ({ ...r, name: v }))} />
            <Field label={t('street')} value={recipient.street} onChange={(v) => setRecipient((r) => ({ ...r, street: v }))} />
            <Field
              label={t('postcode')}
              value={recipient.postcode}
              onChange={(v) => setRecipient((r) => ({ ...r, postcode: v.replace(/\D/g, '').slice(0, 5) }))}
            />
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t('addressType')}
              <select
                value={recipient.addressType}
                onChange={(e) => setRecipient((r) => ({ ...r, addressType: e.target.value }))}
                className="min-h-11 rounded-md border border-divider bg-surface px-3 text-base"
              >
                {ADDRESS_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {t(`addressTypes.${a}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-3">
            <DeliveryChecker lockedPostcode={recipient.postcode} onChange={setDelivery} />
            {delivery?.slot ? (
              <p className="text-sm text-muted">
                {t('senderLocalTime', {
                  localTime: convertFromRome(delivery.slot, visitorZone().zone),
                  localCity: visitorZone().label,
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <Field label={t('senderName')} value={sender.name} onChange={(v) => setSender((s) => ({ ...s, name: v }))} />
            <Field
              label={t('senderEmail')}
              type="email"
              value={sender.email}
              onChange={(v) => setSender((s) => ({ ...s, email: v }))}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
              {t('terms')}
            </label>
            {checkout ? (
              <StripePayment clientSecret={checkout.client_secret} onPaid={onPaid} />
            ) : (
              <button type="button" className="btn btn-primary" disabled={!accepted} onClick={placeOrder}>
                {t('placeOrder')}
              </button>
            )}
          </div>
        ) : null}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
              {t('back')}
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              {t('next')}
            </button>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-md border border-divider bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="mb-4 font-heading text-2xl">{t('summary')}</h2>
        <ul className="flex flex-col gap-2 border-b border-divider pb-3 text-sm">
          {cart.items.map((i) => (
            <li key={i.key} className="flex justify-between gap-2">
              <span>
                {i.name} · {tp(`tiers.${i.tier}`)} × {i.quantity}
              </span>
              <span className="tabular-nums">{formatMoney(i.unitPriceCents * i.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        {quote ? (
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            {quote.time_fee_cents > 0 ? (
              <div className="flex justify-between">
                <dt>{t('timeType')}</dt>
                <dd className="tabular-nums">{formatMoney(quote.time_fee_cents, locale)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-divider pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(quote.total_cents, locale)}</dd>
            </div>
          </dl>
        ) : null}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-md border border-divider bg-surface px-3 text-base"
      />
    </label>
  );
}
