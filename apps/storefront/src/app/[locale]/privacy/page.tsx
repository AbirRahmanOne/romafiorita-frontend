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
  return { title: t('privacyTitle'), alternates: altMeta(locale, '/privacy') };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.legal');

  // Full privacy policy is client/legal-provided (content-rules).
  return (
    <ProsePage title={t('privacyTitle')}>
      <p className="rounded-md border border-divider bg-surface p-4 text-sm text-muted">
        {t('pending')}
      </p>
    </ProsePage>
  );
}
