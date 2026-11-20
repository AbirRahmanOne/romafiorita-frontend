import { getTranslations } from 'next-intl/server';
import { getReviews } from '@/lib/catalog';

/**
 * Renders ONLY real review data. Empty → the block is hidden (content-rules).
 * Never hard-code ratings or review counts.
 */
export async function ReviewsSection() {
  const reviews = getReviews();
  if (reviews.length === 0) return null;

  const t = await getTranslations('reviews');
  return (
    <section className="mx-auto max-w-shell px-4 pt-20 sm:px-6 lg:px-12 lg:pt-28">
      <span className="text-xs uppercase tracking-[0.14em] text-muted">{t('heading')}</span>
      {/* Real review items render here once /v1/content/reviews returns data. */}
    </section>
  );
}
