'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { convertFromRome, visitorZone } from '@/lib/time';

const CHIPS: { time: string; booked?: boolean }[] = [
  { time: '19:00' },
  { time: '19:15' },
  { time: '19:30' },
  { time: '19:45', booked: true },
  { time: '20:00' },
  { time: '23:45' },
];

export function ExactTimeSection({ city }: { city: string }) {
  const t = useTranslations('exactTime');
  const [selected, setSelected] = useState('19:30');
  const [zones, setZones] = useState<string | null>(null);

  useEffect(() => {
    const { zone, label } = visitorZone();
    setZones(
      t('zones', {
        romeTime: selected,
        localTime: convertFromRome(selected, zone),
        localCity: label,
        nyTime: convertFromRome(selected, 'America/New_York'),
        dhakaTime: convertFromRome(selected, 'Asia/Dhaka'),
      }),
    );
  }, [selected, t]);

  return (
    <section id="exact" className="mt-20 bg-ink text-neutral-200 lg:mt-28">
      <div className="mx-auto grid max-w-shell items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-[0.14em] text-accent-300">
            {t('eyebrow', { city })}
          </span>
          <h2 className="text-5xl font-normal leading-[0.98] text-neutral-100 lg:text-7xl">
            {t('titleLead')} <em className="text-accent-300">{t('titleAccent')}</em>
          </h2>
          <p className="max-w-md leading-relaxed">{t('body')}</p>
          <a className="btn btn-primary self-start border-accent-300 px-6 text-base" href="#bouquets">
            {t('bookTime')}
          </a>
        </div>
        <div className="flex flex-col gap-5">
          <span className="font-heading text-[clamp(110px,13vw,190px)] leading-[0.85] tabular-nums text-neutral-100">
            {selected}
          </span>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => {
              const on = c.time === selected;
              return (
                <button
                  key={c.time}
                  type="button"
                  disabled={c.booked}
                  aria-pressed={on}
                  onClick={() => setSelected(c.time)}
                  className={`flex min-h-[54px] min-w-[92px] flex-col items-center justify-center rounded-md border text-[17px] tabular-nums ${
                    c.booked
                      ? 'cursor-not-allowed border-dashed border-neutral-600 text-neutral-500'
                      : on
                        ? 'border-accent-300 text-accent-300'
                        : 'border-neutral-600 text-neutral-200'
                  }`}
                >
                  {c.time}
                  <span className="text-[10px] uppercase tracking-wider">
                    {c.booked ? t('booked') : on ? t('selected') : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-sm tabular-nums text-neutral-400">{zones ?? ' '}</span>
        </div>
      </div>
    </section>
  );
}
