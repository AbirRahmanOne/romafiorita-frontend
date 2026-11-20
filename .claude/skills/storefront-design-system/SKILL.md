---
name: storefront-design-system
description: >-
  Use when building or restyling any STOREFRONT UI (apps/storefront). Defines the
  pink editorial florist look: colour tokens, fonts (Cormorant Garamond + DM Sans),
  spacing, component shapes, the product card, tier selector, and dark sections.
  Read before touching storefront components or Tailwind config.
---

# Storefront design system

Elegant editorial florist. Serif display headings with *italic accent words*,
generous whitespace, thin divider lines, 4:5 product photos, dark announcement bar
and footer, a dark "exact-time" section with a huge time display.

## Tokens (CSS vars + Tailwind preset in `packages/ui-tokens`)

```
accent        #C2185B   accent-700 #A3134C   accent-300 #F48FB1   accent-soft #FCE4EC
bg            #FFF7FA   surface    #FFFFFF
text          #3A1F2B   muted      #6B4E5A   divider   #F3D1DE
dark section  #1d1b1a   (light text, pink-300 accents)
success       #2E7D5B
radius-md     14px      shadow-md  soft warm shadow
```

Fonts via `next/font`: **Cormorant Garamond** for headings + the wordmark
("Roma *Fiorita*" — "Fiorita" in accent, italic emphasis), **DM Sans** for body/UI.
Load with `display: swap` and size-adjust so there is no CLS from fonts.

## Rules

- Headings: Cormorant, weight 400, tight line-height (`.95`–1.0), `text-wrap: balance`,
  italic accent spans in `accent-700`. Clamp sizes (`clamp(48px,6.4vw,96px)` for hero h1).
- Body: DM Sans, 16–18px, line-height 1.6, `text-wrap: pretty`.
- Dividers are 1px `divider`; sections separated by whitespace + thin rules, not cards.
- Product/occasion images: `aspect-ratio 4/5`, `object-fit: cover`, `next/image`.
- Buttons: primary = filled `accent`; secondary = outline. Min 44px tap target, visible focus ring.
- Dark sections (`#1d1b1a`): body text neutral-200, accents `accent-300`.
- Money: `Intl.NumberFormat(locale,{style:'currency',currency:'EUR'})` from cents. "All-in".
- Reuse `packages/ui` primitives; do not re-implement Button/Dialog/etc.

## Home section order (match the design exactly)

1 announcement bar (same-day countdown to Rome cut-off) · 2 sticky header (wordmark,
nav, EN/IT, search, account, cart — **no Admin link**) · 3 hero · 4 where-&-when bar
+ visitor-local-time line · 5 four promises · 6 occasions grid · 7 "most sent this
week" with filter chips + product cards + add-to-basket toast · 8 photo-promise
4 steps · 9 dark exact-time section (big time, chips: selected/booked) · 10 reviews
(real data only, else hidden) · 11 "we deliver to" city list · 12 FAQ + florist-on-call
· 13 dark footer (reminder signup, link columns, business identity from config, payments row).

## Product card

`from €X` (lowest active tier) + tier count; tags; rating only if real; image 4:5;
"Add to basket" → toast. On the product page show a **tier selector** (see below).

## Tier selector (Standard / Premium / Luxury — Addendum A)

Three visual cards: name, price (from cents), short description (locale). Selecting a
tier switches the gallery photo, price and "what's included". Premium is the default
pre-selected tier. Inactive tiers render disabled with an "Unavailable today" label
(i18n). Send only `variant_id` onward — never a price.
