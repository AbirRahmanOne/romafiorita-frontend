# Roma Fiorita — Frontend

Frontend monorepo for Roma Fiorita (Rome flower delivery). **Frontend only** — the
backend (FastAPI + PostgreSQL) is a separate repo, consumed over HTTP.

- `apps/storefront` — Next.js (App Router), `/it` + `/en`, pink editorial theme.
- `apps/admin` — Vite + React SPA, blue/white dashboard.
- `packages/ui-tokens`, `packages/ui`, `packages/api-client`, `packages/mocks`, `packages/config`.

See `CLAUDE.md` for conventions and `.claude/skills/` for area-specific rules.

## Quick start

```bash
corepack enable pnpm        # pnpm 9.12 (see packageManager)
pnpm install
pnpm gen:api                # generate the typed client from packages/api-client/openapi.json
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/admin/.env.example apps/admin/.env.local
pnpm dev                    # storefront :3000, admin :3001 (mocks on)
```

Mocks (MSW) are on by default (`*_USE_MOCKS=true`), so both apps run before the
backend exists. The admin worker needs `pnpm --filter admin exec msw init public`
once to drop `mockServiceWorker.js`.

## Scripts

`pnpm dev · build · lint · typecheck · test · gen:api · format` — all run through Turborepo.

## Status

Phase 0 (guidance + skills) and Phase 1 (scaffold) complete. Phases 2–6 build the
storefront pages, checkout, admin screens, payment requests and SEO per `prompt.txt`.
