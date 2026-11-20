---
name: admin-orders-realtime
description: >-
  Use for the admin real-time new-orders inbox and order lifecycle actions. Covers SSE,
  browser notification + sound, Accept/Decline (releases Stripe hold), mobile-first
  order cards, payment-request-paid events, and the status timeline. Read before
  touching admin orders/inbox code.
---

# Admin orders — real-time

## Real-time inbox (new orders)

- Subscribe to `GET /v1/admin/orders/stream` (SSE). On a new order: prepend the card,
  show a **browser notification** (request permission once) and play a short **sound**
  (respect a mute toggle + `prefers-reduced-motion`/user setting).
- Also handle **payment-request-paid** events here (Addendum C) — a paid custom order
  enters the normal lifecycle; notify the same way.
- Reconnect with backoff on disconnect; dedupe by order id.
- Each order card: Accept / Accept with change / Decline (reason). **Decline posts a
  reason → backend releases the Stripe hold.** Show an auto-accept indicator if on.
- Must work well on a phone: single-column cards, big tap targets, actions reachable.

## Order actions → backend

`accept`, `decline(reason)`, `photo(upload)`, `send-photo`, `approve`,
`dispatch(rider)`, `deliver`. Use TanStack Query mutations with **optimistic UI where
safe** (status pill advances immediately, rolls back on error) and invalidate the
orders/dashboard queries on settle.

## Lifecycle & detail

`New → Accepted → Awaiting photo → Photo sent → Approved → Out for delivery →
Delivered` (+ Declined / Refunded / Problem). The detail drawer/modal shows the
status timeline and a single "next action" button whose label maps from the current
status (e.g. Awaiting photo → "Send photo to sender"). Photo upload → "Send photo to
sender" is the trust-critical step.

Every view: loading skeleton, empty state, error + retry. Roles: FLORIST/RIDER never
see payment totals.
