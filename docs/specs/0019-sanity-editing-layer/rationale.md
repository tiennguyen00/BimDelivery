# 0019. Rationale: the Sanity editing layer

The decision record behind [index.md](index.md). `/develop` does not need this file.

## Context

> ⚠️ Premise note: the request began as "upload many PNGs to the project page" and grew, through the engineer's answers, into "the client's team edits every page without a developer". That spans at least seven independently buildable moves (one per content collection) on top of one platform decision. This spec decides the platform and builds the most urgent move, projects. Each other collection gets its own child spec in this folder when its turn comes. Moving everything at once would be a big bang rewrite of a working site.

The site is a prerendered Astro site on Cloudflare Workers (spec 0001). Every word and photo lives as YAML or Markdown in `src/content/`, checked by Zod at build (spec 0002). Every photo is a Pexels link (spec 0006, recorded as an assumption, never deliberated). A project has rooms (1 to 6, each with 1 to 9 photos) and exactly one service (spec 0018), and the `/project` filter uses that service.

The real portfolio is arriving as PNG renders, typically 5 to 15 MB each. The image set is small at launch but may grow to several hundred images. The engineer's answers set the hard needs:
- **Editors**: one or two people on the client's team, editing without the developer, signing in with email or Google, never GitHub.
- **Reach**: every page, eventually.
- **Safety**: draft, then preview, then publish; a mistake must not reach bimdelivery.vn unseen.
- **Cost**: free, or a few dollars a month.
- **Model**: a subproject is a room; each room carries its own category (Architectural, Interior, or Landscape), so one project can span several; rooms rise to 1 to 10 and photos to 1 to 20 per room.

The constraints come from AGENTS.md and the stack: every page prerendered, with only `POST /api/contact` allowed on demand; page content from content collections; secrets through the typed env schema; code on `workerd`; a solo developer; and "new layers need a spec first". Workers Builds deploys on push today, and the check found no documented hook to start a build any other way.

Not deciding means either the developer stays the bottleneck for every portfolio change, or several gigabytes of PNG go into git by hand.

## Options considered

### Option 1: Sanity, read at build through content collections

A hosted content store with an editing app (Studio). Editors sign in with Google or email, work in drafts, and publish. The site fetches published documents at build, validates them with Zod, and serves photos from Sanity's image CDN.

**Pros**:
- Meets all four hard needs at $0: 20 seats free, drafts and preview built in, an image pipeline and CDN on every plan (basis: Sanity pricing page, checked 2026-10-25).
- Images never enter git; the CDN resizes and converts on request, so build time does not grow with photo count.
- The site's shape barely changes: content collections and Zod stay, and pages keep reading through `src/lib/content.ts` (basis: AGENTS.md, content from collections).

**Cons**:
- Content leaves git, which partly replaces spec 0002. History and backup become Sanity's job and ours.
- On the free plan the only editing role is Administrator.
- Publishing needs a build trigger the platform does not provide, so deploys move to GitHub Actions.
- Photos come from a third party origin.

### Option 2: Pages CMS (git based)

A free, open source editor that commits YAML and media to the GitHub repo. Collaborators are invited by email and need no GitHub account.

**Pros**:
- The smallest change: content stays as files, Zod and git history are untouched, cost is $0 (basis: pagescms.org).
- Email invites meet the sign in need.

**Cons**:
- No draft or review workflow is offered, so each save commits straight to the branch. That fails a stated need.
- Raw PNGs go into git with no resizing; at several hundred 10 MB files the repo grows by gigabytes, and every clone and build carries them. External media storage is marked "Soon".

### Option 3: TinaCMS with TinaCloud (git based)

A hosted, git backed editor with a polished form UI; content stays as files in the repo.

**Pros**:
- Content and its history stay in git, and YAML stays the format.

**Cons**:
- The editorial workflow (drafts and review) is only on Team Plus, about $41 a month per project, over the budget; the free tier has 2 users and no editorial workflow (basis: Tina pricing page; a 2024 Tina post quotes $49).
- Email sign in for editors could not be confirmed; there is a 100 MB asset cap.

### Option 4: A custom editor on Cloudflare (Access, R2, an admin route)

An `/admin` page behind Cloudflare Access, photos uploaded to R2, and a bot that commits content changes.

**Pros**:
- Everything stays on Cloudflare; R2 has no egress fee; full control of the shape.

**Cons**:
- Breaks the prerender rule (an admin and upload route run on demand).
- One developer would build sign in, uploads, validation, drafts, previews, and publishing by hand: a CMS reinvented, with every failure mode owned in house (basis: reinventing auth is a known failure pattern).

Keystatic was also considered, but its pricing and cloud pages returned 404 during the check, so its current terms could not be confirmed.

## Rationale

