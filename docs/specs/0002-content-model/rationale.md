# 0002. Content model: rationale

The decision record behind [index.md](index.md). `/develop` builds from `index.md` and can skip this file.

## Context

The site is five public pages (home, about, three services, projects, contact) for a BIM and Revit modeling company, all placeholder copy for now. The scope sets three hard requirements for the content layer: every headline, paragraph, and image comes from a data file rather than layout code; every entry carries a language key from day one; and adding a fourth service is one entry, not a component edit. Spec 0001 already fixed the tools (Astro content collections validated by Zod, images optimised at build from `src/assets/`, Astro's i18n with English only and no prefix on English URLs) and chose descriptive service URLs whose actual values this feature sets.

The content is written by one developer, changes rarely, and is built into static HTML. There is no test suite (Alpha tier), so the build itself is the main safety net: whatever the content layer does not check, nothing checks. Several pieces of content are shared across pages: the stats appear on home and about, the contact details on the footer of every page and on the contact page, and the services on the nav, the home page cards, and their own pages.

Deciding this before any page is built matters because every page feature (5 to 10) reads this data. A shape settled late means each page invents its own, and reshaping later touches every page. The language requirement is the same kind of cost: adding a language field after the fact means editing every file and every read.

## Options considered

### Option 1: One typed collection per content type, language folders, pure query module

Ten collections, each with its own tight Zod schema. Files live under `<collection>/<lang>/`, carry a required `lang`, and are read only through typed functions in `src/lib/content.ts` that filter by language, sort, merge (nav plus services, contact plus settings), and enforce rules that span entries.

**Pros**:
- Each schema is exact for its content, so a typo fails the build with a precise message.
- Language handling, sorting, and cross entry checks live in one module; pages stay markup only.
- A second language is a folder, a fourth service is a file.

**Cons**:
- The most structure of the options: ten collections plus a module, for five pages.
- Rules outside the schema run only when a getter runs.

### Option 2: Plain TypeScript data modules

Content as exported `const` objects in `.ts` files (for example `src/data/services.ts`), typed with TypeScript interfaces, imported directly by pages.

**Pros**:
- Simplest possible: no schema library, no loader, full editor autocomplete, familiar from React work.
- Type errors surface in the editor, not just at build.

**Cons**:
- Long copy as string literals in TypeScript is unpleasant to write and review.
- Images need manual imports per file; no automatic path checking in data.
- Breaks spec 0001's decision to use content collections, and throws away Astro's built in image path checks.

### Option 3: A single pages collection with ordered section blocks

One `pages` collection where each page is a list of typed blocks (hero, feature list, stats, cards, CTA), rendered in order, plus `services` and `projects`.

**Pros**:
- Pages can be reordered or composed from data without code changes.
- Closest to how a future browser based CMS would model pages.

**Cons**:
- The schema is a large union, so validation messages get vague and TypeScript narrowing adds code in every page.
- Flexibility nobody needs yet: the page designs are known and fixed.
- A block renderer is real extra code to build and maintain in feature 6.

### Option 4: A headless CMS now

Content in a hosted CMS, fetched at build.

**Pros**:
- Non developers could edit copy.

**Cons**:
- Adds a vendor, an account, and a build time network dependency for a site with one editor.
- The scope explicitly defers browser based editing to its own feature that needs its own decision.

## Rationale

Option 1 fits the forces best. The build is the only safety net at this tier, so exact per type schemas matter more than they would on a project with tests, and Option 1 is the one that gives each kind of content a strict shape. The query module is what turns the scope's growth requirements into guarantees: the nav and home cards read the services collection, so a fourth service is one file; the language filter lives in one place, so a second language is a folder. It also keeps pages as markup only, which matches the project rule of data in and markup out.

Option 2 was the strongest alternative for a developer coming from React, and it would work. It loses on long copy (the about story and service write ups are paragraphs, which read far better as Markdown than as string literals) and on image path checking, and it would reverse a decision spec 0001 made for the same reasons. Option 3 buys flexibility the design does not ask for, at the cost of vaguer errors and a block renderer, so fixed named sections win for now; if a real need to reorder sections from data appears, that is a later, contained refactor of the `home` collection alone. Option 4 is out of scope by the scope's own deferral.

Within Option 1, the finer calls made in the interview all follow the same logic. YAML for structure and Markdown for prose puts each kind of content in the format that reads best. Language folders plus a checked `lang` field make a second language tidy without trusting either signal alone. Shared stats and shared contact details avoid two copies of the same fact drifting apart. Required `seo` blocks and strict alt text move feature 11's and feature 6's quality requirements into the build, where they cannot be forgotten. Failing the build on missing content, and throwing only there, follows the project rule that throwing is for bugs: on a prerendered site, a missing entry is a bug found at build time, while a slug lookup that finds nothing is an expected outcome and returns a result.

Two small calls were made while writing, without an interview question, because expertise settles them. First, a service's closing call to action carries a full link (label and href), matching the home page's, rather than a label with a hardcoded contact path in code (runner up: a `CONTACT_PATH` constant, which would be the only route constant in the codebase). Second, service slugs are checked against a small reserved path list, because a service named `contact-us` would silently collide with the contact page once feature 8's dynamic route exists (runner up: rely on Astro's route collision warning, which is easy to miss in build output).
