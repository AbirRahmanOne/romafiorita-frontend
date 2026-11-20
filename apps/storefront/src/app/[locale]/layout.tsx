import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { settings } from '@rf/mocks';
import { routing, type Locale } from '@/i18n/routing';
import { CartProvider } from '@/lib/cart';
import { AnnouncementBar } from '@/components/announcement-bar';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import { JsonLd, organizationLd, floristLd } from '@/lib/seo';
import '../globals.css';

const heading = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL('https://romafiorita.com'),
  title: { default: 'Roma Fiorita', template: '%s · Roma Fiorita' },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body>
        <JsonLd data={organizationLd()} />
        <JsonLd data={floristLd()} />
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <AnnouncementBar city={settings.city} cutoffHour={settings.same_day_cutoff_hour} />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <CookieBanner />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
