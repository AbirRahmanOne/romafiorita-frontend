'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatCountdown, secondsToCutoff } from '@/lib/time';

/** Same-day countdown to the Rome cut-off. `cutoffHour`/`city` come from settings. */
export function AnnouncementBar({ city, cutoffHour }: { city: string; cutoffHour: number }) {
  const t = useTranslations('announcement');
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(secondsToCutoff(cutoffHour)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cutoffHour]);

  return (
    <div className="bg-ink text-neutral-200">
      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-3 px-4 py-2 text-xs tracking-wider sm:px-6 lg:px-12">
        <span>
          {t('sameDay', {
            city,
            countdown: countdown ?? '--:--:--',
          })}
        </span>
        <span className="text-neutral-400">{t('photo')}</span>
      </div>
    </div>
  );
}
