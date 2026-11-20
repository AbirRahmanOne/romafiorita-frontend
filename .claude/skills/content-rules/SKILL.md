---
name: content-rules
description: >-
  Use whenever adding copy, sample data, numbers, or business identity to EITHER app.
  Prevents shipping the design's placeholder content (fake reviews/stats, Florence
  leftovers, hard-coded fees, "Invoice") as real. Read before writing any user-facing
  content or seed data.
---

# Content rules

The design prototypes contain invented content. **None of it ships as genuine.**
Full checklist in `docs/content-todo.md`; the load-bearing rules:

## Never fabricate social proof

- Ratings, review counts, "41,000+ bouquets", "96 countries", "since 1987", customer
  quotes, staff names/photos — render **only when real API/config data exists**. No
  data → hide the block or show an empty state. Never seed fake reviews as real.

## Rome, not Florence

- No "Via dei Serragli", postcode `50125`/"Oltrarno", phone prefix `055`. Use Rome
  placeholders: postcode `001xx`, phone `+39 06 …`. Business address from config.

## Business identity from config

- Company name, address, P.IVA, PEC, phone, WhatsApp read from config; leave empty
  until the client provides them. **Hide the P.IVA line entirely while empty.**
- Payment-request docs/pages say **"Order summary / Payment request", not
  "Invoice"/"Fattura"** (no VAT number yet). Title is a configurable string.

## No invented numbers

- Same-day cut-off, 2-hour-window fee and exact-time fee come from the API/settings —
  never hard-code "16:00"/"13:00"/"€9".
- Payment-method icons match what Stripe actually enables, not a fixed list.
- Occasion/product counts come from the catalog API.

## Removed at launch

- No wine/alcohol: remove "bottle of Chianti" and the "Gifts & wine" footer link.

When you add anything that *looks* like a stat, review, or identity field, ask: is
there real data? If not, wire it to config/API and add it to `docs/content-todo.md`.
