# 0023. SEO foundation: one address per page, a full head, and a build step that checks every page

**Date**: 2026-11-27
**Status**: Proposed
**Scope feature**: 11, SEO foundation (`docs/scope/scope.md`)
**Feeds**: [0021](../0021-blog-in-sanity/index.md) (its *What this needs from feature 11* contract is answered in *What spec 0021 gets* below)
**Amends**: [0001](../0001-stack-and-architecture/index.md) (`build.format: 'file'` and `trailingSlash: 'never'`) · [0002](../0002-content-model/index.md) (`settings`: the address splits, `website` goes, `legalName` and `shareImage` arrive) · [0004](../0004-site-shell/index.md) (`PageLayout` takes one `head` prop; the header's current page check normalises `.html`) · [0015](../0015-project-detail-pages/index.md) (`projectHead` uses `withSiteName`; breadcrumbs on detail pages)

## Summary

Every page gets exactly one address (`https://bimdelivery.vn/about-us`, no trailing slash, no `www`), and its `<head>` says so with a canonical tag (the address search engines should treat as the real one), a share card (the title, text, and photo a chat app shows for a pasted link), and the company's details as structured data (JSON-LD, the machine readable summary search engines read). A `robots.txt` lets every crawler in, AI ones included, and points at a sitemap (the list of every page). One small build step reads every finished page, fails the build on a missing or duplicate title, description, or canonical, or on headings out of order, and writes the sitemap from what it read. Nothing new is installed and no JavaScript reaches the visitor.

## Requirements

**User stories**:
- As a prospect searching for a BIM partner, I want each result to show a clear title and description, so I can tell the services apart.
- As anyone pasting a link into Facebook, LinkedIn, Zalo, or Slack, I want a card with the page's own photo, title, and text.
- As a search engine or AI answer engine, I want one address per page, a sitemap, open crawl rules, and the company's facts in a standard form.
- As the developer and the SEO team, I want the build to refuse a page that would hurt search, so a mistake never reaches the live site.

**Acceptance criteria**:
- **AC-1**: Every page route builds to one HTML file named for its route: `dist/client/index.html`, `about-us.html`, `architectural-bim.html`, `interior-bim.html`, `landscape-bim.html`, `contact-us.html`, `faq.html`, `project.html`, `project/<slug>.html`, `404.html`. Live, `/about-us` answers 200 with no redirect, and `/about-us/` answers a redirect to `/about-us`. No internal link in the built HTML ends in a slash (except `/`). The header still marks the current page with `aria-current="page"`.
- **AC-2**: `https://www.bimdelivery.vn/<path>?<query>` answers 301 to `https://bimdelivery.vn/<path>?<query>`.
- **AC-3**: Every page except the 404 page has in its `<head>` exactly one `<title>`, one `<meta name="description">`, and one `<link rel="canonical">` whose `href` is `https://bimdelivery.vn` plus the page's path, with no trailing slash, no `.html`, no query, and no hash, and equal to the address the page is served at. Title and description are the entry's `seo`; a project detail without `seo` uses `withSiteName(title)` and its `summary`.
- **AC-4**: No two pages (the 404 page aside) share a `<title>`, and no two share a description.
- **AC-5**: Every page except the 404 page carries `og:type` (`website`; `article` only for a blog post, spec 0021), `og:site_name`, `og:title` and `og:description` (equal to the title and the description), `og:url` (equal to the canonical), `og:locale` (`en_US`), `og:image` (an absolute `https` JPEG, 1200 by 630), `og:image:alt`, `og:image:width` and `og:image:height` (see the Sanity rule in *Key invariants*), and `<meta name="twitter:card" content="summary_large_image">`. The image is the page's own photo from the *Share photo* table, else `settings.shareImage`.
- **AC-6**: Pasting the production address of the home page, a service page, `/faq`, and a project detail into Facebook's Sharing Debugger, LinkedIn's Post Inspector, and a Zalo chat shows that page's title, description, and its own photo, cropped without cutting the subject in half.
- **AC-7**: Every page's `<head>` holds one site graph JSON-LD script: an `Organization` with `@id` `https://bimdelivery.vn/#organization`, `name` (`settings.siteName`), `legalName` only when set, `url` `https://bimdelivery.vn/`, `logo` (`https://bimdelivery.vn/apple-touch-icon.png`), `email`, `telephone` (`+84968906789`), `address` (a `PostalAddress` with `streetAddress`, `addressLocality`, `addressCountry`), and `sameAs` holding only real profile links (none today, see *Key invariants*); and a `WebSite` with `@id` `https://bimdelivery.vn/#website`, `name`, `url`, `inLanguage`, and `publisher` pointing at the Organization's `@id`. Every `<` is written as `<`. Google's Rich Results Test and the Schema.org validator show no errors on the home page.
- **AC-8**: Each project detail's site graph also holds a `BreadcrumbList`: Home (`https://bimdelivery.vn/`), Project (`https://bimdelivery.vn/project`), then the project title (its canonical). The names are the navigation entry's labels for `/` and `/project`. The Rich Results Test detects the breadcrumb with no errors. `/faq`'s `FAQPage` still validates.
- **AC-9**: Production `/robots.txt` is exactly `User-agent: *`, `Allow: /`, `Disallow: /api/`, a blank line, and `Sitemap: https://bimdelivery.vn/sitemap.xml`. No crawler, AI or other, is blocked. Cloudflare's managed robots.txt is off, so the served file is the repo's. On a `SITE_NOINDEX` build (the dev link) it is the same without the `Sitemap` line.
- **AC-10**: Production `/sitemap.xml` is one `urlset` listing every built page without `noindex`, each `<loc>` its canonical, sorted by path, with a `<lastmod>` (`YYYY-MM-DD`) only for a page that carries `article:modified_time` (else `article:published_time`); no page carries either today. The 404 page is absent. On a build where every page is `noindex`, no sitemap is written.
- **AC-11**: The 404 page has `<meta name="robots" content="noindex">` and no canonical, no `og:url`, and no share tags. With `SITE_NOINDEX` on, every page has `<meta name="robots" content="noindex">`, as today, and keeps its canonical, `og:url`, and share tags pointing at `https://bimdelivery.vn` (on purpose: a preview page names the address it will have once published).
- **AC-12**: Every page has exactly one `h1`, it is the page's first heading, and no heading is more than one level deeper than the heading before it.
- **AC-13**: `pnpm build` fails, naming each file and the rule it breaks, when a page breaks AC-3, AC-4, AC-11, or AC-12, lacks `og:image` or points it at a file on this site that is not in `dist/client/`, or holds a JSON-LD script that does not parse. It only warns when a title is over 60 characters or a description is outside 50 to 160. The step runs on every build: local, production, the dev link, and every build a Sanity publish starts.
- **AC-14**: `settings.contact.address` is `{ street, city, country }`; the footer and the Contact page show `street, city` ("72/24 Phan Dang Luu, Duc Nhuan Ward, Ho Chi Minh City"). `settings.contact.website` is gone, and the footer's website line shows `bimdelivery.vn` linking to `https://bimdelivery.vn`, read from `site`. Every phone link (the footer, the Contact page's card and form band, the style guide) is `tel:+84968906789`. `settings.legalName` is optional and empty; `settings.shareImage` is required.
- **AC-15**: `bimdelivery.vn` is a verified Domain property in Google Search Console, owned by the client's company Google account with the developer as a full user, verified by a DNS TXT record in Cloudflare; Bing Webmaster Tools imports it from Search Console. The sitemap is submitted to both and reads with no errors.
- **AC-16**: The five old FAQ region addresses still answer 301 to `/faq`. A comment beside `redirects` in `astro.config.mjs` states the rule: removing or renaming a page route adds its 301 there in the same change.
- **AC-17**: `pnpm check`, `pnpm lint`, and `pnpm build` pass; `dist/client/` holds one HTML file per route (redirect stubs, if Astro writes any, are not routes) and nothing for `/styleguide`; no dependency is added; no page ships new client JavaScript.