The four hard needs decide it. GitHub free sign in rules out the free git editors except Pages CMS. Draft then publish rules out Pages CMS, and puts TinaCMS above budget. Option 4 breaks the prerender rule and asks one developer to build a CMS. Sanity is the only option that meets all four at no cost.

Its two real costs are accepted with mitigations. Content leaving git is offset by the build still checking every entry with the same Zod schemas, and by a scheduled dataset export (Follow-up). The third party image origin is the engineer's choice over the alternative: Astro downloading and resizing every photo on every build, which scales build time with the portfolio, the one thing expected to grow.

The pieces of the design follow from the constraints:
- **Content collections**: reading through a collection loader, rather than the `@sanity/astro` default of fetching in pages, keeps the AGENTS.md rule and every existing guard (basis: AGENTS.md; `sanity-best-practices`, Astro reference).
- **GitHub Actions**: Workers Builds documents no way to start a build except a push, and Publish must start one. One workflow for every deploy beats two paths drifting apart (basis: Cloudflare Workers Builds docs).
- **Preview on the dev link**: Sanity's live visual editing needs server rendering, which the prerender rule forbids. A drafts build of the dev link is the static equivalent, and a button (not autosave) starts it, so typing never floods the pipeline.
- **Strangler migration**: projects first, one collection at a time, so a working site is never rewritten at once (basis: strangler pattern).
- **A relay Worker for the build token**: on the free plan every editor is an Administrator and can read webhook headers. A GitHub token able to start a build can also push a branch whose workflow reads every secret, and a branch rule would not stop it, because the token acts as the developer. The relay keeps that token where no editor can see it; Sanity holds only a signing secret, which can start a build and nothing else (basis: least privilege tokens).
- **Access on the dev link**: previews put unpublished work on a public `workers.dev` address, so it gets an email code gate and `noindex`.
- **URLs from stored data**: pages prerender inside workerd, where build time env is not available, so image URLs are built from each photo's stored CDN address, and `@sanity/image-url` is not needed.

These last three, and the loader contract, the drafts fallback, the lenient run, the `|` filter separator, the dot free document ids, and the crop handling, came from an independent cross check of the first draft (2026-10-25), each verified against the code before it was applied.

**Spec 0006, ratified by replacement.** Its assumption (every photo a Pexels link, downloaded at build) is wrong for real work: it depends on a stock host, and it cannot hold the client's own photos. Project photos now come from Sanity. Other photos stay Pexels links only as a deliberate interim, until their page moves.

## References

**Project sources**:
- `AGENTS.md`: the prerender rule, content from collections, secrets through the env schema, new layers need a spec
- Spec 0001 (images in the repo, optimised at build; Workers Builds), spec 0002 (the content model), spec 0006 (the assumed Pexels links), spec 0018 (rooms and their caps)
- The installed `sanity-best-practices` skill (`sanity-io/agent-toolkit`): `useCdn: false` for static builds, `hotspot: true` on every image, a webhook for a simple POST on publish
- Research caches: `docs/.agent-cache/research/cms-editing-layer.md`, `docs/.agent-cache/tool-discovery/sanity.md`

**Practices & standards**:
- Strangler pattern for migrating a live system
- Least privilege tokens, one per job
- Pinning third party CI actions to a commit SHA in a public repository
- Validating untrusted input at the boundary (Zod at build, mirrored in the Studio)
- Not reinventing authentication

**Links** (checked 2026-10-25):
- Sanity pricing: https://www.sanity.io/pricing
- TinaCMS pricing: https://tina.io/pricing
- Tina pricing update post (older price): https://tina.io/blog/Pricing-Updates-its-now-cheaper-to-use-Tinas-best-feature-
- Pages CMS: https://pagescms.org/
- Pages CMS collaborators (seen in search results): https://pagescms.org/docs/configuration/collaborators/
- Cloudflare Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- Workers Builds branch control and previews: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Sanity agent toolkit skills: https://skills.sh/sanity-io/agent-toolkit
- Sanity MCP server: https://mcp.sanity.io

## Evidence: the editing layer landscape, 2026-10-25

| Candidate | Sign in without GitHub | Drafts and review | Free for 1 or 2 | Media |
|---|---|---|---|---|
| Sanity | yes | built in; scheduled drafts on Growth | 20 seats, 2 roles | image CDN, 100 GB assets, 100 GB bandwidth |
| Pages CMS | yes, email invites | not stated | yes, open source | in the repo; S3 or R2 "Soon" |
| TinaCMS | unconfirmed | Team Plus and up (about $41 a month) | 2 users, no drafts | 100 MB asset cap |
| Keystatic | unconfirmed | unconfirmed | unconfirmed | unconfirmed (pages 404) |
| Workers Builds | n/a | preview builds per branch | yes | n/a; no documented build hook |

Prices change; check them again before any upgrade.
