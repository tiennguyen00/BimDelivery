# 0020. FAQ knowledge base, one page per region

**Date**: 2026-11-23
**Status**: In Progress
**Scope feature**: 19, FAQ knowledge base (`docs/scope/scope.md`)
**Amends**: [0002](../0002-content-model/index.md) (two new collections, `faqPage` and `faqRegions`, and `faq` joins the reserved paths) · [0010](../0010-about-us-page/index.md) (`Accordion` gains a second look) · [0011](../0011-contact-page/index.md) (a link to the FAQ under the intro)

## Summary

The site gets a FAQ laid out like a software help center. `/faq` is a hub with a search box and one card per market (United States, Australia, European Union, Canada, Japan), and each card opens its own page, such as `/faq/japan`, with that market's questions as a quiet list you open one by one. Every region page carries FAQPage and breadcrumb structured data (JSON-LD, the machine readable summary search engines read), the questions live in YAML files that a build checks, and a small plain script adds instant search and links that open a single question. Everything still prerenders, and with JavaScript off only the search box is missing.

## Requirements

**User stories**:
- As a developer or planner in one market, I want the questions that matter to my country in one place, so I can judge BIM Delivery quickly.
- As a visitor with one specific worry (GDPR, LOD 500, time zones), I want to type it and jump straight to the answer.
- As a salesperson, I want one link per market, or per question, to send a prospect.
- As the developer, I want each market and its questions in a content file the build checks, so adding a region or a question needs no component change.