## Decision

**Chosen option**: Option 1, the head written by our own `SeoHead` component from pure helpers, plus one build step of our own that checks every built page and writes the sitemap (see [rationale.md](rationale.md)).

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `wrangler` (`cloudflare/skills`, `.agents/skills/wrangler/`) · `cloudflare` (`cloudflare/skills`, `.agents/skills/cloudflare/`)

**Engineer's choices (2026-11-27)**: full titles stay in content; a build check on the built pages that fails on missing or duplicate tags and heading jumps, and warns on length; the page's own photo as its share image, else a default; every crawler allowed, AI included; no trailing slash; `www` redirected by a Cloudflare Redirect Rule; this spec covers removed pages only, renamed Sanity slugs get their own; Search Console and Bing set up now, owned by the client's company account; Organization and WebSite on every page; breadcrumbs on nested pages, and no Service, CreativeWork, or ItemList; the sitemap written by the build check; the home hero photo as the home card and the fallback, recorded as `settings.shareImage`; the address split into fields; `legalName` optional; `contact.website` removed; `sameAs` skips bare homepages; a tiny scanner with no dependency; Cloudflare's 307 accepted for the old slashed addresses.

**Calls made in the design (each with its runner up):**
- **Where the head lives**: `src/layouts/SeoHead.astro`, rendered by `PageLayout` in `BaseLayout`'s `head` slot, writes the canonical, the robots tag, the share tags, and the site graph. `BaseLayout` keeps writing `<title>` and the description from its own `title` and `description` props (the style guide uses it bare); `PageLayout` passes `head.title` and `head.description` into them, and `description` becomes required there too. `BaseLayout` loses its `SITE_NOINDEX` line, which moves into `SeoHead`. Runner up: all of it inline in `BaseLayout`, which does not read settings.
- **One `head` prop**: `PageLayout` takes `head: PageHead` in place of `title` and `description`; every route builds it from its entry. The canonical is never passed: `SeoHead` works it out from `Astro.url.pathname`. Runner up: each page passes its own path, one more thing to get wrong per route.
- **The `.html` trap**: with `build.format: 'file'`, `Astro.url.pathname` reads `/about-us.html` at build. `canonicalPath` drops `.html`, a trailing `/index`, and a trailing slash (except on `/`), and the header compares `canonicalPath(Astro.url.pathname)` with each href. Runner up: none; without it every canonical and every current page mark is wrong.
- **Share photos**: local and Pexels photos go through `getImage({ src, width: 1200, height: 630, fit: 'cover', position: 'center', format: 'jpg', quality: 80 })`, served from this site's origin. Sanity photos (project covers, service renders) use a new pure `shareImageUrl(photo)` in `src/lib/sanity-image.ts`, exactly as spec 0021 describes it (`rect`, then `w=1200&h=630&fit=crop&crop=focalpoint`, `fp-x` and `fp-y`, `fm=jpg`, `q=80`). Always JPEG, because some share scrapers still refuse WebP and AVIF. Runner up: the drawn photo's WebP, which Zalo and older LinkedIn scrapers drop.
- **Organization logo**: `/apple-touch-icon.png` (180 by 180 PNG, already in `public/`), above Google's 112 pixel minimum. Runner up: a new 512 PNG export of the mark, one more file to keep in step with the SVG.
- **Phone**: a `CALLING_CODES` map (`{ VN: '84' }`) in `src/lib/seo.ts`. `internationalPhone(phone, country)` takes the phone as written for people (digits with optional spaces, dots, dashes, parentheses): it keeps only the digits; written with a leading `+`, it returns `+` and those digits; otherwise it drops one leading `0` and prefixes `+` and the country's code (`0968906789` gives `+84968906789`). `country` is a Zod enum of the map's keys, so an unknown country fails the build. `telHref` in `src/lib/contact.ts` becomes `telHref(phone, country)`, returning `tel:` plus `internationalPhone`, the one phone link function; the copy in `Footer.astro` is deleted. A client abroad can then tap the link. Runner up: a second `phoneInternational` field, a copy that drifts.
- **`og:locale`**: an `OG_LOCALES` map in `src/i18n/locales.ts` (`{ en: 'en_US' }`), typed `Record<Locale, string>` so a new language cannot ship without one. Runner up: no `og:locale`, which some scrapers read as `en_US` anyway.
- **Breadcrumb names**: the labels of the navigation entry's link items (`items` with an `href`; the `services` dropdown item has none) for `/` and `/project`; a missing href is a build error in `content-gate.ts`. Runner up: new labels in the project detail copy, a second "Project" to keep in step.
- **The site graph**: one `<script type="application/ld+json">` with an `@graph` of Organization, WebSite, and, when given, the BreadcrumbList, built by pure `siteGraph` and `breadcrumbList` and written through the existing `jsonLdScript`. The FAQ page's `FAQPage` stays its own script. No `SearchAction` (Google retired the sitelinks search box). Runner up: separate scripts per type, which repeats the Organization for `@id` links.
- **The build step**: `src/build/seo-check.ts` holds the pure part (`readPage`, `pathFromFile`, `pageProblems`, `siteProblems`, `lengthWarnings`, `sitemapXml`); `src/build/seo-integration.ts` is the edge: an `astro:build:done` hook that turns `dir` into a path with `fileURLToPath`, refuses to run if `404.html` is not there (the wrong folder), reads every `.html` under it and nothing outside it, logs warnings, throws one error listing every problem, and writes `sitemap.xml`. When `GITHUB_ACTIONS` is set it also prints each problem as `::error file=<path>::<rule>: <detail>`, so a failed publish build shows the reason on the run's summary page. Throwing here is the project's "a broken page found at build is a bug" rule, as `content-gate.ts` does. Runner up: a separate `pnpm seo` script, which a Sanity triggered build would skip.
- **The scanner**: regular expressions over the tags the check needs (`<title>`, `<meta name|property>`, `<link rel="canonical">`, `<h1>` to `<h6>`, JSON-LD scripts). Each tag pattern accepts any attribute order, extra attributes (`class`, `data-astro-cid-*`), and single or double quotes; attribute values are decoded for `&amp;`, `&quot;`, `&#39;`, `&lt;`, `&gt;`. Before reading headings and the title, it removes every `<script>`, `<style>`, `<template>`, `<noscript>`, and `<svg>` block (the JSON-LD scripts are read first). A page holding `<meta http-equiv="refresh">` (a redirect stub) is skipped by every rule and is not a route. Runner up: `parse5`, sturdier for markup we do not control, which is none of it.
- **File to address** (`pathFromFile`, relative to `dist/client/`): `index.html` gives `/`; `<name>.html` gives `/<name>` (`about-us.html`, `faq.html`, `project.html`); `<dir>/<name>.html` gives `/<dir>/<name>` (`project/<slug>.html`); a nested `<dir>/index.html` gives `/<dir>`, so the check still reads a folder page right if one appears; `404.html` gives none (the 404 page, skipped by the address, uniqueness, and sitemap rules).
- **Dates**: `article:published_time`, `article:modified_time`, and `<lastmod>` are `YYYY-MM-DD` (a valid ISO 8601 date, the form spec 0021 stores); the check fails a value of any other shape.
- **Postal address**: street, city, and country only; no `addressRegion` or `postalCode`, which the company has not given and the Rich Results Test does not require.
- **Share image size tags**: `og:image:width` and `og:image:height` are written or left out together. A Sanity photo smaller than 1200 by 630 still gets its `og:image` (the CDN does not upscale), just without the two size tags.
- **The sitemap on preview builds**: the step does not read env. It lists the pages without `noindex`; on the dev link every page is `noindex`, the list is empty, and no file is written. Runner up: reading `SITE_NOINDEX` in the integration, outside Astro's typed env.
- **robots.txt**: a prerendered `src/pages/robots.txt.ts` endpoint that reads `SITE_NOINDEX` from `astro:env/server` and `site`. `Disallow: /api/` because the one endpoint takes only POST. Runner up: a static file in `public/`, which cannot drop the `Sitemap` line on the dev link.
- **Twitter tags**: `twitter:card` only; X reads the `og:` tags for the rest. No `twitter:site` until the X account is real. Runner up: the full `twitter:` set, a duplicate of every `og:` value.
- **`www`**: a Single Redirect rule in the `bimdelivery.vn` zone: when the hostname equals `www.bimdelivery.vn`, redirect dynamically to `concat("https://bimdelivery.vn", http.request.uri.path)`, status 301, query string kept. `www.bimdelivery.vn` stays in `wrangler.jsonc`'s `routes`, since the custom domain is what holds its DNS record and certificate; the rule runs before the Worker. Runner up: in the Worker with `run_worker_first`, which runs the Worker on every request.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model** (one collection changes, strict as before; no Sanity change):

