import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

const STEPS = ['choose', 'pay', 'receive', 'delivered'] as const;
const NUMERALS = ['i.', 'ii.', 'iii.', 'iv.'];

export async function PhotoPromise() {
  const t = await getTranslations('photoPromise');

  return (
    <section id="how" className="mt-20 border-y border-divider bg-surface lg:mt-28">
      <div className="mx-auto grid max-w-shell items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
        <figure className="m-0">
          <Image
            src="https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=1000&h=1100&fit=crop&q=75&auto=format"
            alt="A florist photographing a finished bouquet on the workbench"
            width={1000}
            height={1100}
            className="aspect-[10/11] w-full rounded-md object-cover"
          />
        </figure>
        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-[0.14em] text-accent-700">{t('eyebrow')}</span>
          <h2 className="text-5xl font-normal leading-[0.98] lg:text-7xl">
            {t('titleLead')} <em className="text-accent-700">{t('titleAccent')}</em> {t('titleRest')}
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted">{t('body')}</p>
          <ol className="m-0 list-none border-t border-divider p-0">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className="grid grid-cols-[52px_1fr] gap-3 border-b border-divider py-4"
              >
                <span className="font-heading text-2xl leading-none text-accent">{NUMERALS[i]}</span>
                <span className="text-[15px]">
                  <strong className="font-semibold">{t(`steps.${step}.title`)}</strong> —{' '}
                  {t(`steps.${step}.body`)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
