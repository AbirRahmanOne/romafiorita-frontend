import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altMeta } from '@/lib/seo';
import { ProsePage, ProseSection } from '@/components/prose-page';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.legal' });
  return { title: t('termsTitle'), alternates: altMeta(locale, '/terms') };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.legal');

  // Full terms text is client/legal-provided (content-rules) — we do not ship invented
  // legalese. The perishable-goods withdrawal exclusion is a real, required note.
  return (
    <ProsePage title={t('termsTitle')}>
      <ProseSection title={t('perishableTitle')}>{t('perishableBody')}</ProseSection>
      <p className="rounded-md border border-divider bg-surface p-4 text-sm text-muted">
        {t('pending')}
      </p>
    </ProsePage>
  );
}
