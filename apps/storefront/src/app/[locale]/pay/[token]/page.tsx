import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PayClient } from '@/components/pay-client';

// Pay links must never be indexed (payment-requests skill) and are excluded from the sitemap.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <PayClient token={token} />;
}
