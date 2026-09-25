# 0002. Model site content as typed, per language content collections

**Date**: 2026-09-19
**Status**: Accepted
**Scope feature**: 3, Content model (`docs/scope/scope.md`)

## Summary

Every word and image on the site will live in data files under `src/content/`, one collection (a folder of entries checked against a schema) per kind of content: site settings, navigation, stats, the home, about, contact, project, and not found pages, services, and projects. Each file sits in a language folder and carries a required `lang` field, so a second language later is a new folder of files, not a reshape. Pages never read these files directly; they call a small set of typed functions in `src/lib/content.ts`, which also checks the rules a schema alone cannot (unique slugs, matching languages, valid links between entries). Anything broken or missing stops the build with a message naming the file, so a bad entry never reaches a visitor.

## Requirements

**User stories**:
- As the site maintainer, I want every headline, paragraph, and image to come from a data file so that changing copy never means editing a layout.
- As the site maintainer, I want adding a fourth service to be one new file so that the site can grow toward the reference site's ten services without touching components.
- As the site maintainer, I want a broken or missing entry to fail the build with a clear message so that a mistake is caught in seconds instead of by a client.
- As a future translator, I want every entry to carry a language and live in a language folder so that a second language drops in without renaming or reshaping anything.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `src/content.config.ts` defines exactly ten collections: `settings`, `navigation`, `stats`, `home`, `about`, `contact`, `projectPage`, `notFound`, `services`, `projects`, with the fields in *Data model sketch* below.
- **AC-2**: Every entry carries a required `lang` field whose allowed values come from the one shared locale list (today only `en`). An entry whose `lang` differs from its language folder (for example `services/en/x.md` with `lang: vi`) fails the build with a message naming the file.
- **AC-3**: An entry with a missing required field, a wrong type, or an image path that does not exist fails the build, and the message names the file and the field.
- **AC-4**: Every image object has either a non empty `alt` or `decorative: true`, never both and never neither. An image with `alt: ""` or with no `alt` and no `decorative` fails the build.
- **AC-5**: Every `home`, `about`, `contact`, `projectPage`, `notFound`, and `services` entry has a required `seo` block with a `title` of 1 to 60 characters and a `description` of 50 to 160 characters; outside those bounds fails the build.
- **AC-6**: Three placeholder services exist in `en` with slugs `revit-modeling`, `scan-to-bim`, and `bim-coordination`, each with a Markdown write up, at least one deliverable, and at least one process step. Two services in the same language sharing a `slug` or an `order`, or a slug equal to a reserved path (see *Key invariants*), fails the build.
- **AC-7**: A project whose `service` points to a service that does not exist, or to a service in a different language, fails the build. (Astro itself only logs a broken reference, so the query module is what fails the build.)
- **AC-8**: `src/lib/content.ts` exports typed, side effect free read functions: `getSettings`, `getNavigation`, `getStats`, `getHomePage`, `getAboutPage`, `getContactPage`, `getServices`, `getServiceBySlug`, `getProjects`, each taking a `lang`. `getProjectPage` and `getNotFoundPage` are exported too. A missing required single entry (settings, navigation, stats, home, about, contact, projectPage, notFound) throws with a message naming the collection and language. `getProjects` returns an empty list when there are no projects, and `getServiceBySlug` returns an explicit not found result rather than throwing.
- **AC-9**: `getNavigation(lang)` returns the authored items with the `services` slot expanded into one item per service, sorted by `order`, each linking to `/<slug>`. Adding a fourth service file, with no code edit, makes it appear in both `getServices` and `getNavigation` output.
- **AC-10**: The existing placeholder home page (`src/pages/index.astro`) renders its page title, meta description, hero heading, hero subheading, and the list of service titles from content through the query module. Neither that page nor `BaseLayout.astro` contains hardcoded visible copy.
- **AC-11**: Placeholder content exists for all ten collections in `en`. Placeholder photos are free licence stock photos saved under `src/assets/images/`, each listed in `src/assets/images/CREDITS.md` with its source and licence; the logo and certification badges are generated placeholder SVGs, not real certification body marks.
- **AC-12**: `pnpm check` and `pnpm build` pass, and `dist/client/` still contains `index.html` (the rendering invariant from spec 0001 holds).

## Decision

**Chosen option**: Option 1: One typed collection per content type, in language folders, read through a pure query module.

Model all site content as ten Astro content collections validated by Zod, YAML for structured data and Markdown with frontmatter for long copy, organised as `src/content/<collection>/<lang>/<entry>`, with every page reading content only through typed functions in `src/lib/content.ts` that also enforce the cross entry rules.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