`settings` (one entry per language)

| Field | Type | Rule | Feeds |
|---|---|---|---|
| `siteName` | text | required (unchanged) | Organization and WebSite `name`, `og:site_name`, `withSiteName` |
| `legalName` | text | **new**, optional | Organization `legalName` when set |
| `shareImage` | `imageSchema` (local image plus alt) | **new**, required; `../../../assets/images/home/banner-homepage.jpg` (3840 by 2160), alt from the home hero | the fallback share photo |
| `contact.address` | `{ street: text, city: text, country: enum of CALLING_CODES keys }` | **changed** from one string: `72/24 Phan Dang Luu, Duc Nhuan Ward` · `Ho Chi Minh City` · `VN` | `PostalAddress`; `formatAddress` gives the shown line |
| `contact.website` | | **removed** | the footer reads `Astro.site` |
| `contact.email`, `contact.phone` | unchanged | | Organization `email`; `internationalPhone` gives `telephone` and `tel:` |
| `social` | unchanged | | `sameAs` through `sameAsLinks` |

The page collections keep their required `seo` (`title` at most 60, `description` 50 to 160) and gain nothing. `projects` keeps its optional `seo` and its `image` (the cover).

`PageHead` (the head contract, in `src/lib/seo.ts`; not stored):

| Field | Type | Rule |
|---|---|---|
| `title` | string | required |
| `description` | string | required (was optional in `BaseLayout`) |
| `image` | `ShareSource` (a `SanityPhoto`, or `{ src: ImageMetadata \| string; alt }`) | optional; absent means `settings.shareImage` |
| `type` | `'website' \| 'article'` | default `website` |
| `article` | `{ publishedTime: string; modifiedTime?: string }` (`YYYY-MM-DD`) | only with `type: 'article'` |
| `breadcrumbs` | `readonly { name: string; path: string }[]` | optional; at least two items when given |
| `noindex` | boolean | optional; the 404 page only |

