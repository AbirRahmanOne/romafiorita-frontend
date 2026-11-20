import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { VerifyClient } from '@/components/verify-client';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VerifyClient />;
}
