import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/**
 * Allow the search + AI crawlers we want. pay/verify are kept out of the index via
 * per-page `noindex` (localised slugs make a reliable robots path match impossible).
 */
const BOTS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