**Share photo** (what each route passes as `head.image`):

| Page | Photo |
|---|---|
| `/` | `home.hero.image` |
| `/about-us` | `about.intro.image` |
| `/<service>` | `images[0]` of the service's first section of `type: 'intro'` (a `sanityPhoto`; the schema requires at least one); no `intro` section means `settings.shareImage` |
| `/contact-us` | `contact.photo` |
| `/faq` | `faqPage.hero.image` |
| `/project` | `projectPage.hero.image` |
| `/project/<slug>` | `project.image` (the cover) |
| `/404` | none (no share tags) |

**Routes and interfaces** (static only; no new endpoint at request time):

| Route or function | Kind | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `GET /robots.txt` (`src/pages/robots.txt.ts`) | prerendered endpoint | `SITE_NOINDEX`, `site` | `text/plain` rules (AC-9) | |
| `/sitemap.xml` | file written by the build step | the built pages | one `urlset` (AC-10) | not written when empty |
| `SeoHead.astro` | component | `head: PageHead`, `settings` (from `PageLayout`), `Astro.url`, `Astro.site` | the tags in AC-3, AC-5, AC-7, AC-8, AC-11 | |
| `canonicalPath(pathname)`, `canonicalUrl(pathname, site)` | pure, `src/lib/seo.ts` | a build or dev pathname | `/index.html` and `/` give `/`; `/about-us.html`, `/about-us/`, and `/about-us` give `/about-us`; `/project/x.html` gives `/project/x`; then the absolute address | |
| `withSiteName(title, siteName)` | pure | | `<title> \| <siteName>` | |
| `siteGraph({ settings, site, lang, breadcrumbs? })`, `breadcrumbList(crumbs, site)` | pure | | the `@graph` object | |
| `sameAsLinks(social)`, `internationalPhone(phone, country)`, `formatAddress(address)` | pure | | links with a profile path; `+84968906789`; `street, city` | |
| `shareImageUrl(photo)` | pure, `src/lib/sanity-image.ts` | a `SanityPhoto` | the 1200 by 630 JPEG address | |
| `readPage(html)`, `pathFromFile(relPath)` | pure, `src/build/seo-check.ts` | one page's HTML; `project/x.html` | `PageFacts`; `/project/x` | |
| `pageProblems(facts, path, files)`, `siteProblems(pages)`, `lengthWarnings(facts)` | pure | | lists of `{ file, rule, detail }` | |
| `sitemapXml(pages)` | pure | the indexable pages' facts | the XML text | |
| `seoIntegration()` | `astro:build:done` hook, `src/build/seo-integration.ts` | the client output `dir` | warnings logged; `sitemap.xml` written | throws once, listing every problem |

