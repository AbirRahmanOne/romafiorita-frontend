import { getTranslations } from 'next-intl/server';
import { business } from '@rf/mocks';

const ITEMS = ['pay', 'exact', 'notHome', 'look', 'cutoff'] as const;

/**
 * FAQ accordion (native <details>) + "Florist on call". WhatsApp/call buttons only
 * render when the business config provides the numbers (content-rules).
 */
export async function FaqSection({ city }: { city: string }) {
  const t = await getTranslations('faq');

  return (
    <section
      id="faq"
      className="mx-auto grid max-w-shell gap-14 px-4 pt-20 sm:px-6 lg:grid-cols-2 lg:px-12 lg:pt-28"
    >
      <div className="flex flex-col gap-5">
        <span className="text-xs uppercase tracking-[0.14em] text-accent-700">
          {t('floristEyebrow')}
        </span>
        <h2 className="text-4xl font-normal leading-none lg:text-6xl">
          {t('floristTitleLead')} <em className="text-accent-700">{t('floristTitleAccent')}</em>
        </h2>
        <p className="max-w-md leading-relaxed text-muted">{t('floristBody', { city })}</p>
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
      </div>

      <div>
        <span className="block pb-2 text-xs uppercase tracking-[0.14em] text-muted">
          {t('questionsEyebrow')}
        </span>
        <div className="border-t border-text">
          {ITEMS.map((key, i) => (
            <details key={key} open={i === 0} className="border-b border-divider">
              <summary className="flex min-h-[62px] cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {t(`items.${key}.q`)}
                <span className="text-xl font-normal text-accent">+</span>
              </summary>
              <p className="mb-5 mt-0 leading-relaxed text-muted">{t(`items.${key}.a`, { city })}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
