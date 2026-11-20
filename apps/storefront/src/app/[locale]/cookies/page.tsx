import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altMeta } from '@/lib/seo';
import { ProsePage } from '@/components/prose-page';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.legal' });
  return { title: t('cookiesTitle'), alternates: altMeta(locale, '/cookies') };
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.legal');

  return (
    <ProsePage title={t('cookiesTitle')}>
      <p className="leading-relaxed text-text">{t('cookiesBody')}</p>
      <p className="rounded-md border border-divider bg-surface p-4 text-sm text-muted">
        {t('pending')}
      </p>
    </ProsePage>
  );
}
