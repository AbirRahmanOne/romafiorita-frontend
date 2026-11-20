import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { settings } from '@rf/mocks';
import { altMeta } from '@/lib/seo';
import { FaqSection } from '@/components/sections/faq-section';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.faq' });
  return { title: t('title'), description: t('lead'), alternates: altMeta(locale, '/faq') };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.faq');

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-shell px-4 pt-12 sm:px-6 lg:px-12">
        <h1 className="font-heading text-5xl leading-none lg:text-6xl">{t('title')}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{t('lead')}</p>
      </div>
      <FaqSection city={settings.city} />
    </div>
  );
}