**Value sourcing**:

| Action | Value | Source |
|---|---|---|
| Head | `<title>`, description | `head.title`, `head.description`: the entry's `seo`; project details `projectHead` (`seo`, else `withSiteName(title, settings.siteName)` and `summary`) |
| Head | canonical, `og:url` | `canonicalUrl(Astro.url.pathname, Astro.site)`; `site` is `https://bimdelivery.vn` (spec 0020) |
| Head | robots `noindex` | `head.noindex` or `SITE_NOINDEX` (`astro:env/server`, spec 0019) |
| Head | `og:image` | `head.image` else `settings.shareImage`; local and Pexels through `getImage` then `new URL(src, Astro.site)`; Sanity through `shareImageUrl` |
| Head | `og:image:alt` | the photo's `alt` |
| Head | `og:image:width`, `og:image:height` | `1200`, `630`; for a Sanity photo only when `photoRect(photo)` is at least 1200 by 630 |
| Head | `og:locale` | `OG_LOCALES[lang]`, `lang` from `resolveLocale(Astro.currentLocale)` |
| Head | `og:site_name` | `settings.siteName` |
| Head | `article:published_time`, `article:modified_time` | `head.article` (blog posts, spec 0021) |
| Site graph | Organization `name`, `legalName`, `email` | `settings.siteName`, `settings.legalName`, `settings.contact.email` |
| Site graph | `telephone` | `internationalPhone(settings.contact.phone, settings.contact.address.country)` |
| Site graph | `address` | `settings.contact.address` mapped to `streetAddress`, `addressLocality`, `addressCountry` |
| Site graph | `logo` | `new URL('/apple-touch-icon.png', site)` |
| Site graph | `sameAs` | `sameAsLinks(settings.social)`: only URLs whose path is not empty or `/` |
| Site graph | `@id`s | `new URL('/#organization', site)`, `new URL('/#website', site)` |
| Site graph | WebSite `inLanguage` | `lang` |
| Breadcrumbs | names, items | `navigation.items` labels for `/` and `/project`, then `project.title`; items through `canonicalUrl` |
| Footer, Contact page, style guide | address line; website line; `tel:` | `formatAddress(contact.address)`; `Astro.site` shown without `https://` (footer only); `telHref(contact.phone, contact.address.country)` |
| robots.txt | `Sitemap` line | `new URL('/sitemap.xml', site)`, left out when `SITE_NOINDEX` |
| Sitemap | `<loc>`, `<lastmod>` | each page's canonical as read; `article:modified_time` else `article:published_time` |
| Build check | the expected canonical | `site` from the integration's `astro:config:done` hook plus `pathFromFile(file)` |
| Build check | the 404 page | the file `404.html` |

