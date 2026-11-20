'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney, Input } from '@rf/ui';
import { api, type VerifyResult } from '@/lib/api';

export function VerifyClient() {
  const t = useTranslations('verify');
  const locale = useLocale();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setResult(await api.verify(orderNumber.trim(), email.trim()));
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-heading text-4xl">{t('title')}</h1>
      <p className="mt-2 text-muted">{t('subtitle')}</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('orderNumber')}
          <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="RF-2026-…" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('email')}
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit" className="btn btn-primary">
          {t('check')}
        </button>
      </form>

      {result ? (
        result.genuine ? (
          <div className="mt-6 rounded-md bg-accent-soft p-4 text-sm">
            <p className="font-semibold text-accent-700">✓ {t('genuine')}</p>
            <p className="mt-2 flex justify-between">
              <span>{t('amount')}</span>
              <span className="tabular-nums">{formatMoney(result.amount_cents ?? 0, locale)}</span>
            </p>
            <p className="flex justify-between">
              <span>{t('status')}</span>
              <span className="capitalize">{result.status}</span>
            </p>
          </div>
        ) : (
          <p className="mt-6 rounded-md border border-divider p-4 text-sm">{t('notGenuine')}</p>
        )
      ) : null}
    </div>
  );
}
