import { getTranslations } from 'next-intl/server';

const KEYS = ['photo', 'minute', 'price', 'florist'] as const;

export async function Promises({ city }: { city: string }) {
  const t = await getTranslations('promises');

  return (
    <section className="mx-auto max-w-shell px-4 sm:px-6 lg:px-12">
      <h2 className="sr-only">{t('heading')}</h2>
      <div className="mt-16 grid gap-0 border-y border-divider sm:grid-cols-2 lg:grid-cols-4">
        {KEYS.map((key, i) => (
          <div key={key} className="flex flex-col gap-1.5 py-6 pr-5">
            <span className="font-heading text-2xl tabular-nums text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <strong className="text-base font-semibold">{t(`items.${key}.title`)}</strong>
            <span className="text-sm text-muted">{t(`items.${key}.body`, { city })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
