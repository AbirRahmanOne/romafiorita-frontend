---
name: api-client-and-mocks
description: >-
  Use when calling the backend API or working with mock data. Covers the generated
  typed client (openapi-typescript + openapi-fetch — never hand-write API types) and
  the MSW mock layer that lets both apps run before the backend exists. Read before
  adding API calls, handlers, or seed data.
---

# API client & mocks

## Generated client (`packages/api-client`)

- Types are **generated**, never hand-written. Tool: `openapi-typescript` for types +
  `openapi-fetch` for the typed client.
- Source: `OPENAPI_URL` (e.g. `http://localhost:8000/openapi.json`) or a committed
  `openapi.json`. Regenerate with `pnpm gen:api`.
- Export one configured `client` (base URL from env, `credentials:'include'` for
  admin cookie auth). Apps import typed paths from here — no raw `fetch` to the API.
- If an endpoint/field is missing from OpenAPI, **log it in `docs/api-gaps.md`** and
  mock it; don't invent a permanent type.

## Mocks (`packages/mocks`, MSW)

- Handlers for every endpoint in the API contract (prompt §4 + Addendum D), seeded
  from the design's sample data (products, orders, occasions, insights, keywords).
- Toggle: `NEXT_PUBLIC_USE_MOCKS` (storefront) / `VITE_USE_MOCKS` (admin). On → start
  the MSW worker before the app renders.
- Browser: `setupWorker`; tests/node: `setupServer`. Share handlers between both.

## Seed principles

- Money as **integer cents**. `/cart/quote` + `/checkout` compute totals server-side
  (the mock recomputes from seed prices — the UI must not).
- **Reviews/ratings/stats mocks return empty/null by default** so trust blocks hide.
  Never seed fake reviews as real (see `content-rules`).
- Products carry `variants[]` (STANDARD/PREMIUM/LUXURY, cents, is_default, active).
- Rome addresses/postcodes/phone placeholders only (no Florence leftovers).
- `/admin/orders/stream` SSE: emit periodic new-order and payment-request-paid events
  for the realtime inbox demo.
