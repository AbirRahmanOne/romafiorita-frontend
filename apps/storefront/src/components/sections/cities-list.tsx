import { getTranslations } from 'next-intl/server';
import { cities } from '@rf/mocks';
import { Link } from '@/i18n/routing';

/**
 * "We deliver to" — links to the Rome same-day hub and each national city landing page.
 * City names are real geography (not fabricated content). Rome leads, then the rest.
 */
export async function CitiesList({ city }: { city: string }) {
  const t = await getTranslations('cities');
  const national = cities.filter((c) => c.zone !== 'ROME');

  return (
    <section className="mt-20 border-y border-divider lg:mt-28">
      <div className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-12">
        <span className="text-xs uppercase tracking-[0.14em] text-muted">{t('eyebrow', { city })}</span>
        <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-heading text-4xl leading-tight lg:text-5xl">
          <Link href="/flower-delivery-rome" className="italic text-accent-700">
            {city} /
          </Link>
          {national.map((c, i) => (
            <Link
              key={c.slug}
              href={{ pathname: '/city/[slug]', params: { slug: c.slug } }}
              className="text-text hover:text-accent-700"
            >
              {c.name}
              {i < national.length - 1 ? ' /' : ''}
            </Link>
          ))}
          <Link href="/send-flowers-to-italy" className="italic text-accent-700">
            {t('allItaly')}
          </Link>
        </nav>
      </div>
    </section>
  );
}
