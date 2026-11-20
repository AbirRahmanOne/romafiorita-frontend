---
name: testing-frontend
description: >-
  Use when writing or running tests for either app. Covers Vitest + Testing Library
  for units/components and Playwright E2E (against MSW mocks) for both apps. Read
  before adding tests or test config.
---

# Testing (frontend)

Every feature ships with tests; lint + typecheck + tests must be green (DoD).

## Unit / component — Vitest + Testing Library

- Co-locate `*.test.ts(x)` next to source. jsdom environment.
- Test behaviour, not markup. Query by role/label (accessibility doubles as test API).
- Cover money/time formatting, locale switching, tier selection, and any branch/parser.
- Reuse MSW handlers from `packages/mocks` via `setupServer` for data-driven components.
- Keep it lazy: one meaningful test per non-trivial logic path, no snapshot spam.

## E2E — Playwright (against mocks)

Run both apps with mocks on; no real backend. Required flows:

- Storefront: browse → product → **select tier** → delivery check → checkout with
  Stripe test card → confirmation; **checkout total matches the backend quote**.
- Storefront: track an order via token.
- Admin: login → see real-time new order → Accept → advance lifecycle → upload &
  send photo.
- **Admin creates a custom payment request → customer pays on `/pay/{token}` →
  order appears as paid** (Addendum E).

## CI

ESLint, Prettier check, typecheck, Vitest, Playwright, and Lighthouse CI on the
storefront (assert LCP/INP/CLS budgets). Fail the build on regressions.
