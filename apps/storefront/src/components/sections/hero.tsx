import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export async function Hero({ city }: { city: string }) {
  const t = await getTranslations('hero');

  return (
    <section className="mx-auto max-w-shell px-4 pt-10 sm:px-6 lg:px-12 lg:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-[0.14em] text-accent-700">
            {t('eyebrow', { city })}
          </span>
          <h1 className="text-balance text-6xl font-normal leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            {t('titleLead')} <em className="text-accent-700">{t('titleAccent')}</em> {t('titleRest')}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted">{t('subtitle')}</p>
          <div className="flex flex-wrap gap-2.5">
            <a className="btn btn-primary px-6 text-base" href="#bouquets">
              {t('sendFlowers')}
            </a>
            <a className="btn btn-secondary px-6 text-base" href="#how">
              {t('howItWorks')}
            </a>
          </div>
          <p className="text-sm text-muted">{t('trust')}</p>
        </div>
        <figure className="m-0">
          <Image
            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1100&h=1000&fit=crop&q=75&auto=format"
            alt="A florist handing over a bouquet of garden roses"
            width={1100}
            height={1000}
            priority
            className="aspect-[11/10] w-full rounded-md object-cover"
          />
          <figcaption className="mt-2 text-xs text-muted">{t('caption')}</figcaption>
        </figure>
      </div>
    </section>
  );
}
