# Scope: BIM Delivery Website

A marketing website for a BIM and Revit modeling services company. Five public pages, placeholder content for now, built so real content and real features can land later without a rewrite.

**Build approach:** Skateboard (ship the smallest genuinely usable whole site, then grow it release by release).
**Workflow:** Alpha (after `/develop`, run `/check verify` on the real site; no separate test suite by default). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Content model | Foundation | in-progress |
| 4 | Design system & UI foundation | Foundation | in-progress |
| 5 | Site shell: nav, dropdown, footer | Release 1 | planned |
| 6 | Home page | Release 1 | planned |
| 7 | About Us page | Release 1 | planned |
| 8 | Service pages (three) | Release 1 | planned |
| 9 | Project page | Release 1 | planned |
| 10 | Contact page | Release 1 | planned |
| 11 | SEO foundation | Release 2 | planned |
| 12 | Performance & image handling | Release 2 | planned |
| 13 | Privacy policy page | Release 2 | planned |
| 14 | Launch to a live URL | Release 2 | planned |
| 15 | Visitor analytics | Release 3 | planned |

## Foundations

### 1. Stack & architecture
Decide the framework and project shape for a public marketing site that has to render fast and be read easily by search engines, then scaffold a runnable project from that decision.
**Done when:** the stack is recorded in a spec, and an empty scaffold boots locally, builds clean, and serves a page whose text is already in the HTML the server sends.
spec [0001](../specs/0001-stack-and-architecture/index.md) · code in [src/](../../src/) (config: `astro.config.mjs`, `wrangler.jsonc`)
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Verify it: `/check verify stack & architecture`

This spec is also the natural place to settle where the site is hosted. If it does, feature 14 can go straight to `/develop`. **It did**: spec 0001 settles Cloudflare hosting, the DNS move, and the full deploy configuration, so feature 14 can skip `/architect`.

### 2. Coding standards & tooling
Capture the conventions from the real scaffolded project, then install lint, format, and commit checks, so every page after this is written the same way.
**Done when:** root `AGENTS.md` reflects the real stack and the agreed conventions, and lint and format run clean on the scaffold.
code in the project root (config: `eslint.config.js`, `.prettierrc.json`, `.husky/pre-commit`, `lint-staged` in `package.json`)
- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`

### 3. Content model
The shape of the content data files every page reads: site settings, navigation, home page sections, the three services, project entries, and contact details. Carries a language key from day one so a second language can drop in later without reshaping anything.
**Done when:** every headline, paragraph, and image on the site comes from a data file rather than from layout code; each entry carries a language key; adding a fourth service means adding one entry, not editing a component.
spec [0002](../specs/0002-content-model/index.md) · code in [src/content/](../../src/content/) (config: `src/content.config.ts`, query module: `src/lib/content.ts`, locales: `src/i18n/locales.ts`)
- [x] Design it (spec): `/architect content model`
- [x] Build it: `/develop content model`
  - [x] Thin path: locale list, shared shapes, `home` collection, query module, placeholder home page reading from content (AC-2 to AC-5, AC-10)
  - [x] Services and projects with placeholder entries, stock images, and cross entry checks (AC-6 to AC-9, AC-11)
  - [x] Remaining single entry collections (settings, navigation, stats, about, contact, projectPage, notFound) and their getters (AC-1, AC-2, AC-8, AC-11)
  - [x] Build gate and failure drills (AC-3 to AC-7, AC-12)
- [x] Verify it: `/check verify content model`

### 4. Design system & UI foundation
The visual language and the base pieces every page reuses: type scale, colour, spacing, the breakpoints for desktop, tablet, and mobile, plus buttons, cards, section wrappers, and form fields.
**Done when:** `design.md` covers type, colour, spacing, and the three breakpoints; base components are reachable by keyboard with a visible focus outline and readable contrast; a page can be composed from them without writing new one off CSS.
spec [0003](../specs/0003-design-system-ui-foundation/index.md) · code in [src/components/ui/](../../src/components/ui/) and [src/components/react/ui/](../../src/components/react/ui/) (tokens: `src/styles/global.css`, reference: `docs/design.md`, style guide: `src/dev/`)
- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
  - [x] Tokens, Inter, and base styles sitewide: Tailwind and the Prettier plugin installed, `global.css` with the four cleared namespaces, every token and its type companion keys, fonts API, `BaseLayout` wired (AC-2 to AC-5, AC-10, AC-12)
  - [x] Astro components: class maps, `Section`, `Button`, `Card` (AC-6 to AC-8, AC-10, AC-14)
  - [x] React fields: React integration, `Button`, `TextField`, `TextArea` sharing the class maps (AC-7, AC-9)
  - [x] Dev only `/styleguide`, `docs/design.md` with both contrast tables and the gold rule, and the build gate (AC-1, AC-11, AC-13 to AC-15)
- [ ] Verify it: `/check verify design system & UI foundation`

## Release 1: the whole site stands up

Every page exists, is linked, and reads well on a phone. This is the thinnest version a visitor would actually use, and the version you can show a client.

### 5. Site shell: nav, dropdown, footer · needs a decision
The header, the navigation with a SERVICES dropdown holding three sub items, the mobile menu, the footer, and the page layout every route sits inside. With numbered service URLs there is no services overview page, so the SERVICES item only opens the dropdown.
**Done when:** `/`, `/about-us`, `//revit-modeling, /scan-to-bim, /bim-coordination`, `/service-2`, `/service-3`, `/project`, and `/contact-us` all resolve and are reachable from the nav; the dropdown opens by mouse, keyboard, and touch, and closes on Escape; the mobile menu works; the current page is marked in the nav; a 404 page exists.
- [ ] Design it (spec): `/architect site shell`

