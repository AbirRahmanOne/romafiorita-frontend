---
name: stripe-frontend
description: >-
  Use for all Stripe payment UI (checkout and the pay/[token] page). Covers Stripe.js
  + Payment Element, publishable keys only, backend-created PaymentIntents, and
  manual vs automatic capture per order source. Read before touching payment code.
---

# Stripe frontend

Stripe.js + **Payment Element** (cards, Apple Pay, Google Pay, PayPal, Klarna).
Shown payment methods must match what the backend/Stripe actually enables — don't
hard-code the method list.

## Golden rule

The frontend **never computes the amount it charges.** It asks the backend to create
the PaymentIntent and only confirms it:

- Storefront checkout → `POST /v1/checkout` returns `client_secret` + order number
  `RF-YYYY-NNNNN`. Payment is **authorised (held), manual capture** — the backend
  captures when the shop accepts the order.
- Pay link → `POST /v1/pay/{token}/intent` returns `client_secret`. The order is
  already agreed, so **automatic capture** (configurable) — charged once paid.

Capture mode is decided by the backend per order source; the frontend just confirms
the intent it is given. Never call capture/cancel from the storefront.

## Implementation

- Only the publishable key (`pk_...`) in the frontend, from env. Never a secret key.
- `@stripe/stripe-js` + `@stripe/react-stripe-js`. `<Elements>` with the
  `clientSecret`; `<PaymentElement>`; `stripe.confirmPayment({ elements,
  confirmParams: { return_url } })`.
- Handle statuses: `requires_action`, `processing`, `succeeded`, failure. On success
  go to `/order/confirmation/{number}` (checkout) or the paid state (pay page).
- Show the statement descriptor note ("ROMAFIORITA will appear on your statement").
- Respect locale: pass `locale` to Elements.

## Admin capture (admin app only)

Payments dashboard captures/cancels holds via the backend (`/capture`,
`/cancel-hold`) — OWNER/MANAGER only. Declining an order releases the hold. This is
backend-driven; the admin UI only triggers it. See `admin-orders-realtime` and
`payment-requests`.
