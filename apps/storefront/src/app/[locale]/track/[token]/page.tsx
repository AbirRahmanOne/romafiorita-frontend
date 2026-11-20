'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney, EmptyState } from '@rf/ui';
import { api, type TrackResult } from '@/lib/api';

export default function TrackPage() {
  const t = useTranslations('track');
  const tp = useTranslations('product');
  const locale = useLocale();
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .track(token)
      .then(setData)
      .catch(() => setNotFound(true));
  }, [token]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <EmptyState title={t('notFound')} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <div className="h-40 animate-pulse rounded-md bg-divider/40 motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">{t('title', { number: data.order_number })}</h1>

      {data.items.length ? (
        <ul className="mt-4 flex flex-col gap-1 text-sm text-muted">
          {data.items.map((it, i) => (
            <li key={`${it.name}-${i}`}>
              {it.name} · {tp(`tiers.${it.tier}`)}
            </li>
          ))}
        </ul>
      ) : null}

      <ol className="mt-8 flex flex-col gap-0">
        {data.timeline.map((step) => (
          <li key={step.status} className="flex items-center gap-3 border-b border-divider py-3">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                step.done ? 'bg-accent text-white' : 'bg-divider/50 text-muted'
              }`}
            >
              {step.done ? '✓' : ''}
            </span>
            <span className={step.done ? 'font-medium' : 'text-muted'}>
              {t(`status.${step.status}`)}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex justify-between text-sm">
        <span className="text-muted">{t('slot')}</span>
        <span className="tabular-nums">{data.delivery_slot}</span>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-muted">Total</span>
        <span className="tabular-nums">{formatMoney(data.total_cents, locale)}</span>
      </div>

      <div className="mt-8 grid place-items-center rounded-md border border-dashed border-divider p-10 text-center text-sm text-muted">
        {t('photoPending')}
      </div>
    </div>
  );
}