**Key invariants**:
- One address per page: canonical, `og:url`, sitemap `<loc>`, and every internal link agree, with no trailing slash and no `www`. The build step proves the first three for every page; it fails when a canonical differs from `site` plus `pathFromFile`.
- Code that reads `Astro.url.pathname` goes through `canonicalPath`; at build it ends in `.html`.
- The site graph and every page's JSON-LD go through `jsonLdScript`, so `<` is always `<`.
- A share image is always a JPEG, absolute, `https`, and 1200 by 630 when it states its size.
- `sameAs` never holds a bare network homepage.
- The 404 page is the only page with its own `noindex`, and it has no canonical. A `SITE_NOINDEX` page keeps its production canonical.
- `/styleguide` never builds, so the step never sees it.
- Removing or renaming a page route adds its 301 to `redirects` in the same change.

**Security model**: public, read only marketing pages; nothing to sign in to. The data written into the head (company name, address, email, phone) is already shown in the footer. The one injection surface is JSON-LD built from content, closed by `jsonLdScript`; attribute values are escaped by Astro. Preview builds with drafts stay `noindex` and publish no sitemap. The build step reads only `dist/client/` and writes one file there.

**Configuration required**: no env var or secret. `site` and `redirects` stay in `astro.config.mjs`; `SITE_NOINDEX` is reused. Outside the repo, recorded here because nothing else records them:
- Cloudflare, zone `bimdelivery.vn`: the `www` Single Redirect rule (see *Calls made*); managed robots.txt switched off (AI Crawl Control, robots.txt); "Block AI bots" confirmed off.
- Cloudflare DNS: the Search Console TXT record.
- Google Search Console: a Domain property owned by the client's company Google account, the developer a full user, the sitemap submitted. Bing Webmaster Tools: imported from Search Console, the sitemap submitted.

**What spec 0021 gets** (its contract, answered):
- The head API is `PageLayout`'s `head: PageHead`. `postHead` returns `{ title, description, image: post.cover, type: 'article', article: { publishedTime, modifiedTime }, breadcrumbs }`: the cover photo, not an address, since `SeoHead` calls `shareImageUrl` itself. The canonical is worked out from the route, so `/blog/page/<n>` gets its own.
- The title pattern is `withSiteName(title, siteName)`.
- Every prerendered public page joins the sitemap with no blog code; `lastmod` comes from `article:modified_time`, else `article:published_time`.
- `robots.txt` allows `/blog`.
- The Organization `@id` is `https://bimdelivery.vn/#organization`, present on every page, so `BlogPosting`'s `author` and `publisher` are `{ "@id": "https://bimdelivery.vn/#organization" }`.
- Breadcrumbs: posts pass Home, Blog, the post title; `/blog` and its pages pass none.
- `shareImageUrl` is built by this spec; spec 0021's step 3.1 reuses it.

