---
name: checkout-and-delivery-ui
description: >-
  Use for the delivery checker, cart, and the 4-step checkout on the storefront.
  Covers Rome vs national zones, 15-min exact slots, time fees from API, variant_id,
  server-calculated totals, and the sticky order summary. Read before touching
  delivery/cart/checkout UI.
---

# Checkout & delivery UI

## Delivery model

- **Rome** (own riders, same-day): Standard (any time today), 2-hour window (+fee),
  or exact time ±15 min (+fee). Slots every 15 min, 07:00–23:45.
- **Rest of Italy**: next-day boxed bouquet by courier, **date only**.
- Zone, available types, fees and cut-off come from `GET /v1/delivery/check` —
  **never hard-code "16:00" or "€9"**. Slots from `GET /v1/delivery/slots`
  (available/booked). Delivery happens only inside Italy; buyers are anywhere.

## Delivery checker (product page + checkout step 1)

postcode → validate via `/delivery/check` → show zone + allowed time types →
pick date → if Rome exact, show slot chips (booked chips disabled, `aria-disabled`,
dashed border, never colour-only). Show the sender's local time next to Rome time.

## Checkout (4 steps, order summary always visible)

1. Recipient in Italy: postcode validated via `/delivery/check`; address type
   home / office / hospital / funeral home / hotel.
2. Delivery date + time type + slot; show the sender's local time too.
3. Sender details.
4. Stripe Payment Element (see `stripe-frontend`); terms checkbox **including the
   perishable-goods right-of-withdrawal exclusion**.

Order summary: sticky on desktop, collapsible on mobile. Shows product **+ tier**
(e.g. "Rosa Classica · Luxury"), add-ons, card message, delivery/time fee, total.

## Money & variants — hard rules

- The frontend **never computes the charged total.** Send the cart to
  `POST /v1/cart/quote`; display exactly what it returns (items, add-ons, time fee,
  delivery). Re-quote on any change.
- Send **`variant_id` only** (the chosen tier). Never send a price. `/cart/quote`
  and `/checkout` recalculate everything server-side.
- Amounts are integer cents; format with `Intl.NumberFormat`.
- Card message: live preview; store IT/EN as entered. Add-ons by id.

Carry product + tier through cart → checkout → confirmation → tracking so every
surface shows the same thing.
