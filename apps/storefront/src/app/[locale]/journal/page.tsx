import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { journal } from '@rf/mocks';
import { altMeta } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'journal' });
  return {
    title: t('title'),
    description: t('intro'),
    alternates: altMeta(locale, '/journal'),
  };
}

export default async function JournalIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('journal');
  const df = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });

  return (
    <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-12">
      <h1 className="font-heading text-5xl leading-none lg:text-6xl">{t('title')}</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">{t('intro')}</p>

      {journal.length === 0 ? (
        <div className="mt-14 rounded-md border border-divider bg-surface px-6 py-16 text-center text-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {journal.map((post) => (
            <Link
              key={post.slug}
              href={{ pathname: '/journal/[slug]', params: { slug: post.slug } }}
              className="flex flex-col gap-3 text-text"
            >
              <Image
                src={post.cover}
                alt=""
                width={600}
                height={400}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="aspect-[3/2] w-full rounded-md object-cover"
              />
              <time className="text-xs uppercase tracking-wider text-muted" dateTime={post.date}>
                {df.format(new Date(post.date))}
              </time>
              <span className="font-heading text-2xl leading-tight">
                {locale === 'it' ? post.title_it : post.title_en}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
