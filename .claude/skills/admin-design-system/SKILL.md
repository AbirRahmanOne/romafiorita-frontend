---
name: admin-design-system
description: >-
  Use when building or restyling any ADMIN UI (apps/admin). Defines the blue/white
  dashboard look: colour tokens, Plus Jakarta Sans, cards, the dark sidebar, top bar,
  status pills (never colour-only), tables, and the KPI card. Read before touching
  admin components or Tailwind config.
---

# Admin design system

Clean operational dashboard. Dark sidebar, white cards on a light grey canvas,
blue primary. Keep it exactly as the design.

## Tokens (`packages/ui-tokens` admin preset)

```
bg        #f5f7fb   surface #ffffff   card border #e6e9f0   radius 12px
text      #111827   muted   #6b7280
sidebar   #111827   (RF logo tile in blue)
primary   #2563eb   hover #1d4fd0   blue-100 #eaf1fe
```

Font: **Plus Jakarta Sans** (400/500/600/700), headings + body.

## Status pills — ALWAYS text + colour (never colour-only)

```
New / Awaiting      amber  bg #fff4e5  fg #b45309
Photo sent          blue   bg #eaf1fe  fg #1d4ed8
Approved            violet bg #ede9fe  fg #6d28d9
Out for delivery    sky    bg #e0f2fe  fg #0369a1
Delivered           green  bg #dcfce7  fg #15803d
Declined / Refunded red / slate
```

Pill = rounded-full, 12px, weight 600, `padding:4px 10px`. Use the shared `Pill`
from `packages/ui` with a `status` prop; don't inline colours per call site.

## Layout

- Sidebar (sticky, full height, `#111827`): Dashboard, Orders, Catalogue, Insights,
  View storefront; user block pinned at the bottom. Active item = blue background.
- Top bar: page title + subtitle (left); Rome date + live clock, search, Export, and
  a blue **"New phone order"** primary button (right). Insights view swaps search for
  a range switcher.
- Cards: white, 1px `#e6e9f0`, radius 12, `padding ~20px`.
- Tables: `min-width` + horizontal scroll on mobile; uppercase 12px muted headers,
  `tabular-nums` for numbers/money; row hover `#f5f8ff`; whole row clickable → detail.
- Charts: Recharts (revenue bars, clicks/impressions line) with hover tooltips.

## Order lifecycle (drives detail action buttons)

`New → Accepted → Awaiting photo → Photo sent → Approved → Out for delivery →
Delivered` (+ Declined / Refunded / Problem). The "next action" button label maps
from current status (e.g. Awaiting photo → "Send photo to sender").

## Every screen

Loading skeletons, empty states, error states with retry, optimistic UI where safe.
Roles: FLORIST and RIDER never see Payments.
