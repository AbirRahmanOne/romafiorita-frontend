---
name: deploy-cloudflare
description: >-
  Use for build/deploy config and hosting. Storefront ships to Cloudflare Workers via
  the OpenNext Cloudflare adapter; admin is a static build on Cloudflare. Read before
  touching wrangler, build output, env, or CI deploy steps.
---

# Deploy — Cloudflare

## Storefront (Next.js → Cloudflare Workers)

- OpenNext Cloudflare adapter (`@opennextjs/cloudflare`) + `wrangler`. Commit
  `wrangler.toml` and the OpenNext config.
- Keep SSR/SSG + revalidation working on Workers. `next/image` loader compatible with
  the adapter. No Node-only APIs in edge paths.

## Admin (Vite SPA → Cloudflare static)

- Static build (`dist/`) on Cloudflare Pages/Workers static assets. SPA fallback to
  `index.html`. No SSR.

## Env

- `.env.example` in both apps; real values in Cloudflare, never committed.
  Storefront: `NEXT_PUBLIC_*` (API base, Stripe `pk_`, `USE_MOCKS`). Admin: `VITE_*`.
- Only publishable keys in the frontend. Secrets stay in the backend / CF secrets.

## Rules

- Mocks **off** in production builds (`USE_MOCKS=false`).
- Build artifacts are reproducible from `pnpm build`; CI runs lint/typecheck/test
  before deploy. Separate deploys per app.
