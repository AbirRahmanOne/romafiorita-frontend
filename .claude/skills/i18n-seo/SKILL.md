---
name: i18n-seo
description: >-
  Use for storefront localisation (next-intl, /it + /en) and SEO: metadata,
  hreflang, localised slugs, sitemap/robots, JSON-LD, Core Web Vitals. Read before
  adding storefront pages, routes, messages, or metadata.
---

# i18n & SEO (storefront)

## i18n (next-intl)

- Locales `it` and `en`, routes `/it/...` and `/en/...`. **No auto-redirect by
  geolocation.** EN/IT switcher preserves the current path.
- All user text in `apps/storefront/messages/it.json` + `en.json`. Nothing hard-coded.
  Italian is ~25% longer — never fix widths to EN; let layouts flex/wrap.
- Money: `Intl.NumberFormat(locale,{style:'currency',currency:'EUR'})` from integer cents.
- Dates/times: `Intl.DateTimeFormat` with explicit `timeZone`. Europe/Rome is truth;
  also show the visitor's local time (resolve via `Intl...resolvedOptions().timeZone`).
- Tier labels (Standard/Premium/Luxury) live in messages so they can change later.

## Localised slugs

Slugs differ per locale and map 1:1, e.g.
`/en/flower-delivery-rome` ↔ `/it/consegna-fiori-roma`,
`/en/send-flowers-to-italy` ↔ `/it/invia-fiori-in-italia`.
Keep the map in one module so metadata, hreflang and the switcher agree.

## SEO per page

- `generateMetadata` per page + locale; canonical on `https://romafiorita.com`.
- hreflang `it`, `en`, `x-default` pointing at the matching localised slug.
- `sitemap.ts` per locale; `robots.ts` allowing Googlebot, Bingbot, OAI-SearchBot,
  ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot.
- **Exclude** `pay/[token]` and `verify` from the sitemap and set `noindex` there.
- JSON-LD: Organization, Florist/LocalBusiness, Product + Offer + shippingDetails
  (AggregateOffer low/high for tiers), BreadcrumbList. Business identity fields come
  from config — omit JSON-LD fields that are empty (no fake P.IVA/address).
- Product, occasion, city pages: SSG + revalidation. Cart/checkout/pay: dynamic.

## Performance

LCP < 2.5s, INP < 200ms, CLS < 0.1. `next/image` everywhere; `next/font` with
`display:swap` + size-adjust (no font CLS). Analytics loads only after cookie consent.
