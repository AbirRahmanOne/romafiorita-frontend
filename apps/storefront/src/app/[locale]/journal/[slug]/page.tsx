import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { journal } from '@rf/mocks';
import { altMeta, breadcrumbLd, JsonLd, pathFor, SITE } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return journal.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = journal.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: locale === 'it' ? post.title_it : post.title_en,
    description: locale === 'it' ? post.excerpt_it : post.excerpt_en,
    alternates: altMeta(locale, { pathname: '/journal/[slug]', params: { slug } }),
  };
}

export default async function JournalPost({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = journal.find((p) => p.slug === slug);
  if (!post) notFound();

  const title = locale === 'it' ? post.title_it : post.title_en;
  const body = locale === 'it' ? post.body_it : post.body_en;
  const df = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: post.cover,
    datePublished: post.date,
    mainEntityOfPage: `${SITE}${pathFor(locale, { pathname: '/journal/[slug]', params: { slug } })}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={articleLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: pathFor(locale, '/') },
          { name: 'Journal', path: pathFor(locale, '/journal') },
          { name: title, path: pathFor(locale, { pathname: '/journal/[slug]', params: { slug } }) },
        ])}
      />
      <time className="text-xs uppercase tracking-wider text-muted" dateTime={post.date}>
        {df.format(new Date(post.date))}
      </time>
      <h1 className="mt-3 font-heading text-5xl leading-none lg:text-6xl">{title}</h1>
      <Image
        src={post.cover}
        alt=""
        width={900}
        height={600}
        priority
        sizes="(min-width:768px) 768px, 100vw"
        className="mt-8 aspect-[3/2] w-full rounded-md object-cover"
      />
      <div className="prose mt-8 max-w-none whitespace-pre-line leading-relaxed text-text">
        {body}
      </div>
    </article>
  );
}
