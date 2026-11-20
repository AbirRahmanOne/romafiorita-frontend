import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { settings } from '@rf/mocks';
import { altMeta } from '@/lib/seo';
import { ProsePage, ProseSection } from '@/components/prose-page';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.delivery' });
  return { title: t('title'), description: t('lead'), alternates: altMeta(locale, '/delivery') };
}

export default async function DeliveryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.delivery');
  const city = settings.city;

  return (
    <ProsePage title={t('title')} lead={t('lead')}>
      <ProseSection title={t('romeTitle', { city })}>{t('romeBody', { city })}</ProseSection>
      <ProseSection title={t('nationalTitle')}>{t('nationalBody')}</ProseSection>
      <ProseSection title={t('cutoffTitle')}>{t('cutoffBody', { city })}</ProseSection>
      <ProseSection title={t('photoTitle')}>{t('photoBody')}</ProseSection>
    </ProsePage>
  );
}