### Files and folders

```
src/
  i18n/locales.ts              LOCALES = ['en'] as const, DEFAULT_LOCALE = 'en', type Locale
  content.config.ts            the ten collections and the shared shapes
  lib/content.ts               the query module (the only reader of collections)
  content/
    settings/en/site.yaml
    navigation/en/main.yaml
    stats/en/stats.yaml
    home/en/home.yaml
    about/en/about.md
    contact/en/contact.yaml
    projectPage/en/project.yaml
    notFound/en/not-found.yaml
    services/en/revit-modeling.md
    services/en/scan-to-bim.md
    services/en/bim-coordination.md
    projects/en/<name>.yaml    four to six placeholder projects
  assets/images/
    CREDITS.md                 source and licence of every stock photo
    brand/  home/  about/  services/  projects/  badges/
```

All collections use Astro's `glob` loader (confirmed present in the installed Astro 7) with patterns `**/*.yaml` or `**/*.md`. **Every collection passes an explicit `generateId` that returns the file path without extension**, for example `en/revit-modeling`. This matters for `services`: the default `generateId` in Astro 7.3 returns the `slug` frontmatter field when one exists, which would drop the language folder from the id and let two languages' copies of a service collide. Using the path for every collection keeps ids uniform and always prefixed by language. Image paths inside entries are relative to the entry file, which is how Astro's `image()` schema helper resolves them.

**One locale list.** `src/i18n/locales.ts` is the single source of the allowed languages. `content.config.ts` builds the `lang` enum from it, and `astro.config.mjs` imports it for `i18n.locales` and `i18n.defaultLocale`. If importing a `.ts` file from `astro.config.mjs` fails in this Astro version, keep the literal in the config with a comment pointing at `locales.ts`, and have the query module throw at build if `LOCALES` and the configured locales differ. Either way, the two lists cannot drift silently.

### Data model sketch

**Shared shapes** (defined once in `content.config.ts`, reused by every collection). `lang`, `seo`, and `link` are plain module level Zod constants. `image` cannot be: Astro's `image()` helper only exists inside each collection's `schema: ({ image }) => ...` callback, so the shared image shape is a factory, `imageSchema(image)`, called inside each collection's schema.

| Shape | Fields | Rules |
|---|---|---|
| `lang` | enum from `LOCALES` | required on every entry |
| `image` | `src: image()`, `alt: string` optional, `decorative: literal(true)` optional | one strict object with a refinement: exactly one of `alt` (min length 1) or `decorative: true`. Neither, both, or empty `alt` fails, with the error on the `alt` path. A refined single object is used instead of a union because a union reports each branch's failure and loses the precise field name AC-3 asks for |
| `seo` | `title: string`, `description: string` | title 1 to 60 chars, description 50 to 160 chars |
| `link` | `label: string`, `href: string` | `href` starts with `/` (internal path) |

**Single entry collections** (exactly one entry per language, the file name is fixed):

