# Content TODO — placeholders that MUST NOT ship as real

The design prototypes contain invented content. None of it may ship as genuine.
Each item below is wired to come from config/CMS/API and is hidden until real data
exists. Enforced by the `content-rules` skill.

## Invented social proof — HIDE until real API data exists
- [ ] Ratings & review counts: "4.9 on Google · 2,184 reviews", "4.8 Trustpilot · 1,326".
      Reviews block renders ONLY `/v1/content/reviews` (or product reviews). No data → hide.
- [ ] "41,000+ bouquets sent from 96 countries" — stat from config/API or omit.
- [ ] "since 1987" / "Hand-tied in Roma since 1987" — founding year from config; omit if empty.
- [ ] Customer quotes (Sofia R., Jonas M.) — real testimonials only.
- [ ] Staff names/photos ("Chiara Benedetti", "Chiara, head florist", "CB") — from config; placeholder avatar until provided.
- [ ] "Usually replies in 4 minutes · Chiara is online now" — from live status or omit.

## Florence leftovers → Rome placeholders
- [ ] "Via dei Serragli" (workshop) → Rome address placeholder, empty until client provides.
- [ ] Postcode `50125` / "Oltrarno" → Rome `001xx` placeholders.
- [ ] Phone prefix `055` / "+39 055 238 4410" → `+39 06 …` placeholder.
- [ ] Footer "Via della Scala 48 — 00153 Roma" + "P.IVA 15382140581" are placeholders — see below.

## Business identity — from config, hide empty fields
- [ ] Company name, address, P.IVA, PEC, phone, WhatsApp. Leave empty until client provides.
- [ ] **Hide the P.IVA line entirely while empty** (no VAT number yet).
- [ ] Payment-request PDF/pay page: title says "Order summary / Payment request",
      NOT "Invoice"/"Fattura". Title is configurable for later.

## SEO landing pages (Phase 6)
- [ ] Journal (`/journal`) ships EMPTY — articles are real editorial content from the
      CMS/API (`GET /v1/content/journal`). Never seed invented blog posts.
- [ ] City / Rome-neighbourhood landing copy is templated per place name in
      `messages/{it,en}.json` (`landing.*`). Place names are real; swap the templated
      intros for client-approved copy before launch if desired.

## Legal & info pages (post-Phase-6 "Other pages")
- [ ] `/terms`, `/privacy`, `/cookies` ship a "text being finalised" placeholder — real
      legal text is client/legal-advisor provided. Do NOT ship invented legalese. The
      perishable-goods withdrawal exclusion on `/terms` is the one real, required note.
- [ ] `/about` copy states the true value prop (photo before delivery, own riders,
      all-in prices) only — no invented history ("since 1987"), staff, or stats.
- [ ] `/contact` shows channels from business config; all hidden until the client
      provides WhatsApp / phone / email (see business identity above).
- [ ] Footer "Track an order" has no landing page (needs a per-order token) — rendered
      as plain text for now.

## Removed at launch
- [ ] No wine/alcohol: remove "bottle of Chianti" (step copy) and "Gifts & wine" footer link.

## From API/settings, never hard-coded
- [ ] Same-day cut-off time (design shows "16:00"/"13:00") → `/delivery/check` cut-off.
- [ ] Time-window fee / exact-time fee (design shows "€9") → delivery fees from API.
- [ ] Payment-method icons must match what is actually enabled in Stripe (not a fixed list).
- [ ] Occasion/product counts ("34 bouquets") → from catalog API.
