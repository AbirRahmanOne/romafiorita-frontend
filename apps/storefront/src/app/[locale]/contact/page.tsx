import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { business } from '@rf/mocks';
import { altMeta } from '@/lib/seo';
import { ProsePage } from '@/components/prose-page';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('title'), description: t('lead'), alternates: altMeta(locale, '/contact') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.contact');

  // Contact channels come from config — each is hidden until the client provides it
  // (content-rules). No details yet → show the placeholder note.
  const hasAny = business.whatsapp || business.phone || business.pec;

  return (
    <ProsePage title={t('title')} lead={t('lead')}>
      {!hasAny ? <p className="leading-relaxed text-muted">{t('noDetails')}</p> : null}
      <div className="flex flex-wrap gap-2.5">
        {business.whatsapp ? (
          <a
            className="btn btn-primary"
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
          >
            {t('whatsapp')}
          </a>
        ) : null}
        {business.phone ? (
          <a className="btn btn-secondary" href={`tel:${business.phone}`}>
            {t('call')}
          </a>
        ) : null}
      </div>
      {business.pec ? (
        <p>
          {t('emailLabel')}:{' '}
          <a className="text-accent-700 underline" href={`mailto:${business.pec}`}>
            {business.pec}
          </a>
        </p>
      ) : null}
    </ProsePage>
  );
}
