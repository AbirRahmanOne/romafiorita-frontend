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
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return { title: t('title'), description: t('lead'), alternates: altMeta(locale, '/about') };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');

  return (
    <ProsePage title={t('title')} lead={t('lead')}>
      <p className="leading-relaxed text-text">{t('body1')}</p>
      <p className="leading-relaxed text-text">{t('body2')}</p>
      <ProseSection title={t('trustTitle')}>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>{t('trust1')}</li>
          <li>{t('trust2')}</li>
          <li>{t('trust3')}</li>
        </ul>
      </ProseSection>
    </ProsePage>
  );
}