### 6. Home page · needs a decision
The front door, following the reference layout minus the section you cut: hero, why choose us, company overview, stats counter, three service cards, global presence, differentiators list, certification, and a closing call to action.
**Done when:** every section renders from content data on desktop, tablet, and mobile; the services section shows exactly three cards linking to the three service pages; the "Delivering Precision BIM & Revit Modeling" section is absent; every image carries alt text.
- [ ] Design it (spec): `/architect home page`

### 7. About Us page
Who the company is, in placeholder copy: the story, capability highlights, and the same stats and trust cues the home page uses.
**Done when:** `/about-us` renders from content data across the three breakpoints, reuses design system sections rather than new one off layout, and carries its own page title and description.
- [ ] Build it: `/develop about us page`

### 8. Service pages (three)
One service page template, filled three times, at `//revit-modeling, /scan-to-bim, /bim-coordination`, `/service-2`, and `/service-3`: what the service is, what you get, a placeholder process, and a call to action back to contact.
**Done when:** all three URLs render from one template plus three data entries; each has its own title, description, and heading; adding a fourth is a data entry and a route, not a new layout; each links back to `/contact-us`.
- [ ] Build it: `/develop service pages`

### 9. Project page
A grid of placeholder project cards (image, title, one line) at `/project`, so the site can show work before detail pages exist.
**Done when:** `/project` renders a card grid from content data, reflows to tablet and mobile, images are sized so the layout does not jump while they load, and an empty state renders when there are no entries.
- [ ] Build it: `/develop project page`

### 10. Contact page
Contact details and a form that looks and behaves real, at `/contact-us`. Nothing is delivered yet; real sending is its own later feature.
**Done when:** the form checks required fields and email shape, shows inline errors tied to their field so a screen reader announces them, shows a clear success state on submit, and the page also lists email, phone, and address from content data. The code states plainly that nothing is sent yet.
- [ ] Build it: `/develop contact page`

## Release 2: findable, fast, and live

### 11. SEO foundation · needs a decision
The sitewide plumbing that lets search engines and chat previews understand the site: per page title and description, canonical URLs, a sitemap, robots rules, social preview cards, and organisation structured data.
**Done when:** every page has a unique title and description; a sitemap and a robots file are served; sharing any URL shows a correct preview card; the structured data validates; headings run in a sensible order on every page.
- [ ] Design it (spec): `/architect SEO foundation`

Worth knowing: because you chose `//revit-modeling, /scan-to-bim, /bim-coordination` style URLs, the path itself tells a search engine nothing about the service. Titles, headings, and descriptions carry more of the weight here than they would with named paths.

### 12. Performance & image handling
Make the pages fast on a real connection: right sized images in modern formats, deliberate font loading, and nothing jumping around as the page loads.
**Done when:** images are served at the size they are displayed and load lazily below the fold; fonts do not block the first paint; there is no visible layout shift; a production build of the home page meets the Core Web Vitals thresholds on a mid range mobile.
- [ ] Build it: `/develop performance & image handling`

### 13. Privacy policy page
A plain privacy page linked from the footer, covering what the contact form collects once it starts sending.
**Done when:** `/privacy` renders from content data, is linked in the footer, and says what is collected and how to reach you about it.
- [ ] Build it: `/develop privacy policy page`

### 14. Launch to a live URL · needs a decision
Put the site on a real host at a public URL, so it can be shared, measured, and judged on real speed.
**Done when:** the site is live at a URL you can send to someone, the production build runs in the host's own pipeline, and the live pages match what you see locally.
- [ ] Design it (spec): `/architect launch`

If feature 1's stack spec already settled the host, skip the spec and run `/develop launch` instead.

## Release 3: measure it

### 15. Visitor analytics · needs a decision
Know how many people arrive, where they come from, and which service page they read, so later improvements are guided by something other than guesswork.
**Done when:** page views and traffic sources are recorded on every page of the live site, the contact form's success state is recorded as a conversion, and the added script does not break the performance targets from feature 12.
- [ ] Design it (spec): `/architect visitor analytics`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Working contact form delivery**: the message actually reaches an inbox, with spam protection · needs a decision
- **Project detail pages**: `/project/<name>` with a gallery and a write up per project · needs a decision
- **Services overview page and more services**: grow from three toward the reference site's ten; decide then whether the home page keeps showing every service or a featured subset (from spec 0002)
- **Second language**: the switcher and a full second set of copy; the content model is already shaped for it · needs a decision
- **Content editing in a browser**: a real content system so copy changes need no code · needs a decision
- **Cookie consent banner**: once you run tracking that legally needs consent · needs a decision
- **Blog or insights section** · needs a decision
- **Real brand**: the real logo, brand colours, and typeface replace the palette borrowed from paviliusbim.com before launch; update the tokens, both contrast tables, and walk `/styleguide` again (from spec 0003)
- **A dark section tone**: bring back a dark band for a section such as the home page's closing call to action. It means reintroducing inherited tone variables, a card tone reset, and a second focus colour, then computing the dark contrast pairs. Gold reads well on black at 8.73:1 if you want it (from spec 0003)
- **Testimonials and client logos**
- **Error monitoring**: know when a real visitor hits a broken page · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` after `/develop`; `Alpha` after `/check verify`; `Beta` and `GA` after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` then `in-progress` then `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag means it inherits.
- **Workflow tier tag** beside a heading (e.g. `· Beta`) sets that one feature's rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing; **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
