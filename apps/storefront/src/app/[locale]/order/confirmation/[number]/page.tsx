'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';

export default function ConfirmationPage() {
  const t = useTranslations('confirmation');
  const tp = useTranslations('product');
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<{ name: string; tier: string }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`rf-token-${number}`);
    setToken(stored);
    // Items come from the order (backend) so product + tier show here too.
    if (stored) api.track(stored).then((r) => setItems(r.items)).catch(() => {});
  }, [number]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-6xl text-accent">✓</p>
      <h1 className="mt-4 font-heading text-5xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted">{t('thanks', { number })}</p>
      {items.length ? (
        <ul className="mx-auto mt-4 flex max-w-sm flex-col gap-1 text-sm text-muted">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`}>
              {it.name} · {tp(`tiers.${it.tier}`)}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-muted">{t('photoNote')}</p>
      {token ? (
        <Link
          href={{ pathname: '/track/[token]', params: { token } }}
          className="btn btn-primary mt-8"
        >
          {t('track')}
        </Link>
      ) : null}
    </div>
  );
}
