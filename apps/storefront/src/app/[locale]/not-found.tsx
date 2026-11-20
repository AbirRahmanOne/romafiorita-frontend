'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('pages.notFound');
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-28 text-center">
      <h1 className="font-heading text-6xl leading-none">{t('title')}</h1>
      <p className="text-lg text-muted">{t('body')}</p>
      <Link href="/" className="btn btn-primary">
        {t('home')}
      </Link>
    </div>
  );
}
