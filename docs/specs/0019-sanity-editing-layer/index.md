# 0019. Let the client's team edit the site in Sanity, starting with projects

**Date**: 2026-10-25
**Status**: In Progress
**Scope feature**: 18, Client editing in Sanity (`docs/scope/scope.md`)
**Supersedes**: [0006](../0006-remote-photos.md) (photos as Pexels links, assumed). Project photos now come from Sanity; every other photo stays a Pexels link only until its page moves (below).
**Amends**: [0001](../0001-stack-and-architecture/index.md) (images row, deploys), [0002](../0002-content-model/index.md) (the `projects` collection is loaded from Sanity), [0014](../0014-project-page/index.md), [0015](../0015-project-detail-pages/index.md), and [0018](../0018-project-detail-rooms.md) (a project's one `service` becomes the categories of its rooms).

## Summary

The client's team (one or two people, no developer, no GitHub account) will edit the site themselves and upload many large PNG renders. They do it in Sanity Studio, a hosted editing app with Google or email sign in, drafts, and a Publish button. The site still prerenders every page: at build it reads published content from Sanity through a content collection, checks it with the same Zod schemas, and serves project photos from Sanity's image CDN (resized WebP or AVIF, never the original PNG). Projects move first, with each room (your subproject) carrying its own category (Architectural, Interior, or Landscape); every other page moves later, one at a time.

## Requirements

**User stories**:
- As a client editor, I want to add a project with its rooms, categories, and photos myself, so the portfolio grows without waiting for a developer.
- As a client editor, I want to see my draft on a real page before it goes live, so a mistake never reaches bimdelivery.vn unseen.
- As a visitor, I want project photos to load fast and sharp on any screen, so large renders do not slow the site.
- As the developer, I want a bad entry to fail the build by name and leave the live site as it was, so editors can never break production.

**Acceptance criteria**:
- **AC-1**: An editor signs in to the Studio at its `*.sanity.studio` address with Google or with email and password. No GitHub account is involved.
- **AC-2**: In the Studio an editor can create, edit, unpublish, and delete a project, and reorder projects by drag and drop. Every field of the data model below is editable: 1 to 10 rooms, each with a name, a category, a work list of 1 to 8 items, and 1 to 20 photos. Photo uploads accept PNG, JPEG, and WebP of any size Sanity accepts.
- **AC-3**: The Studio refuses to publish a project that breaks any rule the site's build checks: a required field empty, a title over 60 characters, a count outside its range, a photo with no alt text, a slug not in lowercase kebab case or already used in the same language, a year outside 1900 to 2100, an unknown LOD, a category outside the list, a span marked both Bold and Accent, or a literal `**` or `==` typed in text.
- **AC-4**: Publish, unpublish, delete, and a drag and drop reorder (which publishes at once) each rebuild and deploy bimdelivery.vn with no developer action. The time from Publish to live is measured and recorded at verify.
- **AC-5**: Pressing "Preview on site" on a project rebuilds the dev link (`bim-delivery-site-dev`) with every current draft. A draft that breaks the site's rules shows its published version instead, or is left out when it has none, with a named warning in the build log, so one unfinished draft never fails a preview. The Studio then tells the editor the page's preview address and the rough wait. Production is untouched. A newer preview request cancels a running preview build.
- **AC-6**: Saving or autosaving a draft starts no build.
- **AC-7**: Every project photo on the site is an `<img>` on `cdn.sanity.io`, with a `srcset` of sized widths and `auto=format` (WebP or AVIF where the browser takes it), and `width` and `height` set, so nothing jumps while it loads. Each photo is requested with the editor's crop and drawn with `object-cover`, positioned by the editor's focal point, in every frame (the tile, the hero, the portrait, the carousel). No visitor ever receives the original upload.
- **AC-8**: A project's categories are derived from its rooms: each category once, in service `order`. The `/project` tile, the home showcase, and the detail hero's tagline show all of them, joined with ` · `. The overview's service row lists each one as a link to its service page.
- **AC-9**: The `/project` service filter shows a project when any of its rooms has the chosen category. The country and area filters behave exactly as before, including a country whose name has a space (New Zealand).
- **AC-10**: The rooms band shows each room's category as a small label over the room's name, in `ink`, in the list and in the no script fallback.
- **AC-11**: A published entry that fails the site's Zod schema, or a room category that names no service in the project's language, fails the build with a message naming the project (`<lang>/<slug>` and its Sanity `_id`) and the field. Nothing deploys, the live site keeps its previous version, and GitHub emails the developer. A manual lenient run (`workflow_dispatch` with `lenient`) deploys anyway, leaving out each invalid entry with a named warning.
- **AC-12**: The six placeholder projects are imported into Sanity with every field, their photos uploaded as Sanity assets, each room's category set to the project's current service, and their current order kept. The project YAML files are removed. `/project`, the home showcase, and every `/project/<slug>` page show the same words as before. Running the import a second time creates no duplicate document or asset.
- **AC-13**: Every page still prerenders: `dist/client/` holds one HTML file per route, no new on demand route exists, and no project page has an `astro-island`. `pnpm check`, `pnpm lint`, and `pnpm build` pass.
- **AC-14**: Every production deploy, from a push to `main` or from Publish, runs through one GitHub Actions workflow. Workers Builds no longer deploys. No secret is in the repo, deploy secrets sit in a GitHub Environment limited to `main`, and the GitHub token that starts builds is held only by the relay Worker, so no Sanity member can read it.
- **AC-15**: Every page outside projects is unchanged: its copy stays in `src/content/`, its photos stay Pexels links.
- **AC-16**: A change under `studio/` merged to `main` redeploys the Studio.
- **AC-17**: The rooms carousel stays usable at the raised caps: with up to 200 photos every photo loads lazily, as today, the arrows step and wrap, the words follow, and at 390px there is no sideways page scroll.
- **AC-18**: Every photo field in the Studio says, in its description, that an upload is reachable by its link at once, even as a draft, so only photos the client may show publicly (never an NDA project) are uploaded. The Studio's media browser lets an editor find and delete an uploaded file, which is the only way to retract it.
- **AC-19**: The dev link opens only through Cloudflare Access (a one time email code for the developer and the editors), and every build that is not production carries `noindex`.

## Decision

**Chosen option**: Option 1, Sanity as the editing layer, read at build through Astro content collections (see [rationale.md](rationale.md)).

Sanity Studio (hosted by Sanity, code in a `studio/` workspace in this repo) is where editors work. The site reads published Sanity documents at build through a content collection loader, validates them with the existing Zod schemas, serves project photos from Sanity's image CDN, and deploys through one GitHub Actions workflow that a Sanity webhook starts, by way of a small relay Worker. Projects move first; each other collection moves in a later slice.

**Implementation skills**: `sanity-best-practices` (`sanity-io/agent-toolkit`, `.claude/skills/sanity-best-practices/`) · `content-modeling-best-practices` (`sanity-io/agent-toolkit`, `.claude/skills/content-modeling-best-practices/`) · `portable-text-serialization` (`sanity-io/agent-toolkit`, `.claude/skills/portable-text-serialization/`) · `sanity-migration` (`sanity-io/agent-toolkit`, `.claude/skills/sanity-migration/`) · `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `wrangler` (`cloudflare/skills`, `.agents/skills/wrangler/`) · `workers-best-practices` (`cloudflare/skills`, `.agents/skills/workers-best-practices/`, for the relay Worker) · `pnpm` (`antfu/skills`, `.agents/skills/pnpm/`)

**Calls made in the design (each with its runner up):**
- **Read path**: an inline content collection loader in `src/content.config.ts` using `@sanity/client`, so pages keep reading through `src/lib/content.ts` and Zod still checks every entry. Runner up: the `@sanity/astro` integration's `sanity:client` called from pages, the skill's default, which would bypass content collections (an AGENTS.md rule).
- **Freshness**: `useCdn: false` on every build read, so a build started by a webhook never reads a stale cached answer. The API version is one pinned date constant in `src/lib/sanity.ts`.
- **Photos**: a pure helper, `src/lib/sanity-image.ts`, builds every URL from the photo's stored CDN `url`: the editor's crop as `rect`, a width, and `auto=format`. It needs no env and no dependency, which matters because pages prerender inside workerd. Frames keep `object-cover`, and `object-position` comes from the focal point, because only the portrait has one fixed ratio (the tile, the hero, and the carousel change ratio or fill a grid cell). One `Photo.astro` in `src/components/ui/` draws both kinds of photo, told apart by the Sanity shape's `source: 'sanity'` literal: a Sanity photo as a plain `<img srcset>`, a Pexels link through Astro's `<Image>` as today. Runner up: `@sanity/image-url` (the skill's default), which needs the project id at render time, and a separate image component per caller, which would split `SplitBand` (shared with About).
- **Rich text**: the `intro` field is Portable Text (Sanity's rich text format) with only the Bold and Accent buttons. The loader converts it to today's `**bold**` and `==accent==` strings, so `emphasisText`, the renderers, and every component stay as they are. Runner up: `astro-portabletext` rendering in components, which changes every component that shows marks.
- **Preview trigger**: the "Preview on site" document action writes a hidden, published `previewRequest` document, then shows the page's dev link address and "ready in about 3 minutes". One webhook covers both kinds of build and picks the event in its projection. Runner up: two webhooks, which may not fit the free plan's webhook count (unconfirmed).
- **Build relay**: the webhook calls a tiny separate Worker, `bim-delivery-build-relay`, not GitHub. It checks Sanity's signature with a shared secret, allows only the two event names, and forwards them to GitHub with a token only it holds. Free plan editors are Administrators and can read webhook headers, and a GitHub token able to dispatch can also push a branch whose workflow reads every secret; a branch rule would not stop it, since the token acts as the developer. Runner up: the token in the webhook header, plus a GitHub Environment; that leaves the push path open.
- **Drafts in a preview**: in the `drafts` perspective, a draft that fails Zod falls back to its published version, or is left out, with a named warning; content never fails a preview build.
- **Lenient run**: a `workflow_dispatch` input, `lenient`, sets `SANITY_LENIENT=true`, so the developer can ship a code fix while a bad published entry is being corrected. It is off for every automatic run.
- **The dev link**: Cloudflare Access on its `workers.dev` address (a one time email code, free up to 50 people), and `noindex` on every build that is not production, because previews now carry unpublished work.
- **Dataset**: one dataset, `production`, public read. Everything published there is public site content anyway, and production builds need no token. Drafts are never public. Runner up: a private dataset, which puts a token in every build for no real gain.
- **Order**: Sanity's official orderable list plugin keeps an `orderRank` string (a LexoRank key); new projects go last. The site sorts once, in `getProjects`, by `orderRank` then `sanityId`. A reorder writes published documents directly, so it deploys at once without a draft step; accepted, since it changes no words or photos.
- **Category labels in the UI**: one `categoryLine()` helper joins the titles with ` · ` for the tile, the showcase, and the tagline. The overview's row joins its links with `Intl.ListFormat`, as `software` does, under `factLabels.service` for one category and a new `factLabels.services` for several. Showcase titles may wrap.
- **Filter match**: a tile's `data-` key may hold several values separated by `|`, a character no country, slug, or area key contains; the filter shows a tile when the chosen value is one of them. Single value keys (country, area) behave as before.
- **Studio deploy**: a second workflow, `studio.yml`, runs `sanity deploy` when `studio/**` changes on `main`, with a Deploy Studio robot token. If the free plan offers no such token, the developer deploys the Studio by hand and `studio.yml` is dropped; an Administrator token never goes into GitHub. Runner up: always by hand, which lets the Studio and the site's schema drift.
- **Retracting a photo**: `sanity-plugin-media` (a media browser) in the Studio, because unpublishing or deleting a document leaves its uploaded files public.
- **Actions pinning**: the public repo's workflows pin each third party action to a full commit SHA with its version in a comment, and run with `permissions: contents: read`.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model** (confirmed 2026-10-25):

`project` (one Sanity document per project)

| Field | Type | Rule |
|---|---|---|
| `_id` | Sanity id | primary key. Imported projects use `project-<lang>-<slug>` (never a dot: Sanity hides ids with a dot from requests without a token); new ones get Sanity's id |
| `lang` | string | required, one of `LOCALES`; starts as `en`, read only while there is one locale |
| `slug` | slug | from the title, lowercase kebab case, unique per `lang` (a custom `isUnique`) |
| `title` | string | required, at most 60 characters |
| `summary` | string | required |
| `image` | photo | required; the tile and the detail hero |
| `orderRank` | string | kept by the orderable list plugin; tile order, showcase order, next project link |
| `seo` | object `{ title, description }` | optional; same rules as today |
| `location` | string | required |
| `year` | number | required, whole, 1900 to 2100 |
| `client` | string | optional |
| `floorArea` | number | optional, whole, positive, square metres |
| `storeys` | number | optional, whole, positive |
| `lod` | number | optional, one of `LOD_LEVELS` (100, 200, 300, 350, 400, 500), offered as a fixed list |
| `software` | array of string | optional, at least 1 when present |
| `duration` | string | optional |
| `tagline` | string | required |
| `intro` | Portable Text | 1 to 4 blocks, style `normal` only, decorators `strong` and `accent` only, no lists, no links, no two decorators on one span |
| `portrait` | photo | required |
| `rooms` | array of `room` | 1 to 10, ordered |

`room` (an object inside `project.rooms`; 1 project to N rooms)

| Field | Type | Rule |
|---|---|---|
| `_key` | Sanity key | primary key inside the list |
| `name` | string | required |
| `category` | string | required, one of `architectural-bim`, `interior-bim`, `landscape-bim` (a service slug), shown in the Studio as the service titles (Architectural BIM, Interior BIM, Landscape BIM) |
| `workload` | array of string | 1 to 8 |
| `photos` | array of photo | 1 to 20 |

`photo` (an object type used by `image`, `portrait`, and room `photos`): a Sanity `image` with `hotspot: true` (focal point and crop) and `alt` (string, required, never empty).

`previewRequest` (hidden from editors and from "new document"; one published document, `_id: "previewRequest"`): `requestedAt` (datetime). It exists only to start a preview build.

The site's Zod shape for a project drops `service` and `order` (categories are derived; order is `orderRank`), and gains `sanityId` (the document `_id`, for error messages) and `orderRank`. Each photo becomes a strict `sanityPhoto`: `{ source: 'sanity', url, width, height, alt, crop?, hotspot? }`, where `url` must be `https` on `cdn.sanity.io`, `width` and `height` are the original asset's pixel size, `crop` is `{ top, bottom, left, right }` (fractions) and `hotspot` is `{ x, y }` (fractions). `intro` stays an array of `emphasisText` (the loader produces it). Each room gains `category`. The collection entry id is `<lang>/<slug>`.

**Loader contract** (`projects`, in `src/content.config.ts`):
- One GROQ query per build fetches every `project` in the chosen perspective, dereferencing each image's asset to its `url` and `metadata.dimensions`, and returning only the fields above (no `_type`, no `_key`), because every Zod shape is strict.
- The loader clears its store on every run, so an unpublished or deleted project never lingers.
- It maps each document to a new object, never throwing on a missing field, then validates each one with `parseData`. Every error names `<lang>/<slug>`, or the `_id` when either is missing, plus Zod's field path.
- It catches two documents with the same `<lang>/<slug>` before storing either, and fails naming both `_id`s.
- On a Zod failure: `published` and strict, the build fails (AC-11). `published` and lenient, the entry is left out with a warning. `drafts`, the draft is replaced by its published version when that passes, else left out, with a warning (AC-5).

**Rich text conversion** (`src/lib/portable-text-marks.ts`, pure, plus its reverse in the import script): one block is one paragraph. Neighbouring spans with the same mark merge into one. Spaces at the edge of a marked span move outside the marks. The Studio rejects, on the `intro` field: a span with two marks, `**` or `==` typed in text, and a line break inside a paragraph.

**State transitions** (Sanity's own, per document): no document → draft (first edit) → published (Publish). Published → draft plus published (edits pending) → published (Publish again). Published → draft only (Unpublish). Any → gone (Delete). Only the change to or from "published" starts a production build.

**Interface surface**:

| Surface | Kind | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `projects` loader (`src/content.config.ts`) | build time GROQ read | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_PERSPECTIVE`, `SANITY_READ_TOKEN` (drafts only) | project entries in the Zod shape | none for `published`; Viewer token for `drafts` | Sanity unreachable, or `drafts` with no token: the build fails with a named message |
| Sanity webhook `site-build` | HTTP POST to the relay Worker's `workers.dev` address | filter `_type in ["project", "previewRequest"]`; on create, update, delete; drafts off; projection `{"event_type": select(_type == "previewRequest" => "sanity-preview", "sanity-publish")}` | the relay's 204 | signed with the webhook's secret (Sanity's signature header) | failures show in Sanity's webhook attempt log; Sanity retries |
| Relay Worker `bim-delivery-build-relay` (`workers/build-relay/`) | `POST /` on workerd | Sanity's signature header, body `{ event_type }` | calls `https://api.github.com/repos/tiennguyen00/BimDelivery/dispatches` with `{ event_type }`, `Authorization: Bearer <GITHUB_DISPATCH_TOKEN>`, `Accept: application/vnd.github+json`, then answers 204 | the signature, checked with `SANITY_WEBHOOK_SECRET` (Web Crypto HMAC) | 401 bad or missing signature; 400 an event name other than the two; 502 GitHub refused; any other method or path 404 |
| `repository_dispatch` `sanity-publish` | GitHub event | none | runs the `production` job | the relay's token | none |
| `repository_dispatch` `sanity-preview` | GitHub event | none | runs the `preview` job | the relay's token | none |
| `.github/workflows/deploy.yml`, job `production` | on push to `main`, `sanity-publish`, `workflow_dispatch` (input `lenient`, default false) | the `production` Environment's variables and secrets | `HUSKY=0`; `pnpm install --frozen-lockfile` without the Studio's packages; `pnpm check` (push and manual runs only); `pnpm build` with `SANITY_PERSPECTIVE=published`; `pnpm exec wrangler deploy` | Cloudflare API token | any step failing stops the deploy; GitHub emails the developer |
| `.github/workflows/deploy.yml`, job `preview` | on `sanity-preview` | as above plus `SANITY_READ_TOKEN` | `CLOUDFLARE_ENV=dev`, `SANITY_PERSPECTIVE=drafts`, `SITE_NOINDEX=true`, the Turnstile test key; build; a step that fails unless `dist/client/wrangler.json` has `"name": "bim-delivery-site-dev"` and `"routes": []`; then `wrangler deploy` | as above | as above; the name check stops a preview from ever reaching production |
| `.github/workflows/studio.yml` | on push to `main` touching `studio/**` | `SANITY_AUTH_TOKEN` | `sanity deploy` | a Deploy Studio robot token | fails visibly in Actions |
| Studio action "Preview on site" | on `project` documents | the open document's `slug` | `createOrReplace` of `previewRequest` with `requestedAt: now`, published; then a toast: `https://bim-delivery-site-dev.bimdelivery.workers.dev/project/<slug>`, ready in about 3 minutes | the editor's Studio session | a write failure shows an error toast; a project with no slug yet links to `/project` |
| `studio/scripts/import-projects.ts` | one time script, `sanity exec --with-user-token` | `src/content/projects/en/*.yaml` | published `project` documents at `project-en-<slug>`, uploaded assets | the developer's Sanity login | a failed download or upload stops the run; rerunning is safe (below) |

Import idempotency: each asset is uploaded with `source: { name: 'pexels', url }` and looked up by that URL first, so a second run reuses it even if Pexels returns different bytes. Room keys are `room-<i>` and photo keys `photo-<i>-<j>`. `orderRank` comes from the `lexorank` package, in `order` sequence. The run ends with a GROQ count of projects made with no token, which must be 6.

Concurrency: the `production` and `preview` jobs each have their own group with `cancel-in-progress: true`. The newest run always includes everything published or drafted before it.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Tile, showcase, detail tagline | the project's categories, in order | each room's `category` (Sanity) → the service entry `<lang>/<category>` in `src/content/services/` → its `title` and `slug`, sorted by the service's `order`, each once |
| Overview service row | one link per category, and its label | the same derived list: `title`, href `/<slug>`, joined by `Intl.ListFormat` in the page's `lang`; label `factLabels.service` for one, `factLabels.services` for several (`projectPage` copy) |
| Rooms band label | a room's category title | that room's `category` → the service entry's `title` |
| Filter tabs | the service choices | every category used by any room, via `filterChoices` |
| Tile `data-service` | the keys the filter matches | the project's category slugs, separated by `\|` |
| Tile order, showcase picks, next project link | order | `orderRank` (Sanity), ascending string sort, ties broken by `sanityId`, sorted once in `getProjects`; the showcase takes the first three |
| Every project photo `src` and `srcset` | sized CDN URLs | the photo's stored `url` plus `rect=<left>,<top>,<width>,<height>` in pixels (from `crop` times the original size, only when cropped), `w=<step>`, and `auto=format`; the steps are each component's existing width steps |
| Photo `width` and `height` | intrinsic size | the original `width` and `height` scaled by `crop` (the cropped rectangle) |
| Photo `object-position` | the focal point in its frame | `hotspot.x` and `hotspot.y`, made relative to the cropped rectangle, as percentages; `50% 50%` with no hotspot |
| Preview toast address | where the editor looks | the dev link base (a constant in the Studio) plus `/project/<slug>` |
| Whether invalid entries are dropped | strict or lenient | `SANITY_LENIENT`, set only by the `lenient` input of a manual run |
| `noindex` on a page | robots meta | `SITE_NOINDEX`, true in the `preview` job and in the developer's manual dev deploys |
| Photo `alt` | alt text | the photo's `alt` (Sanity) |
| Intro paragraphs | strings with marks | `intro` Portable Text, converted by `portableTextToMarks` (pure) in the loader |
| Collection entry id | `<lang>/<slug>` | `lang` and `slug.current` (Sanity) |
| Build error message | the project's name and field | the entry id, the Sanity `_id`, and Zod's issue path |
| Which content a build reads | published or drafts | `SANITY_PERSPECTIVE`, set per job by the workflow |
| Which GitHub job runs | the event type | the webhook projection's `select()` on `_type` |
| Turnstile key in a build | public site key | the GitHub variable `PUBLIC_TURNSTILE_SITE_KEY` (production); Cloudflare's public test key, written in the `preview` job |
| Studio host name | the Studio URL | chosen at the first `sanity deploy` (suggested: `bimdelivery`) and written into `studio/sanity.cli.ts` |

**Key invariants**:
- Every page is prerendered. No route is added, and `output` stays `'static'` (spec 0001).
- The site's Zod schema is the source of truth. The Studio's validation must refuse everything Zod rejects (AC-3); a field change edits both in one commit.
- Categories are always derived from rooms and never stored on the project.
- Production builds read with `perspective: 'published'` and no token, and are strict unless a manual run sets `lenient`. Only the `preview` job holds `SANITY_READ_TOKEN`. Content never fails a preview build.
- Every Sanity image URL the site writes carries a width and `auto=format`; the original upload is never linked. Image URLs are built from stored data only, never from env at render.
- The GitHub token that starts builds lives only in the relay Worker. Sanity holds only the signing secret, which can do nothing but start the two builds.
- Every build that is not production is `noindex`, and the dev link sits behind Cloudflare Access.
- CI caches the pnpm store only, never `.astro` or `node_modules/.astro`.
- Drawn assets (logo, badges, illustrations, the local banners in `src/assets/images/`) stay local files. Photos outside projects stay Pexels links until their slice moves.
- The loader maps Sanity documents to new objects; nothing is mutated in place.
- Every Sanity document carries `lang`.

**Security model**:
- Sanity members: the developer (Administrator, project owner) and the one or two client editors (Administrator, the free plan's only editing role). An editor can therefore also invite members and change project settings; accepted at this team size.
- Sign in: Sanity's own Google and email and password providers.
- Read: published documents in `production` are public (they are the public site). Drafts need a token, and appear only on the dev link, behind Cloudflare Access (the developer's and the editors' email addresses) and `noindex`. Uploaded assets are public by URL as soon as they are uploaded, until deleted in the media browser (AC-18).
- Tokens and secrets, each with the least scope that works:
  - `SANITY_READ_TOKEN`: a Viewer robot token, `production` Environment secret, `preview` job only.
  - `SANITY_AUTH_TOKEN`: a Deploy Studio robot token, `production` Environment secret, `studio.yml` only.
  - `CLOUDFLARE_API_TOKEN`: from Cloudflare's "Edit Cloudflare Workers" template (it covers the custom domain routes and the `SESSION` KV binding), `production` Environment secret, proven by a dev deploy before cutover.
  - `GITHUB_DISPATCH_TOKEN`: fine grained, this repository only, Contents read and write (what `repository_dispatch` needs), expiry at most a year. A secret of the relay Worker only; it never enters Sanity or GitHub Actions.
  - `SANITY_WEBHOOK_SECRET`: shared by the Sanity webhook and the relay Worker. Anyone holding it can only start a build.
- The `production` GitHub Environment allows deployments from `main` only, so a workflow on any other branch gets none of its secrets.
- No new endpoint on bimdelivery.vn. The relay is a separate Worker with one route. The workflows trigger only on `main`, `repository_dispatch`, and `workflow_dispatch`, so a fork's pull request never sees a secret.
- No regulated data. Editors' accounts live in Sanity, not here.

**Configuration required**:
- Site env schema (`astro.config.mjs`, `env.schema`):
  - `SANITY_PROJECT_ID`: server, public, with the real project id as its default (a public value), so `pnpm dev`, `pnpm build`, and CI all work without an env file.
  - `SANITY_DATASET`: server, public, default `production`.
  - `SANITY_PERSPECTIVE`: server, public, `published` or `drafts`, default `published`.
  - `SANITY_READ_TOKEN`: server, secret, optional; the loader fails when the perspective is `drafts` and it is missing.
  - `SANITY_LENIENT`: server, public, boolean, default `false`.
  - `SITE_NOINDEX`: server, public, boolean, default `false`; when true, the base layout adds `<meta name="robots" content="noindex">`.
  - These are read by the loader at build (Node) and by the layout. If `astro:env/server` cannot be imported from `src/content.config.ts`, the loader reads them once in `src/lib/sanity.ts` from `process.env`, parsed by a Zod schema, and that file's header notes the exception. Nothing reads them at render inside workerd except `SITE_NOINDEX`, a public value fixed at build.
- GitHub `production` Environment (deployment branch: `main`): variables `CLOUDFLARE_ACCOUNT_ID`, `PUBLIC_TURNSTILE_SITE_KEY` (moved from Workers Builds); secrets `CLOUDFLARE_API_TOKEN`, `SANITY_READ_TOKEN`, `SANITY_AUTH_TOKEN`.
- Relay Worker secrets (`wrangler secret put`): `GITHUB_DISPATCH_TOKEN`, `SANITY_WEBHOOK_SECRET`.
- Studio: the project id and dataset as constants in `studio/sanity.config.ts` and `studio/sanity.cli.ts` (public values); the dev link base for the preview toast.
- Sanity: the `site-build` webhook pointing at the relay, with `SANITY_WEBHOOK_SECRET`; Google and email sign in on.
- Cloudflare: Access on the dev Worker's `workers.dev` address (one policy: the developer's and the editors' emails, one time code). Disconnect Workers Builds after the first green Actions deploy. The site Worker's runtime secrets are unchanged.
- pnpm: `pnpm-workspace.yaml` gains `packages: ['studio', 'workers/*']`; any install script the new packages need is approved under `allowBuilds` by name. Root and Studio React and `@types/react` versions stay in step. `astro check` and the root `tsconfig.json` exclude `studio/` and `workers/`; ESLint lints both with `typescript-eslint` and ignores their build output.
- Accepted: `astro check`, `pnpm dev`, and the commit hook (`.husky/pre-commit`) now need the network, because the loader calls Sanity.

**Critical test scenarios**:
- Happy path: an editor signs in with Google, adds a project with three rooms in two categories and twelve PNG photos, previews it on the dev link, publishes, and sees it live on `/project` under both category tabs. Verifies **AC-1**, **AC-2**, **AC-4**, **AC-5**, **AC-8**, **AC-9**.
- Validation: a photo with no alt, a 61 character title, and a span marked Bold and Accent are each refused at Publish. Verifies **AC-3**.
- Failure: a document written through the API that breaks the Zod schema makes the production run fail by name; the live site is unchanged; the developer gets the email. Verifies **AC-11**.
- No build on typing: ten minutes of editing a draft starts no workflow run. Verifies **AC-6**.
- Photos: the network panel shows `cdn.sanity.io` WebP or AVIF responses sized near the rendered width, never a PNG original, and no layout shift. Verifies **AC-7**.
- Import: a second run of the import script leaves the document and asset counts the same. Verifies **AC-12**.
- Large carousel: a project with 10 rooms of 20 photos at 390px and 1440px. Verifies **AC-17**.
- Unfinished draft: one project's draft has an empty required field; Preview on site still builds, that project shows its published version, and the log names it. Verifies **AC-5**.
- Lenient run: with one invalid published entry, a manual run with `lenient` deploys every other project. Verifies **AC-11**.
- Filter with spaces: choosing New Zealand shows College Hall and Corner Block. Verifies **AC-9**.
- Relay: a request with no signature or a wrong one gets 401 and starts no run; an unknown event name gets 400. Verifies **AC-14**.
- Dev link: opening it in a private window asks for the Access email code; its pages carry `noindex`. Verifies **AC-19**.

## Build plan

The project builds Skateboard: the first slice is the thinnest whole that is genuinely usable, an editor changing a project and seeing it live. Later slices grow it to every page.

**Slice 1: projects, end to end**

1. Create the Sanity project and the public `production` dataset; turn on Google and email sign in. Add `studio/` as a pnpm workspace (pinned Sanity versions) with the `project`, `room`, `photo`, `previewRequest`, and rich text types, every validation rule from the data model (the rich text rules included), field descriptions (the AC-18 sentence on every photo field), the orderable list plugin (new items last), `sanity-plugin-media`, and a structure with Projects as an orderable list and `previewRequest` hidden from lists and from "new document". `lang` and `lod` options import `LOCALES` and `LOD_LEVELS` from `src/` where the Studio's bundler allows, else copy them with a comment naming the source. Deploy the Studio by hand once. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-18**.
2. Write and run `studio/scripts/import-projects.ts` as the Import idempotency note says: assets by source URL, `intro` marks to Portable Text (the reverse converter), each room's `category` from the project's `service`, LexoRank `orderRank` in `order` sequence, stable keys, and `createOrReplace` at `project-en-<slug>`, published. Run it twice, compare counts, and finish with the tokenless count of 6. Satisfies **AC-12**.
3. Read projects from Sanity: the env schema entries; `src/lib/sanity.ts` (the client, `useCdn: false`, the pinned API version, the perspective and token rule); `src/lib/portable-text-marks.ts` (pure); the `projects` loader to its contract and the new Zod shape in `src/content.config.ts`; in `src/lib/content.ts`, replace `resolveProjectService` with a category resolver that checks each room's category against the services in the same language and derives `categories`, sort once by `orderRank` then `sanityId`, and drop the `order` uniqueness check; remove `nextProject`'s own sort in `src/lib/project-detail.ts`. Delete `src/content/projects/en/*.yaml` and update `src/content/README.md`. Satisfies **AC-5**, **AC-8**, **AC-11**, **AC-12**, **AC-15**.
4. Draw Sanity photos: `src/lib/sanity-image.ts` (pure: URL, `srcset`, `width`, `height`, `object-position`) and `src/components/ui/Photo.astro` (props: the photo, `widths`, `sizes`, `loading`, `fetchpriority`, `class`); move `ProjectGallery`, `SplitBand`, `ProjectOverview`, `ProjectRooms`, and the `/styleguide` project tiles onto it, keeping each one's widths, `sizes`, and loading (the carousel stays all lazy). Add a `preconnect` to `cdn.sanity.io` on project pages. Satisfies **AC-7**, **AC-17**.
5. Show categories: `categoryLine()` and the `|` keys in `src/lib/project-gallery.ts`; the "one of" match in `src/scripts/project-filter.ts`; `Fact` gaining `links`, rendered by `ProjectOverview`, with `factLabels.services` added to the `projectPage` schema and copy; the tagline in `src/pages/project/[slug].astro`; `ProjectShowcase` (titles may wrap); the room label in `ProjectRooms` (in `ink`, inside the list and the no script fallback); the `/styleguide` cases; the matching lines in `docs/design.md`. Satisfies **AC-8**, **AC-9**, **AC-10**.
6. Gate locally and on the dev link: `pnpm check`, `pnpm lint`, `pnpm build`, one HTML file per route, no island on project pages; add `SITE_NOINDEX` to the base layout; put Cloudflare Access on the dev link; deploy the dev link by hand (`SITE_NOINDEX=true`) and compare every project page with production. Satisfies **AC-13**, **AC-15**, **AC-19**.
7. Move deploys to GitHub Actions: create the `production` Environment (`main` only) with its variables and secrets; prove the Cloudflare token with a dev deploy; add `deploy.yml` (the `production` and `preview` jobs, their concurrency groups, the preview name check, the `lenient` input, `HUSKY=0`, pinned actions, `contents: read`, a pnpm store cache only) and `studio.yml`. After merging, start the first production run by hand (`workflow_dispatch`, since dispatch events only run workflows already on `main`), keep Workers Builds connected until it is green, then disconnect it. Satisfies **AC-11**, **AC-14**, **AC-16**.
8. Wire Sanity to the pipeline: the relay Worker in `workers/build-relay/` (its own `wrangler.jsonc`, signature check, the two allowed events, the forward to GitHub) and its two secrets; the `site-build` webhook pointing at it; the "Preview on site" document action and its toast. Satisfies **AC-4**, **AC-5**, **AC-6**, **AC-14**.
9. Drill it end to end: publish, unpublish, delete, a reorder, preview, a newer preview cancelling an older one, an unfinished draft in a preview, an API written bad entry (then a lenient run), an unsigned request to the relay, and an autosave session with no run. Check that the webhook fires on delete and unpublish, and which `_id` shape the `drafts` perspective returns (the error messages depend on it). Record the Publish to live time. Then invite the client editors as Administrators and add their emails to the Access policy. Satisfies **AC-4**, **AC-5**, **AC-6**, **AC-11**, **AC-14**, **AC-19**.

**Later slices** (each designed as a child spec in this folder when its turn comes; not built here): the Project page copy (`projectPage`), home, About, Contact, then `settings`, `navigation`, `stats`, and `notFound`, and services last (its block model, spec 0013, is the hardest to map to forms). Each slice moves one collection to a Sanity loader, adds its type to the webhook filter, moves its photos off Pexels, and deletes its files.

## Migration plan

**Strategy**: strangler, one collection at a time. Old and new never serve the same collection at once.

**Phases**:
1. Studio and import (tasks 1 and 2). The site still reads YAML; nothing visible changes.
2. The site reads projects from Sanity on a branch (tasks 3 to 6), checked page by page on the dev link against production.
3. Merge; the first GitHub Actions production run is started by hand; Workers Builds stays connected until that run is green, then is disconnected (task 7). Until then a Workers Builds run may fail for lack of the new variables; that is expected and harmless.
4. Webhook and preview on, then editors invited (tasks 8 and 9).

**Rollback**: revert the merge commit; the YAML files and the old code come back with it, and Workers Builds is connected again in the Cloudflare dashboard. If editors have published changes since, export the dataset first (`sanity dataset export`) and copy their edits back into YAML by hand.

**Risks**: the Studio's rules drifting from Zod (caught by the build, AC-11); the webhook token expiring (publish stops deploying until it is renewed); a GitHub Actions outage delaying deploys (rerun with `workflow_dispatch`); Sanity changing its free plan.

## Consequences

**Positive**:
- The client's team runs the portfolio without a developer, with drafts, previews, and a review step before anything goes live.
- Hundreds of large PNGs never touch git; visitors get resized WebP or AVIF.
- The build still guards every entry by name, and every page still prerenders.
- One deploy pipeline, written down in the repo, instead of a dashboard only setup.

**Negative / tradeoffs**:
- Project content leaves git: its history is Sanity's own document history, not commits, and a backup is now a separate job (Follow-up).
- Every build needs Sanity reachable, as well as Pexels (until the last slice) and the font host.
- Two schemas to keep in step, the Studio's and Zod's.
- Project photos load from `cdn.sanity.io`, a third party origin: one more connection per visit, and Sanity sees visitors' requests. Spec 0001's "served from our own origin" no longer holds for them.
- Editors are Administrators on the free plan; the Editor role needs the paid Growth plan.
- Publishing takes minutes, not seconds; a preview takes minutes too.
- Preview builds and the developer's own dev deploys share the dev link; the latest one wins.
- A changed slug breaks the old URL; there are no redirects yet.
- The repo becomes a pnpm workspace, and you now own a CI workflow, a second small Worker (the relay), an Access policy, their secrets, and a GitHub token that expires.
- A drag and drop reorder goes live without a draft step.
- `astro check`, `pnpm dev`, and the commit hook need the network.
- All project photo traffic counts against the free plan's 100 GB of CDN bandwidth a month, and each new photo size is made cold on its first view.
- The dev link now asks for an email code, for the developer too.

**Neutral**:
- AGENTS.md changes (owned by `/sync`): Stack (Sanity, the `studio/` workspace, GitHub Actions deploys, images), Rules (project photos from Sanity's CDN; the new layer), Tooling (CI), Agent skills, and an `MCP servers:` line for Sanity.
- Specs 0001, 0002, 0014, 0015, and 0018 are amended as listed at the top; spec 0006 is superseded.

## Follow-up

- [x] Enroll this as a scope feature: feature 18, Client editing in Sanity (2026-10-25).
- [ ] Back up the dataset on a schedule (a nightly `sanity dataset export` workflow kept as an artifact) before editors start; decide its retention.
- [ ] Write a one page guide for the client's team: signing in, adding a project and its rooms, alt text, the focal point, the public upload rule, deleting a mistaken upload in the media browser, Preview on site (and the Access email code), Publish, and that a reorder goes live at once.
- [ ] Confirm at build time: whether `astro:env/server` imports in `content.config.ts`; how many webhooks the free plan allows; whether the free plan offers a Deploy Studio robot token; how long the free plan keeps document history.
- [ ] Set a reminder for the relay's GitHub token expiry date.
- [ ] Watch Sanity's bandwidth and request usage for the first months; add a warm up or a cache only if a limit gets close.
- [ ] Update the dev link memory and notes: manual dev deploys now add `SITE_NOINDEX=true`, and the dev link sits behind Access.
- [ ] Redirects for renamed slugs, when the first rename happens.
- [ ] Design each later slice as a child spec in this folder, in the order under Build plan.
- [ ] `/sync`: the four Sanity skills were installed into `.claude/skills/` as copies, not into `.agents/skills/` with links like the other community skills; record them under `## Agent skills` and decide whether to move them.
- [ ] Skim `sanity-best-practices` for the one low risk alert the installer reported before relying on it.
- [ ] Connect the Sanity MCP server (`claude mcp add Sanity -t http https://mcp.sanity.io --scope user`, then sign in with OAuth), as you planned.
- [ ] `sanity-best-practices`, `content-modeling-best-practices`, `portable-text-serialization`, and `sanity-migration` conventions are not yet in AGENTS.md; they apply to `studio/` and the Sanity read path, so they belong in a nested `studio/AGENTS.md` with a one line pointer from root.
