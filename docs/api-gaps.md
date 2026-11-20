# API gaps — contract items not yet in the backend OpenAPI

When something the frontend needs is missing or ambiguous in the backend's
OpenAPI, log it here instead of inventing types. MSW mocks these so both apps run
today; replace with the generated client once the backend ships the endpoint.

Format: `endpoint/field — what we need — current mock assumption`.

## Open

- `GET /v1/content/reviews` — real reviews/ratings for the storefront reviews
  block and product pages. Mock returns `[]` so the block hides by default
  (never fabricate ratings). Shape assumed:
  `{ source, rating, count, items: [{ text, author, route, date }] }`.
- `GET /v1/content/stats` — site-wide trust stats ("bouquets sent", "countries",
  founding year). Mock returns nulls → stats hidden.
- `GET /v1/config/business` — company name, address, P.IVA, PEC, phone, WhatsApp,
  enabled payment methods, document-title label. Mock returns empty strings →
  identity fields hidden.
- `GET /v1/delivery/check` — confirm exact response: `zone (ROME|NATIONAL)`,
  `types[]`, `fees{standard,window,exact}` (cents), `cutoff` (ISO, Europe/Rome).
- Product `variants[]` — tiers STANDARD/PREMIUM/LUXURY per Addendum A. Confirm
  field names: `{id, tier, price_cents, description_it, description_en, images[],
  active, is_default, same_day, exact_time}`.
- Payment requests (Addendum C/D): `POST /v1/admin/payment-requests`, list,
  `PATCH` (edit → regenerate token), `/cancel`, `/resend`, `/duplicate`, `/pdf`;
  public `GET /v1/pay/{token}`, `POST /v1/pay/{token}/intent`, `POST /v1/verify`.
  All mocked. Confirm: token format, expiry semantics, single-use, capture mode
  (auto for pay links), that PATCH invalidates the old token, and the `/pdf` byte
  format (mock returns a stub `application/pdf`). Create accepts `discount_cents`
  and `hide_sender`.
- Payments dashboard (Addendum B/D): `/v1/admin/payments`, `/held`,
  `/{id}/capture`, `/{id}/cancel-hold`, `/{id}/refund` (full/partial + reason),
  `/refunds`, `/payouts`, `/balance`, `/disputes`, `/reports/monthly` (returns
  `{month, filename, csv}`). All mocked. Confirm hold-expiry fields per method and
  the real refund request shape.
- `GET /v1/pay/{token}` → `local_estimate {currency, amount_cents}`: the backend
  must compute FX + the customer's currency (frontend never computes amounts). Mock
  returns a demo USD estimate at a fixed rate — replace with real FX; the UI labels
  it "estimate only".
- `GET /v1/admin/orders/stream` — SSE event shape for the realtime inbox and
  payment-request-paid notifications.
- `GET /v1/content/cities` — delivery cities for the SEO city landing pages.
  Mock returns Rome (zone ROME) + national cities. Shape assumed:
  `{ items: [{ slug, name, zone }] }`. Backend should own the canonical list and,
  ideally, per-city intro copy (we template it in i18n for now).
- `GET /v1/content/journal` — editorial articles for `/journal`. Mock returns `[]`
  so the index shows an empty state (never fabricate blog posts). Shape assumed:
  `{ items: [{ slug, title_it, title_en, date, excerpt_*, body_*, cover }] }`.
  Rome neighbourhood list (`romeAreas`) is currently a frontend constant — confirm
  whether the backend should own it too.
