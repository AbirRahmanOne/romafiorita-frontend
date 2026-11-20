'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { convertFromRome, visitorZone } from '@/lib/time';

const ROME_TIME = '19:30';

/** Postcode / date / time bar + the visitor's-local-time explainer line. */
export function WhereWhenBar() {
  const t = useTranslations('whereWhen');
  const [local, setLocal] = useState<{ time: string; city: string } | null>(null);

  useEffect(() => {
    const { zone, label } = visitorZone();
    setLocal({ time: convertFromRome(ROME_TIME, zone), city: label });
  }, []);

  return (
    <section className="mx-auto max-w-shell px-4 sm:px-6 lg:px-12">
      <form className="mt-10 flex flex-wrap rounded-md border border-divider bg-surface shadow-md">
        <label className="flex-[2_1_260px] border-r border-divider px-5 py-3.5">
          <span className="block text-xs uppercase tracking-wider text-muted">{t('deliverTo')}</span>
          <input
            className="mt-1 w-full border-0 bg-transparent p-0 text-lg outline-none"
            placeholder={t('deliverPlaceholder')}
            aria-label={t('deliverTo')}
          />
        </label>
        <label className="flex-1 basis-44 border-r border-divider px-5 py-3.5">
          <span className="block text-xs uppercase tracking-wider text-muted">{t('date')}</span>
          <input
            type="date"
            className="mt-1 w-full border-0 bg-transparent p-0 text-lg outline-none"
            aria-label={t('date')}
          />
        </label>
        <label className="flex-1 basis-44 border-r border-divider px-5 py-3.5">
          <span className="block text-xs uppercase tracking-wider text-muted">
            {t('timeInItaly')}
          </span>
          <input
            type="time"
            defaultValue={ROME_TIME}
            className="mt-1 w-full border-0 bg-transparent p-0 text-lg tabular-nums outline-none"
            aria-label={t('timeInItaly')}
          />
        </label>
        <div className="flex items-stretch p-3">
          <button type="submit" className="btn btn-primary w-full px-8 text-base">
            {t('showBouquets')}
          </button>
        </div>
      </form>
      {local ? (
        <p className="mt-3 text-sm text-muted">
          {t('localNote', { romeTime: ROME_TIME, localTime: local.time, localCity: local.city })}
        </p>
      ) : null}
    </section>
  );
}
