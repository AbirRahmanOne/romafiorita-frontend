# Roma Fiorita — Frontend

**Frontend only. The backend (FastAPI + PostgreSQL) is a separate repo** and is
consumed only over HTTP. Never add server/DB code here.

Online flower & gift shop in Rome. Buyers abroad send flowers to loved ones in
Italy. Trust is the product: a photo of the real bouquet before delivery, all-in
prices, on-time delivery. Same-day in Rome (own riders, exact 15-min slots
07:00–23:45), next-day across Italy by courier. Languages: IT + EN. Prices: EUR.

Domains: `romafiorita.com` (storefront), `admin.romafiorita.com` (admin),
`api.romafiorita.com` (backend — not here).

## Repo map

```
apps/
  storefront/   Next.js App Router — SSR/SSG, next-intl /it + /en, pink theme
  admin/        Vite + React SPA — behind login, blue/white theme
packages/
  ui-tokens/    both themes as Tailwind presets + CSS variables
  ui/           shared React primitives (Button, Input, Dialog, Pill, Skeleton…)
  api-client/   typed client GENERATED from backend OpenAPI (never hand-written)
  mocks/        MSW handlers + seed data (run both apps before the backend exists)
  config/       shared ESLint, Prettier, tsconfig
docs/           content-todo.md, api-gaps.md
.claude/skills/ the 10 skills below — read the relevant one before working
```

## Commands

```
pnpm install              # install workspace
pnpm dev                  # run both apps (turbo)
pnpm --filter storefront dev
pnpm --filter admin dev
pnpm build                # build all
pnpm lint                 # eslint all
pnpm typecheck            # tsc --noEmit all
pnpm test                 # vitest
pnpm gen:api              # regenerate api-client from OPENAPI_URL / openapi.json
```

## Conventions

- **TypeScript strict everywhere.** No `any` without a `// ponytail:` reason.
- **Money is integer cents from the API.** Format with `Intl.NumberFormat`
  per locale. The frontend NEVER computes a charged amount — it asks the backend
  (`/cart/quote`, `/checkout`, `/pay/{token}/intent`) and confirms.
- **Times:** `Europe/Rome` is the source of truth; also show the visitor's local
  time. Use `Intl.DateTimeFormat` with explicit `timeZone`.
- **No hard-coded user text.** Everything lives in `messages/{it,en}.json`.
  Italian runs ~25% longer — layouts must flex.
- **No placeholder content as real** (reviews, counts, "since 1987", staff,
  business identity). See `docs/content-todo.md` and the `content-rules` skill.
- **Secrets:** only publishable keys in the frontend (Stripe `pk_`). Never commit
  secret keys.
- Variants: the frontend sends `variant_id` only; the backend recalculates price.
- Small Conventional Commits. Every feature ships with tests, lint and typecheck green.
- When the backend contract is unclear, log it in `docs/api-gaps.md` — don't guess.

## Definition of done

- Lint + typecheck + unit tests pass.
- IT and EN both render; no hard-coded strings; layout holds at +25% text.
- Loading skeleton, empty state, error state (with retry) for every data view.
- WCAG AA: contrast, 44px tap targets, visible focus, never colour-only status,
  `prefers-reduced-motion` respected.
- No placeholder content shipped as real; new gaps logged in docs/.
