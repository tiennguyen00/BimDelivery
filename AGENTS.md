# BIM Delivery site

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Stack

- **Language / Runtime**: TypeScript (strict). Node 24.21.0 for build and dev, pinned in `.nvmrc` and `engines`. The deployed runtime is `workerd` with `nodejs_compat`, not Node.
- **Framework**: Astro 7, every page prerendered (`output: 'static'`). Only the future `POST /api/contact` may set `export const prerender = false`.
- **Key dependencies**: `@astrojs/cloudflare` (images optimised at build, `imageService: 'compile'`), Tailwind CSS v4 (feature 4), content collections validated by Zod (feature 3), a React 19 island for the contact form only.
- **Hosting**: Cloudflare Workers serving static assets, deployed with `wrangler`.
- **Package manager**: pnpm 12. Install scripts run only for packages listed under `allowBuilds` in `pnpm-workspace.yaml`.

## Build approach

Skateboard: ship the smallest genuinely usable whole site, then grow it release by release.

## Commands

```bash
pnpm install
pnpm dev                              # localhost:4321 (agents: astro dev --background)
pnpm check                            # astro check, the type gate
pnpm build                            # pages land in dist/client/
pnpm exec wrangler deploy --dry-run   # confirm the deploy config
```

Tests: none by default (Alpha workflow). `/check verify` on the real site is the gate.

## Specs

Stored in `docs/specs/`, one folder per decision: `docs/specs/NNNN-title/index.md`. The scope lives in `docs/scope/scope.md`.

## Rules

- Functional style: pure functions by default, data in and markup out. Side effects (the contact endpoint, email) stay at the edges and are explicit.
- Immutable data: `const` and `readonly`; never mutate props or content entries in place. Module level variables are constants only.
- Plain functions and composition over classes.
- Expected failures return an explicit result (a union or `Result` type) instead of throwing; throw only for real bugs.
- Every page route produces an HTML file at build. Never switch `output` to `'server'`; after touching the adapter or `output`, confirm `dist/client/` has one HTML file per route.
- Zero JavaScript by default: nav, dropdown, mobile menu, and counters are plain scripts. React only for the contact form island in `src/components/react/`.
- Page content comes from content collections, never hardcoded in layouts. Every entry carries a required language field.
- Code must run on `workerd`: use only Node APIs that `nodejs_compat` provides.
- Secrets never go in the repo: Cloudflare secrets in production, `.dev.vars` locally, read through Astro's typed env schema.
- New layers (auth, database, cache, search, background jobs) need a spec first.

## Tooling

Chosen by `/audit`, installed by `/develop tooling`:

- Lint: ESLint with `eslint-plugin-astro` and `typescript-eslint`
- Format: Prettier with `prettier-plugin-astro`
- Pre-commit: lint and format staged files, then `astro check`
- CI: not yet (Cloudflare builds on push to `main`)

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Agent skills

- [astro](.agents/skills/astro/): `astrolicious/agent-skills`, Astro components, routing, config, and content collections
- [tailwind-4-docs](.agents/skills/tailwind-4-docs/): `lombiq/tailwind-agent-skills`, Tailwind CSS v4 utilities and config
- [zod](.agents/skills/zod/): `pproenca/dot-skills`, Zod schemas for content collections and form validation
- [pnpm](.agents/skills/pnpm/): `antfu/skills`, pnpm commands, `allowBuilds`, and workspace config
- [cloudflare](.agents/skills/cloudflare/): `cloudflare/skills`, choosing Cloudflare products
- [wrangler](.agents/skills/wrangler/): `cloudflare/skills`, Wrangler CLI, `wrangler.jsonc`, secrets, and deploys
- [workers-best-practices](.agents/skills/workers-best-practices/): `cloudflare/skills`, code that runs on `workerd`
- [resend](.agents/skills/resend/): `resend/resend-skills`, the contact form's email delivery
- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, the React contact form island

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