**Critical test scenarios**:
- Happy path: build, then read `dist/client/project/<slug>.html`: one canonical without a slash, the cover as a 1200 by 630 JPEG on `cdn.sanity.io`, the graph with Organization, WebSite, and the three crumbs; the Rich Results Test passes it. Verifies **AC-3**, **AC-5**, **AC-7**, **AC-8**
- Addresses: live, `curl -I` on `/about-us` (200), `/about-us/` (redirect to `/about-us`), `https://www.bimdelivery.vn/faq?x=1` (301 to `https://bimdelivery.vn/faq?x=1`), `/faq/japan` (301 to `/faq`). Verifies **AC-1**, **AC-2**, **AC-16**
- Duplicate guard: give `/contact-us` the home page's title, build: it fails naming both files and the rule; put it back. Do the same with a heading jump (an `h4` straight under an `h2`) and a removed description. Verifies **AC-4**, **AC-12**, **AC-13**
- Warning only: a project title that makes its derived title 70 characters builds, with one warning. Verifies **AC-13**
- Preview build: `SITE_NOINDEX=true pnpm build`: every page `noindex`, no `sitemap.xml`, `robots.txt` with no `Sitemap` line, the check still passes. Verifies **AC-9**, **AC-10**, **AC-11**
- Share cards: the four pages in Facebook's Sharing Debugger, LinkedIn's Post Inspector, and a Zalo chat. Verifies **AC-6**
- Crawlers: `curl https://bimdelivery.vn/robots.txt` matches the repo file byte for byte; `sitemap.xml` validates and lists no 404; Search Console reads it. Verifies **AC-9**, **AC-10**, **AC-15**
- Shell: the footer shows the joined address, `bimdelivery.vn`, and `tel:+84968906789`; the header marks `/about-us` as current. Verifies **AC-1**, **AC-14**

## Build plan

Skateboard: first every page findable at one address with a basic card (a usable whole on day one), then each card looks like its page, then the company's facts for machines, then the guard that keeps it all true.

