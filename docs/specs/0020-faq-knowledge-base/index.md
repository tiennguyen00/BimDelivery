# 0020. FAQ, one page

**Date**: 2026-11-23 · **Rewritten**: 2026-11-26 (the engineer's call: one page after their mockup, replacing the hub and five region pages)
**Status**: In Progress
**Scope feature**: 19, FAQ (`docs/scope/scope.md`)
**Amends**: [0002](../0002-content-model/index.md) (one new collection, `faqPage`, and `faq` joins the reserved paths) · [0010](../0010-about-us-page/index.md) (`Accordion` gains a second look) · [0011](../0011-contact-page/index.md) (a link to the FAQ under the intro) · [0005](../0005-home-page/index.md) (`CtaBand` gains an `inline` layout)

## Summary

The site has one FAQ page, `/faq`, built to the engineer's mockup of 2026-11-26. A hero (an eyebrow, the title "Frequently Asked Questions" with its second line in brass, a line of intro, and the client's photo of a villa at dusk), then a search box and the client's eight questions as a column of boxes you open one by one, then a slim brass band that asks "Still have a question?" and links to Contact. The page carries FAQPage structured data (JSON-LD, the machine readable summary search engines read), the questions live in one YAML file that the build checks, and a small plain script adds instant search and links that open a single question. Everything prerenders, and with JavaScript off only the search box is missing.

The first version of this spec (2026-11-23) built a hub plus one page per market (United States, Australia, European Union, Canada, Japan) with 50 sample questions. It went live on 2026-11-24 and was replaced two days later; its five addresses now redirect to `/faq`.

## Requirements

**User stories**:
- As a developer or architect weighing an offshore BIM team, I want the common questions answered on one page, so I can judge BIM Delivery quickly.
- As a visitor with one specific worry (NDAs, standards, a pilot), I want to type it and see only the questions about it.
- As a salesperson, I want one link per question to send a prospect.
- As the developer, I want the questions in a content file the build checks, so adding or rewording one needs no component change.

