'use client';

import { useTranslations } from 'next-intl';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('pages.error');
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-28 text-center">
      <h1 className="font-heading text-5xl leading-none">{t('title')}</h1>
      <p className="text-lg text-muted">{t('body')}</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        {t('retry')}
      </button>
    </div>
  );
}
