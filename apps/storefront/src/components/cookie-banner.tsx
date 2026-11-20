'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const KEY = 'rf-cookie-consent';

/** GDPR banner. Analytics must only load after `accept` (read this key before init). */
export function CookieBanner() {
  const t = useTranslations('cookie');
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    setDecided(localStorage.getItem(KEY) !== null);
  }, []);

  if (decided) return null;

  const decide = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(KEY, value);
    setDecided(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-md border border-divider bg-surface p-4 text-sm shadow-md"
    >
      <p className="flex-1">{t('message')}</p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => decide('rejected')}>
          {t('reject')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => decide('accepted')}>
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