**1. One address and a head on every page**
1. In `astro.config.mjs` set `build.format: 'file'` and `trailingSlash: 'never'`, and add the redirect rule comment beside `redirects`. Add `canonicalPath`, `canonicalUrl`, and `withSiteName` to `src/lib/seo.ts`; make the header compare `canonicalPath(currentPath)`. Build and confirm one HTML file per route under the new names and no `/styleguide`; if `faq/index.astro` still builds to `faq/index.html`, rename it `src/pages/faq.astro`. Confirm `dist/client/_redirects` still holds the five FAQ 301s. Then serve the build with `wrangler dev` (check the port is free first, and stop it before the next `pnpm build`) and `curl -I` `/about-us` (200), `/about-us/` (a redirect to `/about-us`), and `/faq/japan` and `/faq/japan/` (each ending in a 301 to `/faq`). The dev server answers `/about-us/` with a 404 under `trailingSlash: 'never'`; that is expected, so test the slash redirect only on a build. Satisfies **AC-1**, **AC-16**, **AC-17**
2. Add `PageHead`, `settings.shareImage` (schema and YAML), `OG_LOCALES`, and `SeoHead.astro` with the canonical, the robots tag (moved from `BaseLayout`), and the share tags using `settings.shareImage`; give `PageLayout` the `head` prop and pass it from every route; `noindex` on the 404 page; `projectHead` through `withSiteName`. Satisfies **AC-3**, **AC-5**, **AC-11**
3. Add `src/pages/robots.txt.ts`, and `src/build/seo-check.ts` with `readPage`, `pathFromFile`, and `sitemapXml`, and `src/build/seo-integration.ts` writing the sitemap only; register it in `astro.config.mjs`. Confirm the hook's `dir` is `dist/client/` (where the pages land with the Cloudflare adapter), not `dist/`. Satisfies **AC-9**, **AC-10**
4. Deploy. In Cloudflare add the `www` redirect rule, switch off managed robots.txt, confirm "Block AI bots" is off; set up Search Console (with the client's account) and Bing, and submit the sitemap. Write the date each was done and the Search Console owner under *Configuration required* in this spec, the only record of these settings. Satisfies **AC-2**, **AC-9**, **AC-15**

**2. Each card looks like its page**
1. Add `shareImageUrl` to `src/lib/sanity-image.ts` (check on a real cover whether the CDN reads `fp-x` and `fp-y` against the original or the `rect`, and use `photoPosition`'s math if the latter); resolve `head.image` in `SeoHead` through `getImage` or `shareImageUrl`, with the size rule; pass each route's photo from the *Share photo* table. Read one local card file's header from `dist/client/_astro/` (for example with `file`) and confirm it is a 1200 by 630 JPEG, then look at it to confirm `fit: 'cover'` cropped rather than squashed. Satisfies **AC-5**
2. Deploy and test the four pages in Facebook, LinkedIn, and Zalo; if a hero's subject is cut, move that page's `position`. Satisfies **AC-6**

**3. The company's facts for machines**
1. Change `settings`: split `contact.address`, drop `contact.website`, add `legalName`; add `CALLING_CODES`, `internationalPhone`, `formatAddress`, and `sameAsLinks`; give `telHref` the country. Every reader changes in the same pass, with `pnpm check` as the gate: the `settings` schema in `src/content.config.ts` and `src/content/settings/en/site.yaml`; `Footer.astro` (its address line, its website lines read from `Astro.site`, its own `telHref` deleted for the shared one); `src/pages/contact-us.astro` (the card's `details.address` through `formatAddress`, and its `telHref` call); `FormBand.astro` (its `telHref` call); `src/dev/styleguide.astro` (its `telHref` call and address). `getContactPage` passes `settings.contact` through unchanged. Satisfies **AC-14**
2. Add `siteGraph` and `breadcrumbList`; write the site graph from `SeoHead`; pass `breadcrumbs` from `project/[slug].astro` with the navigation labels and the gate check for the two hrefs; run the Rich Results Test and the Schema.org validator on the home page, a project detail, and `/faq`. Satisfies **AC-7**, **AC-8**

**4. Guard it**
1. Add `pageProblems`, `siteProblems`, and `lengthWarnings`. First run them over a real build as warnings only and read the list: every page should pass today, so any problem is a scanner bug or a real defect to fix first. Then make the integration throw one error listing every problem, with the GitHub annotations. Run the three failing drills and the warning drill from *Critical test scenarios*. Satisfies **AC-4**, **AC-12**, **AC-13**
2. Run `pnpm check`, `pnpm lint`, `pnpm build`, and a `SITE_NOINDEX` build; record `settings`' new fields in `src/content/README.md`. Satisfies **AC-11**, **AC-17**

## Consequences

**Positive**:
- One address per page, so links and ranking signals stop splitting across four forms, and nav links stop paying a redirect.
- A shared link shows its own page, which matters for a business that sells through LinkedIn and chat.
- The build refuses a page that would hurt search, including one an editor publishes from Sanity, and spec 0021's blog gets canonicals, cards, and the sitemap with no blog specific SEO code.
- No new dependency, no request time code, no client JavaScript.

**Negative / tradeoffs**:
- Three settings live in the Cloudflare dashboard and two in Google and Bing, outside git. This spec is their only record; a zone rebuilt from scratch must redo them by hand.
- Old slashed addresses answer 307 (temporary), not 301; Google may keep them a few weeks before the canonical wins.
- A duplicate title from a Sanity publish fails the production build: the editor sees no change and must ask the developer or read the GitHub run (its summary page names the clash). Until the title is fixed in the Studio, every later publish fails too. The Studio does not check title uniqueness yet.
- The scanner trusts our own markup. A component that writes a heading inside a string, or a `<title>` in an inline SVG, could fool it; tag changes in `SeoHead` must keep `readPage` in step.
- Under `build.format: 'file'`, `Astro.url.pathname` ends in `.html` at build but not in dev, a trap for any future code that reads it raw.
- Every route's call to `PageLayout` changes in one pass, and `Footer.astro` and `Header.astro` both change. Both have uncommitted edits in the main checkout today, so the build should start after those land.
- The marketing pages carry no `lastmod`, so search engines judge their freshness by recrawling.
- About 1 KB of JSON-LD on every page, and eight 1200 by 630 JPEGs in the build output.

**Neutral**:
- The footer address now reads "Ho Chi Minh City" in full, and the phone links dial `+84`.
- Pexels photos used as share images are copied to this site's origin at build, as `Photo.astro` already does for display.
- `dist/client/` file names change (`about-us.html` in place of `about-us/index.html`); the deploy needs no change.
- Spec 0004's trailing slash note (its `verify.md`), spec 0013's removed page mechanism, and spec 0020's address follow up are settled here; specs 0014's `ItemList` and 0015's `CreativeWork` are declined (no rich result for either).

## Follow-up

- [ ] Revise spec 0021 to this head API before its step 3: `postHead` returns a photo (`image: post.cover`) and `article` times, its breadcrumbs are Home, Blog, the title, `BlogPosting` points at `https://bimdelivery.vn/#organization`, and step 3.1 reuses `shareImageUrl`.
- [ ] Redirects for renamed or deleted project and post slugs: their own spec (an old slugs field in the Studio, written into the redirects at build), before the SEO team renames its first published post.
- [ ] A title uniqueness rule in the Studio for posts and projects, so a duplicate is refused at publish rather than at build. If a duplicate ever blocks publishing before that exists, consider letting the manual `lenient` run (spec 0019) turn duplicates on Sanity pages into warnings.
- [ ] Fill `settings.legalName` once the registered name is confirmed, and paste the real social profiles; both reach the JSON-LD with no code change.
- [ ] Optionally a designed 1200 by 630 brand card: swap `settings.shareImage`.
- [ ] With the second language: `hreflang` links, `og:locale:alternate`, and one `OG_LOCALES` entry per language.
- [ ] Specs 0004, 0013, 0014, 0015, and 0020 point at decisions this spec settles; `/sync` can flag their open items as settled.
