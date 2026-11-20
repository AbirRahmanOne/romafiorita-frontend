import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { getOccasions } from '@/lib/catalog';

export async function OccasionsGrid() {
  const t = await getTranslations('occasions');
  const locale = await getLocale();
  const occasions = getOccasions();

  return (
    <section id="occasions" className="mx-auto max-w-shell px-4 pt-20 sm:px-6 lg:px-12 lg:pt-28">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-4xl font-normal leading-none lg:text-6xl">
          {t('heading')}
        </h2>
        <a href="#occasions" className="text-sm text-accent-700">
          {t('all')} →
        </a>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {occasions.map((o) => (
          <a key={o.slug} href="#bouquets" className="flex flex-col gap-2.5 text-text">
            <Image
              src={o.img}
              alt={locale === 'it' ? o.name_it : o.name_en}
              width={600}
              height={750}
              className="aspect-[4/5] w-full rounded-md object-cover"
            />
            <span className="font-heading text-xl">{locale === 'it' ? o.name_it : o.name_en}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