| Collection | File | Fields (all required unless marked optional) |
|---|---|---|
| `settings` | `site.yaml` | `lang`, `siteName`, `tagline`, `logo: image`, `contact: { email (valid email), phone, address }`, `social: [{ network: 'linkedin' \| 'facebook' \| 'youtube' \| 'x' \| 'instagram', url (valid https URL) }]` (may be empty; the icon and the link's accessible name are derived from `network` in code), `footer: { text, copyright }` |
| `navigation` | `main.yaml` | `lang`, `items: [ link \| { label, type: 'services' } ]` (min 1; exactly one `services` slot), `cta: link` optional |
| `stats` | `stats.yaml` | `lang`, `items: [{ value: number (non negative), suffix: string optional, label }]` (min 1) |
| `home` | `home.yaml` | `lang`, `seo`, `hero: { heading, subheading, image, primaryCta: link }` (a strict object; `secondaryCta` removed 2026-09-21 by spec 0005, AC-22), `intro: { heading, headingHighlight, lead: { highlight, text }, paragraphs: string[] }` (strict), `overview: { heading, paragraphs: string[] min 1, image }`, `services: { heading, intro }`, `presence: { heading, paragraphs: string[] min 1 (balanced **), regions: [{ name, lon, lat }] min 1 max 6, whyChoose: { heading, items: string[] min 1 } }` (strict), `projectShowcase: { heading, intro, link }` (strict). Revised 2026-09-21 by spec 0005, the six section page: `whyChooseUs`, `stats`, `differentiators`, `certification`, and `cta` removed |
| `about` | `about.md` | frontmatter: `lang`, `seo`, `heading`, `intro`, `image`, `highlights: [{ title, text }]` min 1, `statsHeading`. Markdown body: the company story |
| `contact` | `contact.yaml` | `lang`, `seo`, `heading`, `intro`, `form: { nameLabel, emailLabel, companyLabel, messageLabel, submitLabel }`, `errors: { required, email, deliveryFailed }`, `success: { heading, text }` |
| `projectPage` | `project.yaml` | `lang`, `seo`, `heading`, `intro`, `emptyState: { heading, text }` |
| `notFound` | `not-found.yaml` | `lang`, `seo`, `heading`, `text`, `button: link` |

**Many entry collections**:

| Collection | File | Fields | Relationships |
|---|---|---|---|
| `services` | `<slug>.md` | frontmatter: `lang`, `slug` (kebab case, `^[a-z0-9]+(-[a-z0-9]+)*$`), `title`, `summary` (card one liner), `order` (positive integer), `seo`, `image`, `deliverables: string[]` min 1, `process: [{ title, text }]` min 1, `cta: { heading, text, button: link }`. Markdown body: the write up | 1 service to N projects |
| `projects` | `<name>.yaml` | `lang`, `title`, `summary`, `image`, `order` (positive integer), `service: reference('services')` | N projects to 1 service, same language only |

Relationships not stored as references, resolved in the query module:
- The home intro band (spec 0005, revised 2026-09-21) and `about.statsHeading` read numbers from `stats`.
- The home project showcase reads the first three of `getProjects(lang)` by `order` (spec 0005, revised 2026-09-21).
- `home.services` section reads cards from `services`: every service, sorted by `order` (exactly three today). No cap or featured flag; that is decided when the deferred "more services" work lands.
- `projectPage` reads its cards from `projects`, and shows `emptyState` when there are none.
- `contact` page reads email, phone, and address from `settings.contact`.
- `navigation`'s `services` slot expands from `services`.

Changes from the model shown in the interview:
- A service's closing call to action carries a full `button: link` (label and href) rather than a label alone, the same shape as the home page's. This avoids a hardcoded contact path in code.
- From the cross check: `projectPage` and `notFound` collections added so the `/project` page copy, its empty state, and the 404 page have a source; `contact.errors.deliveryFailed` added for spec 0001's `502` response; `settings.social` uses a closed `network` list instead of free text labels, so icons need no guessing.

**State transitions**: none. Content is static, changed only by a developer editing a file and rebuilding.

### Query module surface

There is no HTTP API. The surface is the set of functions in `src/lib/content.ts`, all run at build time only, all async (they wrap Astro's `getCollection` and `getEntry`), and all free of side effects beyond reading collections.

| Function | Input | Output | Errors |
|---|---|---|---|
| `getSettings(lang)` | `Locale` | settings data | throws an `Error` if the entry is missing |
| `getNavigation(lang)` | `Locale` | `readonly NavItem[]`, where `NavItem` is `{ label, href }` or `{ label, children: readonly { label, href }[] }` for the services slot | throws if missing, or if the entry has zero or more than one `services` slot |
| `getStats(lang)` | `Locale` | `readonly StatItem[]` | throws if missing |
| `getHomePage(lang)` | `Locale` | home data | throws if missing |
| `getAboutPage(lang)` | `Locale` | about data plus the renderable Markdown body (via Astro's `render`) | throws if missing |
| `getContactPage(lang)` | `Locale` | contact data merged with `settings.contact` | throws if either is missing |
| `getProjectPage(lang)` | `Locale` | project page data | throws if missing |
| `getNotFoundPage(lang)` | `Locale` | not found page data | throws if missing |
| `getServices(lang)` | `Locale` | `readonly Service[]` sorted by `order`, each with its renderable body | throws on a broken invariant (see below); may return an empty list |
| `getServiceBySlug(lang, slug)` | `Locale`, `string` | `{ ok: true, service } \| { ok: false, reason: 'not-found' }` | none; not found is an expected result |
| `getProjects(lang)` | `Locale` | `readonly Project[]` sorted by `order`, each with its resolved service (`{ slug, title }`) | throws when a referenced service is missing or in another language (Astro only logs this, so this throw is the real check); returns `[]` when there are no projects |

Why some throw and one returns a result: the project rule is that expected failures return an explicit result and only bugs throw. On a prerendered site, a missing required entry or a broken reference is a developer bug found at build time, so throwing is correct and is what stops the build. A slug lookup that finds nothing is an expected outcome for a caller, so it returns a result. Throw a plain `Error` whose message names the collection, language, file id, and the rule broken; no custom error class is needed.

Implementation notes:
- Keep the pure parts pure: filtering by language, sorting, invariant checks, and the navigation merge are plain functions over arrays, taking entries in and returning data out. Only a thin wrapper calls `getCollection`/`getEntry`. This keeps the logic testable later without Astro.
- Return data typed with `readonly`, and never mutate the objects Astro returns; build new arrays with `toSorted`, `map`, `filter`.
- Single entries are fetched by the fixed id `<lang>/<file name>`, for example `getEntry('home', 'en/home')`.

### Value sourcing

| Action | Value produced / displayed | Source |
|---|---|---|
| Any page | which language to read | `Astro.currentLocale`, falling back to `DEFAULT_LOCALE` from `src/i18n/locales.ts` |
| Any page | page `<title>` and meta description | that page's entry `seo.title` and `seo.description` (services: the service's `seo`) |
| `getNavigation` | a service's nav label and href | the service entry's `title` and `/` + `slug` |
| `getNavigation` | order of service items | the service entry's `order` |
| `getContactPage` | email, phone, address | `settings.contact` |
| `getProjects` | the service a project belongs to (title, link) | the referenced service entry's `title` and `slug` |
| Home intro band (feature 6) | each number, its suffix, its label, its icon | `stats.items[]` (`icon` added 2026-09-21 by spec 0005) |
| Stats display (feature 6) | number formatting, for example `1,200` | `Intl.NumberFormat(lang)` on `value`, derived at render, never stored as text |
| Contact form island (feature 10) | field labels, error and success copy | `contact.form`, `contact.errors`, `contact.success`, passed as props |
| Any image | width, height, optimised formats | derived by Astro's `image()` helper from the file at build |
| Any image | alt attribute | the image object's `alt`, or `""` when `decorative: true` |
| Footer (feature 5) | company name, footer text, social links | `settings.siteName`, `settings.footer`, `settings.social` |
| Footer (feature 5) | social icon and accessible name | derived in code from `settings.social[].network` (a fixed map from network to icon and name) |
| Home services section (feature 6) | which services show as cards | all of `getServices(lang)`, in `order` |
| Project page (feature 9) | heading, intro, SEO, empty state copy | `projectPage` entry |
| 404 page (feature 5) | heading, text, link home, SEO | `notFound` entry |
| Contact form island (feature 10) | message when sending fails (`502`) | `contact.errors.deliveryFailed` |

### Key invariants

Enforced by Zod in `content.config.ts`:
- Every required field present with the right type; every image path exists; every `alt` is non empty unless `decorative: true`.
- `seo` lengths, `slug` format, `order` a positive integer, `href` starts with `/`, `social.network` from the closed list, `social.url` a valid https URL, `contact.email` a valid email.
- `project.service` has the shape of a reference to `services`. Astro 7 does **not** fail the build when the referenced entry is missing (it only logs an error), so existence is checked in the query module below.

Enforced by the query module, because a schema sees one entry at a time:
- An entry's `lang` equals the first segment of its id (its language folder).
- Within one language, service `slug` values are unique, and service `order` values are unique; project `order` values are unique.
- A service `slug` is not a reserved path: `about-us`, `project`, `contact-us`, `privacy`, `api`, `404`. The list lives next to the check as a `const`, and whoever adds a new top level page adds it there.
- A project's referenced service exists, and has the same `lang` as the project.
- The navigation entry has exactly one `services` slot.
- If `LOCALES` is duplicated in `astro.config.mjs` (fallback above), the two lists are equal.

Every check runs on every build, because every collection is read by at least one prerendered page from feature 5 onward. Until the page features exist, the placeholder home page calls `getServices`, `getProjects`, `getNavigation`, and the single entry getters once (their results can stay unused apart from what AC-10 renders) so that all checks run from this feature onward.

### Security model

Public, read only content, written by the developer and built into static HTML. No user input reaches these files, and no personal data lives in them except the company's own published contact details. Nothing is secret. Stock photos must carry a licence that allows commercial use without attribution being displayed on the site; `CREDITS.md` records it anyway.

### Configuration required

None. No environment variables or credentials.

### Critical test scenarios

No test suite at the Alpha tier; these are the manual drills `/check verify` runs.
- Happy path: `pnpm build` passes and the placeholder home page shows the hero copy and three service titles from content, verifies **AC-10**, **AC-11**, **AC-12**
- Grow by data: copy a service file to a fourth one with a new slug and order, rebuild, and see it in the home page list with no code change; then delete it, verifies **AC-9**
- Failure case, one per rule, each reverted after: remove a hero `heading`; point an image at a missing file; set `alt: ""`; move a service into `services/vi/` keeping `lang: en`; give two services the same `slug`; set a slug to `contact-us`; point a project at a nonexistent service; delete `home.yaml`. Each must fail the build with a message naming the file, verifies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**
- Auth/permission: not applicable, there is nothing private to deny.

## Build plan

Skateboard: the first step is already a whole, thin, working path (a data file through the query module onto a real page), then each step widens it.

1. [x] Create `src/i18n/locales.ts` and point `astro.config.mjs` at it (or apply the documented fallback), satisfies **AC-2**
2. [x] In `content.config.ts`, define the shared shapes (`lang`, `image`, `seo`, `link`) and the `home` collection; write `home/en/home.yaml` with placeholder copy and its images; add `getHomePage` to `src/lib/content.ts`; rewire `src/pages/index.astro` to render title, description, hero heading, and subheading from it, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-10**
3. [x] Add the `services` and `projects` collections, the three service Markdown files, four to six project files, their images, and `CREDITS.md`; add `getServices`, `getServiceBySlug`, and `getProjects` with the slug, order, reserved path, language, and reference checks; list service titles on the placeholder home page, satisfies **AC-6**, **AC-7**, **AC-8**, **AC-9**, **AC-10**, **AC-11**
4. [x] Add `settings`, `navigation`, `stats`, `about`, `contact`, `projectPage`, and `notFound` collections with placeholder entries, the placeholder logo and badge SVGs, and their getters including the navigation merge; add the language folder check to every getter; call every getter from the placeholder home page, satisfies **AC-1**, **AC-2**, **AC-8**, **AC-9**, **AC-11**
5. [x] Run `pnpm check` and `pnpm build`, confirm `dist/client/index.html`, then run each failure drill from *Critical test scenarios* and revert it, satisfies **AC-3** to **AC-7**, **AC-12**

## Consequences

**Positive**:
- Features 5 to 10 each start from ready, typed data. Their `/develop` runs design markup, not data shapes.
- A fourth service is one Markdown file plus images: the nav, the home cards, and (with feature 8's dynamic route) the page appear with no component edit.
- A second language is a new folder per collection plus one line in `locales.ts`. No field is renamed and no existing URL moves.
- Broken content fails in seconds at build with a message naming the file, which on a site without tests is the main safety net.

**Negative / tradeoffs**:
- Ten collections and a query module is more structure than five pages strictly need today. It pays off the first time a service is added or a page is translated, not before.
- Image paths inside entries are relative to the entry file (for example `../../../assets/images/services/revit.jpg`), which is verbose and easy to get wrong. The build catches a wrong path, but typing them is fiddly.
- The fixed named home sections mean reordering or reusing sections is a code change in feature 6. Chosen deliberately; switching to a block list later is a real refactor.
- Some rules live in the query module, not the schema, so they only run when a getter runs. The rule that the placeholder home page calls every getter exists to close that gap until the page features take over.
- Copy edits still need a developer, a rebuild, and a deploy. Browser based editing stays a deferred feature.

**Neutral**:
- The service URLs are now fixed as descriptive slugs (`/revit-modeling`, `/scan-to-bim`, `/bim-coordination`), placeholders until the real service names arrive. Renaming one before launch is a one line change; after launch it costs ranking.
- `astro.config.mjs` starts importing from `src/`, a new coupling between config and source.
- Stock photos need a licence check at download time and a line in `CREDITS.md`.

## Follow-up

- [ ] The scope still names `//revit-modeling, /scan-to-bim, /bim-coordination`, `/service-2`, `/service-3` in features 5 and 8, while spec 0001 and this spec use descriptive slugs. Run `/scope` to reconcile those rows before building either feature.
- [ ] Replace the three placeholder service names and slugs with the real services before launch (feature 14). After launch, a slug change needs a redirect.
- [ ] Feature 13 (privacy page) adds its own `privacy` collection following the same pattern. `privacy` is already on the reserved path list.
- [ ] When the deferred "more services" work lands, decide whether the home page keeps showing every service or a capped or featured subset. Today it shows all, which is exactly three.
- [ ] When the second language lands (deferred), decide what happens when a translation is missing: fall back to English or fail the build. This spec only guarantees the shape is ready.
