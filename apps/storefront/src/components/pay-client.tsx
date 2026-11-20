'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@rf/ui';
import { api, type PaySummary } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { StripePayment } from './stripe-payment';

function hoursLeft(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3600e3));
}

export function PayClient({ token }: { token: string }) {
  const t = useTranslations('pay');
  const locale = useLocale();
  const [summary, setSummary] = useState<PaySummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<PaySummary['status'] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    api
      .payGet(token)
      .then((s) => {
        setSummary(s);
        setStatus(s.status);
      })
      .catch(() => setNotFound(true));
  }, [token]);

  async function startPay() {
    const { client_secret } = await api.payIntent(token);
    setClientSecret(client_secret);
  }

  if (notFound) return <Centered>{t('notFound')}</Centered>;
  if (!summary || !status) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-md bg-divider/40 motion-reduce:animate-none" />
      </div>
    );
  }

  const payable = status === 'sent' || status === 'viewed';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl">{t('title', { number: summary.order_number })}</h1>

      {/* Order summary */}
      <section className="mt-6 rounded-md border border-divider p-5">
        <h2 className="mb-3 font-heading text-xl">{t('summary')}</h2>
        <ul className="flex flex-col gap-1 border-b border-divider pb-3 text-sm">
          {summary.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>{it.title}</span>
              <span className="tabular-nums">{formatMoney(it.price_cents, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1 text-sm">
          <Row label={t('deliverTo')} value={summary.recipient} />
          <Row label={t('slot')} value={summary.delivery_slot} />
          {summary.card_message ? <Row label={t('cardMessage')} value={`“${summary.card_message}”`} /> : null}
        </dl>
        <div className="mt-3 flex justify-between border-t border-divider pt-3 text-base font-semibold">
          <span>{t('total')}</span>
          <span className="tabular-nums">{formatMoney(summary.amount_cents, locale)}</span>
        </div>
        {summary.local_estimate && summary.local_estimate.currency !== summary.currency ? (
          <p className="mt-1 text-right text-xs text-muted">
            {t('estimate', {
              amount: new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: summary.local_estimate.currency,
              }).format(summary.local_estimate.amount_cents / 100),
            })}
          </p>
        ) : null}
      </section>

      {/* Payment / states */}
      <section className="mt-6">
        {status === 'paid' ? (
          <div className="rounded-md bg-accent-soft p-5 text-center">
            <p className="font-heading text-2xl text-accent-700">{t('paid')}</p>
            <p className="mt-2 text-sm text-muted">{t('paidNote')}</p>
          </div>
        ) : status === 'expired' ? (
          <div className="rounded-md border border-divider p-5 text-center">
            <p>{t('expired')}</p>
            <a className="btn btn-primary mt-3" href="https://wa.me/">
              {t('expiredCta')}
            </a>
          </div>
        ) : status === 'cancelled' ? (
          <Centered>{t('cancelled')}</Centered>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">{t('expiresIn', { hours: hoursLeft(summary.expires_at) })}</p>
            {clientSecret ? (
              <StripePayment clientSecret={clientSecret} onPaid={() => setStatus('paid')} />
            ) : (
              <button type="button" className="btn btn-primary text-base" onClick={startPay} disabled={!payable}>
                {t('pay')} · {formatMoney(summary.amount_cents, locale)}
              </button>
            )}
            <div className="rounded-md bg-accent-soft/60 p-4 text-sm">
              <p>🔒 {t('secure')}</p>
              <p className="mt-1 text-muted">{t('descriptor')}</p>
            </div>
          </div>
        )}
      </section>

      {/* Anti-scam trust */}
      <section className="mt-6 border-t border-divider pt-5 text-sm">
        <p className="font-semibold">{t('genuineTitle')}</p>
        <p className="mt-1 text-muted">{t('genuineBody')}</p>
        <Link href="/verify" className="mt-2 inline-block text-accent-700 underline">
          {t('verifyLink')}
        </Link>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">{children}</div>;
}