**Acceptance criteria**:
- **AC-1**: `/faq` and one page per region prerender: `dist/client/faq/index.html` plus `dist/client/faq/<slug>/index.html` for `united-states`, `australia`, `european-union`, `canada`, and `japan`. No FAQ page has an `astro-island`. `pnpm check`, `pnpm lint`, and `pnpm build` pass.
- **AC-2**: The hub shows its `h1`, its intro, and one card per region in `order`. Each card shows the region's code badge, its name, its focus line, and its question count (for example "10 questions"), and the whole card is one link to `/faq/<slug>`. Cards sit in one column on a phone, two on a tablet, three from `lg`. At 390px there is no sideways page scroll.
- **AC-3**: A region page shows, from the top: a visible breadcrumb (FAQ, then the region's name; "FAQ" links to `/faq`, the region carries `aria-current="page"`), the region's badge, its name as the `h1`, its focus line, its question count, and every question in YAML order as a closed disclosure. Several questions can be open at once. An answer keeps its `**bold**` and `==accent==` phrases.
- **AC-4**: A region nav lists all regions in `order`, each with its badge and name, the current one marked `aria-current="page"`. From `lg` it is a sidebar left of the questions that stays in view below the header while the page scrolls; below `lg` it is a row of links above the questions that wraps onto a second line rather than scrolling sideways.
- **AC-5**: Every question has a stable address, `/faq/<slug>#<id>`. Loading that address, or changing the hash on the page, opens that question and brings it into view below the header. With JavaScript off the address still scrolls to the question, closed.
- **AC-6**: The hub's search filters every question of every region as you type. A question matches when every word typed appears in its question or answer text, ignoring case and accents. Matches show as links (the question, with its region's name beside it) to `/faq/<slug>#<id>`. A polite status line reads the count ("3 questions found", from the content's `one` and `other` texts). An empty box shows no results list and an empty status. No match shows the no results heading and text. Pressing Enter never reloads the page.
- **AC-7**: A region page's search filters that page's questions in place with the same matching and the same status line and no results message. Clearing the box shows every question again, each keeping its open or closed state.
- **AC-8**: With JavaScript off, both search boxes are absent (`no-js:hidden`). The hub cards, the region nav, the breadcrumb, and every question still work. Nothing is hidden waiting for a script.
- **AC-9**: Each region page's `<head>` holds two JSON-LD scripts. (1) A `FAQPage` whose `mainEntity` lists every question shown on that page, in page order, each a `Question` whose `name` is the question text exactly and whose `acceptedAnswer` is an `Answer` whose `text` is the answer with its `**` and `==` marks removed. (2) A `BreadcrumbList` with two items: "FAQ" at `https://bimdelivery.vn/faq` and the region's name at `https://bimdelivery.vn/faq/<slug>`. Both parse as JSON and show no errors in the Schema.org validator and Google's Rich Results Test. The hub carries no `FAQPage`. Every `<` in the JSON is written as `<`, so no content can close the script tag.
- **AC-10**: The header nav shows "FAQ" between "Project" and "Contact Us", on desktop and in the mobile menu. On `/faq` it carries `aria-current="page"`; on a region page it shows the active underline without `aria-current` (the Header's existing section rule). At 1024px the nav and the "Get a quote" button fit on one line with no overlap.
- **AC-11**: The Contact page shows a link to `/faq` under its intro text, with an arrow, its words from `contact.yaml`. It plays the intro text's own entrance step, so the form band's steps do not shift.
- **AC-12**: Every word on the FAQ pages comes from content: the hub's copy and the words every region page shares from the `faqPage` entry, each region from its own `faqRegions` file. Adding a sixth region is one new YAML file: it appears in the hub cards, the region nav, the routes, the search, and the schema with no component or route change.
- **AC-13**: The build fails, naming the file and field, when: two regions in one language share a `slug`, a `code`, or an `order`; two questions in one region share an `id`; a question `id` is not kebab case, starts with `faq-`, or is `main`; a `code` is not two capital letters; a region has no questions; a required field is missing or an unknown key is present; an emphasis mark is unbalanced; or a service takes the slug `faq`.
- **AC-14**: The five region files hold the engineer's 50 sample questions and answers from [sample-content.md](sample-content.md), word for word apart from the dropped `Q1:` and `A:` prefixes and the document's italics. Its bold phrases are kept as `**bold**`. Each file says in a comment that the content is a placeholder awaiting the client's review.
- **AC-15**: Each region page takes its `<title>` and meta description from its own `seo`, and the hub from `faqPage.seo`.
- **AC-16**: The `Accordion`'s existing look (`variant` left out) renders exactly as before, in `/styleguide` and anywhere it is used.
- **AC-17**: The hub's heading block and the region page's header block play the CSS `entrance` on load; the hub cards rise with the scroll reveal stagger (`data-reveal-stagger`); a question opens and closes with the existing `accordion-item` slide. Under reduced motion nothing moves. No new animation code and no new `motion` import.
- **AC-18**: Accessibility: each search box has a label (visually hidden is fine); its status line is `role="status"`; a badge next to a name is hidden from screen readers so the name is read once; the breadcrumb and the region nav are `nav` elements with their own labels; every page runs `h1` before any `h2`; every control is reachable by keyboard with a visible focus ring.
- **AC-19**: `docs/design.md` and `/styleguide` record the `Accordion`'s `list` look, the region badge, and the breadcrumb, each with its contrast pairs.

## Decision

**Chosen option**: Option 1, a hub plus one prerendered page per region (see [rationale.md](rationale.md)).

`/faq` is the hub (search plus region cards), and `/faq/[region]` is one template prerendered per `faqRegions` entry (breadcrumb, region nav, search, and the questions as the `Accordion`'s new `list` look). Content sits in two new YAML collections. One plain script, `src/scripts/faq.ts`, adds search and opens a linked question. Pure helpers in `src/lib/faq.ts` build the search text and the JSON-LD.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`)

**Engineer's choices (2026-11-23)**: hub plus region pages; instant search with no library; the quiet list look, several questions open; links in the header nav and on the Contact page; `/faq` plus country names; a two letter code badge per region; YAML in the repo now; the doc's opening paragraph about who buys BIM stays off the site.

**Calls made in the design (each with its runner up):**
- **Schema**: `FAQPage` plus `BreadcrumbList` on each region page, none on the hub, which shows no answers. Google only accepts FAQ markup that matches answers visible on that page and asks for one instance per question. Runner up: `FAQPage` alone, which drops the breadcrumb trail for no saving.
- **Absolute URLs**: set `site: 'https://bimdelivery.vn'` in `astro.config.mjs` (the apex domain the Worker's route serves, `wrangler.jsonc`) and build every schema URL with `new URL(path, Astro.site)`. Feature 11's canonical URLs and sitemap need the same setting. Runner up: read `settings.contact.website`, which is optional, is shown to people, and says `www`, which the Worker's route in `wrangler.jsonc` does not list.
- **Question anchors**: an explicit `id` per question in YAML, not one derived from its text, so a reworded question keeps its shared links. The page's own element ids all start with `faq-`, and a question `id` may not, nor be `main` (the skip link's target), so they never collide.
- **Search**: every result or question carries `data-faq-text`, its question and plain answer already normalised at build (lower case, accents removed). The script normalises the query with the same function and tests each word with `includes`. The hub ships its results list prerendered and `hidden`, so the script only toggles `hidden` and never builds markup. Runner up: a JSON index in the page that the script turns into markup, which is more code and works against "enhance finished markup" (`src/scripts/AGENTS.md`).
- **Opening a linked question**: `faq.ts` sets `open` on the `details` whose `id` matches the hash, on load and on `hashchange`. The `details` carries the `id`, so the browser's own jump (with `scroll-padding-top` already clearing the header) lands on its summary, and with JavaScript off the jump still works. Runner up: relying on the browser opening `details` for a fragment, which not every browser does.
- **Breadcrumb**: a reusable `src/components/ui/Breadcrumb.astro` (an ordered list in a labelled `nav`), since the project detail pages and feature 11 may want it. Runner up: markup inside the region page only.
- **The list look**: `Accordion` gets `variant: 'bar' | 'list'` (default `bar`, today's look unchanged) and an optional `id` per item. Props become a union, so `name` stays required for `bar` (one open at a time) and does not exist for `list` (several open). Runner up: a separate `FaqList` component, which would copy the `details` and slide logic.
- **Links into the FAQ**: the nav item is a plain entry in `src/content/navigation/en/main.yaml`; the Contact link is a new `faqLink` (`link` shape) in `contact.yaml`, drawn by `src/components/contact/IntroBand.astro`.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (two new collections, both strict at every level, `lang` required):

`faqPage`, one entry per language, `src/content/faqPage/en/faq.yaml`: the hub's copy and the words every region page shares.

| Field | Type | Notes |
|---|---|---|
| `lang` | locale | required |
| `seo` | `{ title, description }` | the hub only |
| `heading` | text | the hub's `h1` |
| `intro` | emphasisText | under the hub's `h1` |
| `regionsHeading` | text | the cards' `h2`, "Browse by region" |
| `questionCount` | `{ one: countText, other: countText }` | "{count} questions", on cards and region headers |
| `search` | `{ label, placeholder, results: { one, other } (countText), noResults: { heading, text } }` | both search boxes |
| `breadcrumb` | `{ navLabel, label }` | `navLabel` names the `nav` ("Breadcrumb"); `label` is the first crumb and the schema's first item ("FAQ") |
| `regionNavLabel` | text | the region nav's label and its visible title, "Regions" |
| `cta` | callToAction | the closing band on the hub and every region page |

`faqRegions`, one entry per region per language, `src/content/faqRegions/en/<slug>.yaml`:

| Field | Type | Notes |
|---|---|---|
| `lang` | locale | required |
| `slug` | kebab case string | the URL segment; unique per language |
| `code` | `/^[A-Z]{2}$/` | the badge, "US"; unique per language |
| `name` | text | "United States"; `h1`, card title, nav, breadcrumb, schema |
| `focus` | text | the doc's "Primary Focus" line |
| `order` | positive integer | unique per language; cards, nav, and search follow it |
| `seo` | `{ title, description }` | the region page |
| `questions` | array of `question`, 1 to 30 | page order |

`question`: `{ id: kebab case, not starting with faq-, not main, unique within its region; question: text; answer: emphasisText }`.

No relationship to other collections. `faq` joins `RESERVED_PATHS` in `src/lib/content.ts`, since a service is served at `/<slug>`.

**Routes and interfaces** (static only, no endpoint):

| Route or module | What it is | Inputs | Outputs |
|---|---|---|---|
| `src/pages/faq/index.astro` | the hub, `GET /faq` | `getFaqPage(lang)`, `getFaqRegions(lang)` | h1, intro, search, results list, cards, closing band |
| `src/pages/faq/[region].astro` | `GET /faq/<slug>`, one per region | `getStaticPaths` from `getFaqRegions(DEFAULT_LOCALE)` (as `project/[slug].astro` does); `getFaqPage(lang)` | breadcrumb, region nav, header, search, questions, closing band, two JSON-LD scripts in the `head` slot |
| `getFaqPage(lang)` | `src/lib/content.ts`, through `loadSingle` | lang | the `faqPage` entry |
| `getFaqRegions(lang)` | `src/lib/content.ts` | lang | regions sorted by `order`, after the checks in AC-13 (`checkUnique` for `slug`, `code`, `order`; a new per region check for question `id`s) |
| `src/lib/faq.ts` | pure helpers, no Astro imports | | `normaliseSearch(text)`, `plainAnswer(answer)` (emphasis marks dropped, built on `splitEmphasis`), `faqSearchText(question, answer)`, `faqPageJsonLd(questions)`, `breadcrumbJsonLd(items)`, `jsonLdScript(value)` (stringify with `<` as `<`) |
| `src/scripts/faq.ts` | plain script, imported by both FAQ routes | hooks below | toggles `hidden`, sets `open`, writes the status |
| `src/components/faq/` | `RegionBadge`, `RegionCard`, `RegionNav`, `FaqSearch` | props from the entries | markup |
| `src/components/ui/Breadcrumb.astro` | reusable | `label`, `items: { label, href }[]` (last is current) | `nav` with an `ol` |
| `src/components/ui/Accordion.astro` | gains `variant` and item `id` | as in Decision | `details` list |

Script hooks: `form[data-faq-search]` (ships `no-js:hidden`; holds `data-faq-target`, the id of the list it filters) · `[data-faq-status]` (`role="status"`) · `[data-faq-empty]` (no results message, shipped `hidden`) · `[data-faq-results]` (the hub's results wrapper, shipped `hidden`) · `[data-faq-text]` on each result `li` and each question `details` · `details[data-faq-item][id]` for the hash. The status texts travel as `data-faq-one` and `data-faq-other` on the form.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Hub | title, description | `faqPage.seo` |
| Hub | `h1`, intro, cards heading | `faqPage.heading`, `.intro`, `.regionsHeading` |
| Hub card | badge, name, focus line | `region.code`, `.name`, `.focus` |
| Hub card | "10 questions" | `faqPage.questionCount.one` or `.other`, `{count}` = `region.questions.length` |
| Hub card | link | `/faq/${region.slug}` |
| Hub result | question, region name, link | `question.question`, `region.name`, `/faq/${region.slug}#${question.id}` |
| Hub result, region question | `data-faq-text` | derived: `faqSearchText(question.question, question.answer)` |
| Search | label, placeholder, status, no results | `faqPage.search`; the count is the number of matches at run time |
| Region page | title, description | `region.seo` |
| Region page | breadcrumb | `faqPage.breadcrumb.label` linking `/faq`, then `region.name` |
| Region page | nav label, the list of regions | `faqPage.regionNavLabel`, `getFaqRegions(lang)` |
| Region page | anchor of each question | `question.id` |
| Region page JSON-LD | origin of every URL | `site` in `astro.config.mjs`, `https://bimdelivery.vn`, read as `Astro.site` |
| Region page JSON-LD | `Answer.text` | derived: `plainAnswer(question.answer)` |
| Hub and region pages | closing band | `faqPage.cta` |
| Header | the FAQ item | `navigation` `items`, `{ label: FAQ, href: /faq }` |
| Contact page | the FAQ link | `contact.faqLink` |
| Every FAQ page | language | the entry's `lang`; routes resolve it as `project/[slug].astro` does |

**Key invariants**:
- One `faqPage` entry per language that has `faqRegions`; region `slug`, `code`, and `order` unique per language; question `id` unique within its region.
- The JSON-LD on a region page lists exactly the questions the page shows, in the same order, with the same question text.
- Search changes only `hidden` on results and questions; it never removes or rewrites content, and it never touches a question's `open` state.
- Every FAQ route is prerendered; nothing in this feature runs on the server.
- Page element ids start with `faq-`; question ids never do.

**Security model**: public, read only marketing content; no form, no storage, no personal data, no network call (search runs on text already in the page). The one injection surface is JSON-LD built from content, closed by writing `<` as `<`. The sample answers make factual claims about the company (see Follow-up); that is a content risk, not a code one.

**Configuration required**: no env var or secret. One config value: `site: 'https://bimdelivery.vn'` in `astro.config.mjs`.

**Critical test scenarios**:
- Happy path: open `/faq`, type "gdpr", follow the European Union result; `/faq/european-union#gdpr-data-sovereignty` loads with that question open and in view below the header, verifies **AC-5**, **AC-6**.
- Region filter: on `/faq/japan` open two questions, type "plateau", clear the box; one question was shown, then all ten, the two still open, and the status was read out, verifies **AC-7**, **AC-18**.
- No script: with JavaScript off, `/faq` shows no search, the cards work, and a region page's questions open on click, verifies **AC-8**.
- Schema: paste each region page's built HTML into the Rich Results Test and the Schema.org validator; no errors, ten questions, two crumbs; `/faq` shows no `FAQPage`, verifies **AC-9**.
- Bad content: copy a question `id` within one region, then set a `code` to `usa`, then set a service slug to `faq`; each build fails naming the file and field, verifies **AC-13**.
- Growth: add a sixth region file with two questions; it shows in the cards, the nav, the search, its own route, and its schema with no code change, verifies **AC-12**.

## Build plan

Skateboard: first the whole FAQ standing and usable with no script, then its schema, then search and deep links, then motion, docs, and gates.

**1. The FAQ stands up, no script**
1. Add `site: 'https://bimdelivery.vn'` to `astro.config.mjs`, satisfies **AC-9** (used in step 2.1)
2. Add the `faqPage` and `faqRegions` schemas to `src/content.config.ts`, with the question `id` rules, satisfies **AC-12**, **AC-13**
3. Add `getFaqPage` and `getFaqRegions` with their checks to `src/lib/content.ts`, and `faq` to `RESERVED_PATHS`, satisfies **AC-12**, **AC-13**
4. Write `src/content/faqPage/en/faq.yaml` (placeholder copy) and the five region files from [sample-content.md](sample-content.md), each with its placeholder comment, satisfies **AC-14**, **AC-15**
5. Give `Accordion` its `variant` union and item `id`; `list` draws rows split by a `line` border, all closed, no shared `name`, title in the heading colour turning `accent` when open, a plus or minus icon in `accent` with no circle, satisfies **AC-3**, **AC-16**
6. Build `Breadcrumb`, `RegionBadge`, `RegionCard`, and `RegionNav`, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-18**
7. Build `src/pages/faq/index.astro` and `src/pages/faq/[region].astro` with the closing `CtaBand`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-8**, **AC-15**
8. Add the FAQ nav item and the Contact page's `faqLink`, satisfies **AC-10**, **AC-11**

**2. The schema**
1. Write `src/lib/faq.ts`'s `plainAnswer`, `faqPageJsonLd`, `breadcrumbJsonLd`, and `jsonLdScript`, and put both scripts in the region route's `head` slot, satisfies **AC-9**

**3. Search and deep links**
1. Add `normaliseSearch` and `faqSearchText` to `src/lib/faq.ts`; write `data-faq-text` on every result and question; add `FaqSearch` (its label and `role="status"` line) to both routes and the hub's prerendered, `hidden` results list, satisfies **AC-6**, **AC-7**, **AC-8**, **AC-18**
2. Write `src/scripts/faq.ts`: filtering, the status line, the no results message, Enter does nothing, and opening the hash's question on load and on `hashchange` (found with `getElementById` on the decoded hash, never a `#` selector), satisfies **AC-5**, **AC-6**, **AC-7**

**4. Motion, docs, and gates**
1. Put `entrance` on the hub's heading block and the region header, and `data-reveal-stagger` on the cards; import `reveal.ts` on the hub, satisfies **AC-17**
2. Record the `list` look, the badge, and the breadcrumb in `docs/design.md` with their contrast pairs, and add `/styleguide` tiles, satisfies **AC-19**
3. Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm the six HTML files in `dist/client/faq/`; run the schema validators; check 390px, 1024px, JavaScript off, and reduced motion, satisfies **AC-1**, **AC-8**, **AC-9**, **AC-10**, **AC-17**

## Consequences

**Positive**:
- Each market gets its own page, title, and schema, and sales can link one market or one question.
- No new dependency: the browser's `details`, one small script, and the existing entrance and reveal.
- A new region or question is a YAML edit, checked at build.

**Negative / tradeoffs**:
- Six new routes and two collections to keep up; region pages repeat the shared sidebar and closing band.
- Google shows FAQ rich results only for well known government and health sites (since 2023), so the `FAQPage` markup will not bring the expandable result in Google. It still serves other search engines and AI tools, and the visible answers carry the real search value.
- Search matches words, not meaning: "price" does not find "pricing", and there is no ranking. Fine for 50 questions; a few hundred would call for Pagefind.
- `data-faq-text` repeats every answer once more in the HTML (about 20KB on the hub before compression).
- A fifth header item leaves less room at `lg` for any later nav item.
- Japanese terms inside English answers carry no `lang="ja"`, so some screen readers read them with English rules.

**Neutral**:
- `site` in `astro.config.mjs` also changes `Astro.site` for every page; nothing reads it yet, and feature 11 will.
- The FAQ stays in YAML; moving it to Sanity is a later slice of spec 0019.
- `src/scripts/AGENTS.md` gains a `faq.ts` entry (via `/sync`).

## Follow-up

- [ ] The client reviews the sample answers before launch, above all the claims a customer could hold them to: "guarantee zero metric/imperial conversion errors" (US), "certified" in the EU ISO 19650 question, "translated with 100% accuracy" and "Japan's #1 preferred offshore engineering partner" (Japan), "40%–60% cost savings", "a 60+ specialist bench", and "within 5–7 business days" (Canada). Unbacked claims are a legal risk under consumer law in Australia, the EU, the US, and Canada.
- [ ] Confirm which address is the real one. `settings.contact.website` says `https://www.bimdelivery.vn`, but the Worker serves `bimdelivery.vn`; the schema and feature 11 should use the address that answers.
- [ ] Feature 11 (SEO foundation) reuses `site` and `Breadcrumb`, and decides whether every page gets `BreadcrumbList`.
- [ ] Move the FAQ to Sanity as a later slice of spec 0019, so the client edits answers in Studio.
- [ ] Build this on its own branch (`feat/faq`) after `feat/why-choose` is merged.
