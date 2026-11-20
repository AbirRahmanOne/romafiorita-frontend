---
name: payment-requests
description: >-
  Use for the custom-order → payment-request flow: admin creation, sharing (WhatsApp,
  email, link, QR, branded PDF), the public /pay/[token] page, the /verify page, link
  security, and the anti-scam trust checklist. Read before touching any pay/verify or
  custom-order code.
---

# Payment requests (custom orders)

The shop agrees a custom bouquet on WhatsApp/email, then sends an **official,
branded** Roma Fiorita payment link from its own domain — never a bank transfer or a
random link. Trust is the whole point.

## Admin — create (Orders → "New custom order" / "New phone order")

1. Items: catalogue products + tier, and/or free-text custom items (title IT/EN,
   description, reference photo, price).
2. Recipient in Italy (postcode validated), date, time type + slot, card message,
   hide-sender option.
3. Customer: name, email, WhatsApp (with country code), language (IT/EN).
4. Pricing: items + delivery/time fee + optional discount — **server calculates the
   final total** (`POST /v1/admin/payment-requests`).
5. Expiry: default 48h; optional internal note.
6. Backend creates order `RF-YYYY-NNNNN`, status `PAYMENT_REQUESTED`, secure token.

## Sharing

- WhatsApp: `wa.me/<number>` with a pre-filled bilingual message incl. order number,
  amount, the `romafiorita.com/<locale>/pay/<token>` link and "valid for 48 hours".
- Email: branded from `ordini@romafiorita.com` with summary + "Pay securely" button.
- Copy link, QR code.
- Branded PDF "Order summary & payment request" (logo, order no., items + photos,
  delivery, total, link + QR, expiry, business contacts). **Title = "Order summary /
  Payment request", NOT "Invoice"/"Fattura"** (configurable string — no VAT yet).

## Public pay page `/[locale]/pay/[token]`

Own domain. Roma Fiorita header/footer; order no., items + photos, recipient, date/
time, card message, total in EUR + local-currency estimate, expiry countdown. Pay via
Stripe Payment Element — **automatic capture** (agreed order, configurable; see
`stripe-frontend`). States: unpaid / paid (→ confirmation + tracking) / expired (→
"Ask us for a new link" WhatsApp) / cancelled. **`noindex`; excluded from sitemap.**

## Anti-scam trust checklist (pay page)

- Secure-padlock note + "Payments processed by Stripe".
- Statement descriptor: "ROMAFIORITA will appear on your statement".
- Business contact + WhatsApp button.
- "How to check this is genuine" note linking to `/[locale]/verify`.

## Verify page `/[locale]/verify`

Customer enters order number + email → `POST /v1/verify` confirms the request is
genuine and shows amount + status. Linked from the pay page, emails and the PDF.
`noindex`.

## Link security

Random unguessable token, single-use, expires (default 48h). Editing before payment
regenerates the token. Admin list shows status (sent/viewed/paid/expired/cancelled),
last-viewed, resend, edit, cancel, duplicate. Real-time notify on paid (see
`admin-orders-realtime`); optional 24h-before-expiry reminder.