**Acceptance criteria**:
- **AC-1**: `/faq` prerenders to `dist/client/faq/index.html`, with no `astro-island`. `/faq/united-states`, `/faq/australia`, `/faq/european-union`, `/faq/canada`, and `/faq/japan` answer with a 301 to `/faq`. `pnpm check`, `pnpm lint`, and `pnpm build` pass.
- **AC-2**: The hero shows the eyebrow with a short rule after it, the `h1` with its `==phrase==` on a line of its own in brass, and the intro. From `lg` the photo fills the end 3/5 of the band and fades into the page on its start side and its foot; below `lg` the photo sits above the words. No word sits on the photo itself. At 390px there is no sideways page scroll.
- **AC-3**: Under the hero, the search box and then every question in YAML order, each a closed box (the `Accordion`'s `list` look), in one centred column with equal margins either side. Several questions can be open at once. An answer keeps its `**bold**` and `==accent==` phrases.
- **AC-4**: Every question has a stable address, `/faq#<id>`. Loading that address, or changing the hash on the page, opens that question and brings it into view below the header. With JavaScript off the address still scrolls to the question, closed.
- **AC-5**: The search filters the questions in place as you type. A question matches when every word typed appears in its question or answer text, ignoring case and accents. A polite status line reads the count ("3 questions found", from the content's `one` and `other` texts); an empty box shows every question and an empty status. No match shows the no results heading and text. Clearing the box shows every question again, each keeping its open or closed state. Pressing Enter never reloads the page.
- **AC-6**: With JavaScript off, the search box is absent (`no-js:hidden`), and every question still opens and closes. Nothing is hidden waiting for a script.
- **AC-7**: The page's `<head>` holds one JSON-LD script, a `FAQPage` whose `mainEntity` lists every question shown, in page order, each a `Question` whose `name` is the question text exactly and whose `acceptedAnswer` is an `Answer` whose `text` is the answer with its `**` and `==` marks removed. It parses as JSON and shows no errors in the Schema.org validator. Every `<` in the JSON is written as `<`, so no content can close the script tag.
- **AC-8**: The header nav shows "FAQ" between "Project" and "Contact Us", on desktop and in the mobile menu, with `aria-current="page"` on `/faq`.
- **AC-9**: The Contact page shows a link to `/faq` under its intro text, with an arrow, its words from `contact.yaml`.
- **AC-10**: Every word on the page comes from the `faqPage` entry. A new question is one YAML edit: it appears in the list, the search, and the schema with no component change.
- **AC-11**: The build fails, naming the file and field, when: two questions share an `id`; a question `id` is not kebab case, starts with `faq-`, or is `main`; there are no questions or more than 30; a required field is missing or an unknown key is present; an emphasis mark is unbalanced; the hero photo has no `alt` (or `decorative: true`); or a service takes the slug `faq`.
- **AC-12**: The eight questions and answers are the client's, from [client-content.md](client-content.md), word for word apart from the dropped `Q1:` and `A:` prefixes.
- **AC-13**: The page takes its `<title>` and meta description from `faqPage.seo`.
- **AC-14**: The `Accordion`'s `bar` look and `CtaBand`'s `stacked` layout render exactly as before, in `/styleguide` and wherever they are used.
- **AC-15**: The hero's three lines play the CSS `entrance` on load, 80ms apart; a question opens and closes with the existing `accordion-item` slide and its chevron turns. Under reduced motion nothing moves. No new `motion` import.
- **AC-16**: Accessibility: the search box has a label (visually hidden); its status line is `role="status"`; the eyebrow's rule and the band's divider are hidden from screen readers; the `h1` comes before any `h2`; every control is reachable by keyboard with a visible focus ring; every summary is at least 44px tall.
- **AC-17**: `docs/design.md` and `/styleguide` record the `list` look, the FAQ hero, and `CtaBand`'s `inline` layout, each with its contrast pairs.

## Decision

**Chosen option**: one prerendered page, `/faq`, after the engineer's mockup (see [rationale.md](rationale.md)).

Content sits in one YAML collection, `faqPage`. The page is `src/pages/faq/index.astro`: `FaqHero`, then `FaqSearch` around the questions in the `Accordion`'s `list` look, then `CtaBand` with `layout="inline"`. One plain script, `src/scripts/faq.ts`, adds search and opens a linked question. Pure helpers in `src/lib/faq.ts` build the search text and the JSON-LD.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`)

**Engineer's choices (2026-11-26)**: one page, no regions, after the mockup; the client's eight questions word for word; the client's villa photo in the hero; the margins either side of the questions equal; the five region addresses redirect to `/faq`; this spec rewritten in place rather than superseded.

**Calls made in the build (each with its runner up):**
- **Schema**: one `FAQPage` on `/faq`, now that the page shows every answer. Google only accepts FAQ markup that matches answers visible on that page. No `BreadcrumbList`: a page one step from home has no trail worth marking. Runner up: none at all, which drops what other search engines and AI tools read.
- **Question anchors**: an explicit `id` per question in YAML, not one derived from its text, so a reworded question keeps its shared links. The page's own element ids all start with `faq-`, and a question `id` may not, nor be `main` (the skip link's target).
- **Search**: every question carries `data-faq-text`, its question and plain answer already normalised at build (lower case, accents removed). The script normalises the query with the same function, tests each word with `includes`, and only toggles `hidden`. Runner up: a JSON index the script turns into markup, which works against "enhance finished markup" (`src/scripts/AGENTS.md`).
- **The list look**: `Accordion`'s `list` variant, restyled from rows to boxes (a `field` border, a chevron that turns) to match the mockup; nothing else used the rows. Runner up: a third variant, which would leave the rows look unused.
- **The closing band**: `CtaBand` gains `layout: 'stacked' | 'inline'`, `stacked` the default and unchanged. Runner up: a separate FAQ band, which would copy the accent band's rules.
- **No word on the photo**: from `lg` the words sit on `canvas` beside the photo; below `lg` the photo sits above them. So the title's brass phrase keeps 7.71:1, where on the photo the accent role rule would forbid it. Runner up: the photo behind the words on a phone, which would turn the brass phrase cream.
- **Redirects**: Astro's `redirects` in `astro.config.mjs`, five entries, each a 301 to `/faq`. Runner up: let them 404; they were live only two days, but they may already be in search results.

## Feature design

**Data model** (one collection, strict at every level, `lang` required):

`faqPage`, one entry per language, `src/content/faqPage/en/faq.yaml`:

| Field | Type | Notes |
|---|---|---|
| `lang` | locale | required |
| `seo` | `{ title, description }` | the page |
| `hero` | `{ eyebrow: text, heading: emphasisText, intro: text, image: local image with alt }` | the `heading`'s `==phrase==` is the brass second line |
| `search` | `{ label, placeholder, results: { one, other } (countText), noResults: { heading, text } }` | the search box |
| `questions` | array of `question`, 1 to 30 | page order |
| `cta` | callToAction | the closing band |

`question`: `{ id: kebab case, not starting with faq-, not main, unique on the page; question: text; answer: emphasisText }`.

No relationship to other collections. `faq` stays in `RESERVED_PATHS` in `src/lib/content.ts`, since a service is served at `/<slug>`.

**Routes and interfaces** (static only, no endpoint):

| Route or module | What it is | Inputs | Outputs |
|---|---|---|---|
| `src/pages/faq/index.astro` | `GET /faq` | `getFaqPage(lang)` | hero, search, questions, closing band, the JSON-LD script in the `head` slot |
| `redirects` in `astro.config.mjs` | the five region addresses | | 301 to `/faq` |
| `getFaqPage(lang)` | `src/lib/content.ts`, through `loadSingle` | lang | the `faqPage` entry, after the unique `id` check |
| `src/lib/faq.ts` | pure helpers, no Astro imports | | `countLine`, `plainAnswer`, `normaliseSearch`, `faqSearchText`, `matchesSearch`, `faqPageJsonLd(questions)`, `jsonLdScript(value)` |
| `src/scripts/faq.ts` | plain script, imported by the page | hooks below | toggles `hidden`, sets `open`, writes the status |
| `src/components/faq/` | `FaqHero`, `FaqSearch` | props from the entry | markup |
| `src/components/ui/Accordion.astro` | `variant: 'bar' \| 'list'`, item `id` and `hooks` | | `details` list |
| `src/components/ui/CtaBand.astro` | gains `layout` | | the accent band |

Script hooks: `form[data-faq-search]` (ships `no-js:hidden`; holds `data-faq-target`, the id of the list it filters, and the status texts as `data-faq-one` and `data-faq-other`) · `[data-faq-status]` (`role="status"`) · `[data-faq-empty]` (no results message, shipped `hidden`) · `[data-faq-text]` and `details[data-faq-item][id]` on each question.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Page | title, description | `faqPage.seo` |
| Hero | eyebrow, `h1`, intro, photo and its alt | `faqPage.hero` |
| Questions | each question, answer, and anchor | `faqPage.questions[]`: `.question`, `.answer`, `.id` |
| Search | each question's `data-faq-text` | derived: `faqSearchText(question.question, question.answer)` |
| Search | label, placeholder, status, no results | `faqPage.search`; the count is the number of matches at run time |
| JSON-LD | `Question.name`, `Answer.text` | `question.question`; derived: `plainAnswer(question.answer)` |
| Closing band | heading, line, link | `faqPage.cta` |
| Header | the FAQ item | `navigation` `items`, `{ label: FAQ, href: /faq }` |
| Contact page | the FAQ link | `contact.faqLink` |
| Every value | language | the entry's `lang`, resolved from `Astro.currentLocale` |

**Key invariants**:
- One `faqPage` entry per language; question `id` unique on the page.
- The JSON-LD lists exactly the questions the page shows, in the same order, with the same question text.
- Search changes only `hidden` on questions; it never removes or rewrites content, and it never touches a question's `open` state.
- The page is prerendered; nothing in this feature runs on the server.
- Page element ids start with `faq-`; question ids never do.
- No word sits on the hero photo.

**Security model**: public, read only marketing content; no form, no storage, no personal data, no network call (search runs on text already in the page). The one injection surface is JSON-LD built from content, closed by writing `<` as `<`. The answers make claims about the company (see Follow-up); that is a content risk, not a code one.

**Configuration required**: no env var or secret. `site: 'https://bimdelivery.vn'` stays in `astro.config.mjs` for feature 11; the five `redirects` sit beside it.

**Critical test scenarios**:
- Happy path: open `/faq`, open two questions, type "nda", clear the box; four questions were shown with "4 questions found" read out, then all eight, the two still open, verifies **AC-3**, **AC-5**.
- Link: load `/faq#pilot-before-masterplan`; that question is open and its top sits just below the header, verifies **AC-4**.
- No script: with JavaScript off, no search box, eight questions, each opens on click, verifies **AC-6**.
- Schema: paste the built page into the Schema.org validator; one `FAQPage`, eight questions, no errors, verifies **AC-7**.
- Old links: request `/faq/japan`; a 301 to `/faq`, verifies **AC-1**.
- Bad content: copy a question `id`, then set one to `faq-x`, then remove the photo's `alt`; each build fails naming the file and field, verifies **AC-11**.
- Widths: 390px shows the photo above the words and no sideways scroll; 1440px shows equal margins either side of the questions, verifies **AC-2**, **AC-3**.

## Build plan

Skateboard: the whole page standing and usable with no script, with its schema, then search and links, then docs and gates.

**1. The page stands up, no script**
- [x] Rewrite the `faqPage` schema in `src/content.config.ts` (hero with its photo, questions with the `id` rules) and drop `faqRegions`, satisfies **AC-10**, **AC-11**
- [x] Replace `getFaqRegions` with the unique `id` check in `getFaqPage` (`src/lib/content.ts`), satisfies **AC-11**
- [x] Write `src/content/faqPage/en/faq.yaml` with the client's eight questions and add the hero photo (`src/assets/images/faq/faq-hero.jpg`, `CREDITS.md`), satisfies **AC-12**, **AC-13**
- [x] Restyle the `Accordion`'s `list` look as boxes with a turning chevron, satisfies **AC-3**, **AC-14**
- [x] Give `CtaBand` its `inline` layout, satisfies **AC-14**
- [x] Build `FaqHero` and rewrite `src/pages/faq/index.astro`, satisfies **AC-2**, **AC-3**, **AC-6**, **AC-13**, **AC-15**
- [x] Remove the region route, the five region files, `RegionBadge`, `RegionCard`, `RegionNav`, `Breadcrumb`, and the `sidebar-grid` and `sticky-below-header` utilities
- [x] Redirect the five region addresses in `astro.config.mjs`, satisfies **AC-1**

**2. The schema**
- [x] Put the `FAQPage` script in the page's `head` slot from `faqPageJsonLd` and `jsonLdScript`; drop `breadcrumbJsonLd`, satisfies **AC-7**

**3. Search and links**
- [x] Keep `FaqSearch` around the questions (`data-faq-text` on each), and drop the hub's results list from `src/scripts/faq.ts`, satisfies **AC-4**, **AC-5**, **AC-6**, **AC-16**

**4. Docs and gates**
- [x] Record the `list` look, the FAQ hero, and `CtaBand`'s `inline` layout in `docs/design.md`, and update the `/styleguide` tiles, satisfies **AC-17**
- [x] Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm `dist/client/faq/index.html` and the redirects; check 390px, 1024px, 1440px, JavaScript off, and reduced motion, satisfies **AC-1**, **AC-2**, **AC-6**, **AC-15**

## Consequences

**Positive**:
- One short page, one link, one schema; the whole FAQ is one scroll and one search.
- No new dependency: the browser's `details`, one small script, and the existing entrance.
- A new question is a YAML edit, checked at build.

**Negative / tradeoffs**:
- No per market pages: a visitor from one country reads the same eight questions as everyone else, and sales has one link per question, not per market.
- Google shows FAQ rich results only for well known government and health sites (since 2023), so the `FAQPage` markup will not bring the expandable result in Google. It still serves other search engines and AI tools.
- Search matches words, not meaning, and matches inside words ("nda" finds "standards"). Fine for eight questions.
- Five redirect entries to keep until search engines forget the old addresses.

**Neutral**:
- `site` in `astro.config.mjs` is no longer read by any page; feature 11 will read it.
- The removed region pieces (`Breadcrumb`, the badges, the region nav) live in git history at `79b09ce` if feature 11 or a later page wants them.
- The FAQ stays in YAML; moving it to Sanity is a later slice of spec 0019.

## Follow-up

- [ ] The client reviews the answers' wording before launch. Copied word for word, so a few slips show: Q2 "with the mind of utilize of wise BIM model", Q4 "when overdeveloping in BIM models", Q5 "BIM Delivery maintain", and Q7 mixes a spaced hyphen ("project - such as") with a dash.
- [ ] The client confirms the claims a customer could hold them to: "within 5–7 business days" (Q5), and "files never reside on unauthorized local drives" (Q6).
- [ ] Drop the five redirects once search engines show `/faq` for them (a few months).
- [ ] Confirm which address is the real one. `settings.contact.website` says `https://www.bimdelivery.vn`, but the Worker serves `bimdelivery.vn`; feature 11 should use the address that answers.
- [ ] Move the FAQ to Sanity as a later slice of spec 0019, so the client edits answers in Studio.
