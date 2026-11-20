import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Locales + localised slugs (EN ↔ IT). Keep the pathname map here so metadata,
 * hreflang and the language switcher all agree. No geolocation auto-redirect.
 */
export const routing = defineRouting({
  locales: ['en', 'it'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/bouquets': { en: '/bouquets', it: '/bouquet' },
    '/occasions/[slug]': { en: '/occasions/[slug]', it: '/occasioni/[slug]' },
    '/product/[slug]': { en: '/product/[slug]', it: '/prodotto/[slug]' },
    '/cart': { en: '/cart', it: '/carrello' },
    '/checkout': { en: '/checkout', it: '/pagamento' },
    '/order/confirmation/[number]': {
      en: '/order/confirmation/[number]',
      it: '/ordine/conferma/[number]',
    },
    '/track/[token]': { en: '/track/[token]', it: '/traccia/[token]' },
    '/pay/[token]': { en: '/pay/[token]', it: '/paga/[token]' },
    '/verify': { en: '/verify', it: '/verifica' },
    '/delivery': { en: '/delivery', it: '/consegna' },
    '/flower-delivery-rome': { en: '/flower-delivery-rome', it: '/consegna-fiori-roma' },
    '/flower-delivery-rome/[area]': {
      en: '/flower-delivery-rome/[area]',
      it: '/consegna-fiori-roma/[area]',
    },
    '/city/[slug]': { en: '/flower-delivery/[slug]', it: '/consegna-fiori/[slug]' },
    '/send-flowers-to-italy': { en: '/send-flowers-to-italy', it: '/invia-fiori-in-italia' },
    '/journal': '/journal',
    '/journal/[slug]': '/journal/[slug]',
    '/faq': '/faq',
    '/about': { en: '/about', it: '/chi-siamo' },
    '/contact': { en: '/contact', it: '/contatti' },
    '/terms': { en: '/terms', it: '/termini' },
    '/privacy': { en: '/privacy', it: '/privacy' },
    '/cookies': { en: '/cookies', it: '/cookie' },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
