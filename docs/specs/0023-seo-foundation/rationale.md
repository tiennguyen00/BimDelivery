# 0023. Rationale: SEO foundation

## Context

The site is a prerendered Astro site on Cloudflare Workers (spec 0001), live at `bimdelivery.vn` since 2026-10-26. Its pages are built from content collections (spec 0002) and, for projects, from Sanity at build (spec 0019), where a publish starts a production build. Every page entry already carries a required `seo` title and description, and `site` is set in `astro.config.mjs`. Nothing else a search engine or a chat app reads is there yet.

What the live site showed on 2026-11-27:
- Every page exists at four addresses. `/about-us` answers 307 to `/about-us/` (Cloudflare serves folder pages with a slash), so every nav link pays a temporary redirect, and `www.bimdelivery.vn` answers 200 with the same pages.
- No canonical tag, no Open Graph tags, no Organization data. `/faq` alone carries JSON-LD (its `FAQPage`).
- `/sitemap.xml` is 404. `/robots.txt` is Cloudflare's managed file: comments about content signals, no rules.
- Headings are already in order on every built page (one `h1`, no skipped level), but nothing keeps them so.

Forces:
- The URLs (`/architectural-bim`, `/interior-bim`) say little on their own, so titles, descriptions, and headings carry the search weight.
- Spec 0021 (the blog) is designed and waits on this feature; it listed what it needs as a contract and should change only two functions if this spec differs.
- Older specs left decisions here: the trailing slash (0004), the real host (0020), removed page redirects (0013), project structured data (0014, 0015).
- A publish in Sanity builds production with no developer watching, so a check that lives only in a person's head will be skipped.
- The project rules: zero JavaScript by default, pure functions at the core, side effects at the edges, few dependencies, every route an HTML file.
- One developer's time; anything outside the repo (dashboard settings, Search Console) is easy to lose.

## Options considered

### Option 1: our own head component and our own build step (chosen)

`SeoHead.astro` writes every tag from pure helpers in `src/lib/seo.ts`; a small `astro:build:done` integration reads every built page, checks it, and writes the sitemap from what it read. `robots.txt` is a prerendered endpoint.

**Pros**:
- The check sees what search engines see, the finished HTML, so derived titles and future blog posts are covered with no extra code.
- The sitemap is written from each page's own canonical, so the two can never disagree, and `lastmod` comes free from the article tags.
- No dependency; every helper is a pure function, testable in isolation.

**Cons**:
- About 250 lines of our own code to own, including a regex scanner tied to our markup.
- We write the sitemap format ourselves (simple, but ours to get right).

### Option 2: community packages

`astro-seo` (a head tag component), `@astrojs/sitemap` (the official sitemap integration), and `astro-robots-txt`.

**Pros**:
- Known packages, less code of our own; `@astrojs/sitemap` handles large sites and sitemap indexes.

**Cons**:
- Three dependencies for tags we can write in one component; `astro-seo` and `astro-robots-txt` are maintained by individuals.
- The sitemap lists routes, not canonicals, and `lastmod` needs a hand kept mapping in `astro.config.mjs`, which cannot read content collections.
- Nothing checks uniqueness or headings; that still needs a step of our own.

### Option 3: head tags only, and check by hand

Add the canonical and share tags to `BaseLayout`, `@astrojs/sitemap`, a static `robots.txt`, and rely on `/check verify` for the rest.

**Pros**:
- The least code; ships in an afternoon.

**Cons**:
- A duplicate title, a missing description, or a heading jump ships silently, including from a Sanity publish.
- A static `robots.txt` cannot drop the `Sitemap` line on the dev link.

## Rationale

The deciding force is that production builds start from a Sanity publish with no developer in the loop, and spec 0021 adds a whole team of SEO editors to that path. A guard has to run inside the build, and the only place that sees every page as search engines will, derived titles included, is the built HTML. Once a step reads every built page, writing the sitemap from the same facts costs a few lines and removes the classic mismatch between the sitemap and the canonicals; that is why Option 1 beats Option 2's official sitemap, which would still leave the check to write. Option 3 is cheaper today and fails exactly where the risk is.

The finer calls follow the same forces:
- **No trailing slash** (`build.format: 'file'`): every link in content and code, and spec 0021's addresses, already have no slash, so this changes one config line instead of every href. The price is the `.html` pathname at build, handled once in `canonicalPath`. Trailing slashes everywhere would match what Google crawled for one month, at the cost of rewriting every link, Sanity links included.
- **`www` by a Redirect Rule**: static files are served before the Worker runs, so the Worker cannot see `www` requests without `run_worker_first`, which bills a Worker run per request. One zone rule is free and permanent; the cost is that it lives outside git, so the spec records it.
- **Share photos per page**: the pages already have strong photos, and a link that looks like its page earns the click. Generated cards (satori) would add two dependencies and fonts for a look the photos already give.
- **Every crawler allowed**: the site's job is to be found, and AI answer engines are where buyers increasingly ask for a BIM partner. Marketing copy loses nothing by being learned.
- **Organization on every page**: spec 0021's `BlogPosting` and the breadcrumbs point at its `@id`, and Google connects `@id` links reliably only within a page. About 1 KB per page buys that.
- **Breadcrumbs only, no Service, CreativeWork, or ItemList**: breadcrumbs show in desktop results; the other three earn no rich result in Google and would be upkeep.
- **Fail on structure, warn on length**: a missing or duplicate tag is a real defect; a long derived title is merely trimmed by Google, and failing on it would break publishes for projects that are fine today.
- **Cloudflare's 307 for old slashed addresses**: canonical, sitemap, and links all name the new form, so Google moves within weeks; per page 301s would grow with every post toward Cloudflare's 2,000 rule cap.
- **Search Console owned by the client**: the business keeps its search data if developers change.
