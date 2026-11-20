'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';

/** EN/IT switch that keeps the current path (incl. dynamic params) via the slug map. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const other = locale === 'en' ? 'it' : 'en';

  function switchTo() {
    router.replace(
      // params carries dynamic segments (e.g. slug) for the current route
      { pathname, params } as Parameters<typeof router.replace>[0],
      { locale: other },
    );
  }

  return (
    <div className="text-sm tracking-wider">
      <span className="underline underline-offset-4">{locale.toUpperCase()}</span>
      <span className="text-muted"> / </span>
      <button type="button" className="text-muted hover:text-accent-700" onClick={switchTo}>
        {other.toUpperCase()}
      </button>
    </div>
  );
}
