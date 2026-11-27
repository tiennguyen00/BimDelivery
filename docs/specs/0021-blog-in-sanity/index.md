# 0021. A blog the SEO team runs in Sanity

**Date**: 2026-11-26
**Status**: Proposed
**Scope feature**: 20, SEO blog (`docs/scope/scope.md`)
**Depends on**: feature 11, SEO foundation (no spec yet). Build this after feature 11 is done; *What this needs from feature 11* below is the contract.
**Amends**: [0019](../0019-sanity-editing-layer/index.md) (a second document type in the Studio, `post` in the webhook filter, Preview on site for posts, one Sanity loader shared by two collections, the dataset backup it owed) · [0002](../0002-content-model/index.md) (a `posts` collection and a `blogPage` collection, `blog` joins the reserved paths, `navigation.legal` becomes `navigation.footerLinks`)

## Summary

The SEO team writes, edits, and deletes blog posts in the Sanity Studio the client already uses, so no admin page is built. The site gets a `/blog` list and one prerendered page per post at `/blog/<slug>`, read from Sanity at build and checked by Zod (the schema library the build already uses), through the same loader as projects; only the rich text body and its renderer are new code. Publish rebuilds the live site in a few minutes. It ships after feature 11, which gives every page canonical addresses, share cards, and a sitemap; this spec adds only what is specific to posts.

## Requirements

**User stories**:
- As an SEO editor, I want to write a post with headings, lists, links, and images, set its address, search title, and description, and publish it myself, so content ships without a developer.
- As an SEO editor, I want to preview a draft on the dev link before it goes live.
- As an SEO editor, I want to fix, unpublish, or delete a post and have the live site follow.
- As a visitor, I want a readable list of posts, newest first, and posts that load fast on a phone.
- As a search engine, I want each post to carry a clean title, description, canonical address, share image, dates, and article data.
- As the developer, I want a bad post to fail the build by name and leave the live site as it was, and the content backed up before several more people can delete it.

**Acceptance criteria**:
- **AC-1**: A GitHub Actions workflow exports the `production` dataset's published documents (no drafts, no uploaded files) every night and after every finished production deploy, and keeps each file as a workflow artifact for 90 days. It can also be started by hand. It has run green at least once before any SEO editor is invited.
- **AC-2**: Each SEO editor is invited to the Sanity project as an Administrator (the free plan's only editing role) and signs in with Google or email. Their emails join the Cloudflare Access policy on the dev link. Total members stay within the free plan's 20 seats.
- **AC-3**: The Studio lists "Blog posts" beside "Projects", newest `publishedAt` first. An editor can create, edit, publish, unpublish, and delete a post. "New document" offers Blog post and still hides `previewRequest`.
- **AC-4**: Every field of the `post` data model is editable, each with its description. The Studio refuses to publish a post that breaks any rule the build checks: an empty title or one over 100 characters; a slug that is empty, not lowercase kebab case, over 96 characters, `page`, or already used by another post in the same language; an excerpt outside 50 to 160 characters; no cover or a photo with empty alt text; no `publishedAt`, or one after today; an `updatedAt` before `publishedAt` or after today; an SEO title over 60 characters, an SEO description outside 50 to 160, or one of the two without the other; an empty body; an `h3` before the body's first `h2`; a list nested deeper than two levels; a link address that is not `https://`, `http://`, `mailto:`, or a path starting with `/`; a body image with no photo or empty alt text; a caption over 200 characters.
- **AC-5**: Publishing, unpublishing, or deleting a post starts one production build, and bimdelivery.vn follows with no developer step. Saving or autosaving a draft starts no build.
- **AC-6**: "Preview on site" on a post starts the preview build, and its toast links `<dev link>/blog/<slug>` (or `<dev link>/blog` when the post has no slug yet) and says that a draft breaking the Studio's rules will not appear. A post draft that breaks the rules shows its published version instead, or is left out when it has none, with a named warning in the build log.
- **AC-7**: A published post that fails the site's Zod schema fails the production build with a message naming the post (`<lang>/<slug>` and its Sanity `_id`) and the field; nothing deploys and the live site keeps its previous version. A manual lenient run deploys anyway, leaving that post out with a warning. Two posts sharing one `<lang>/<slug>` fail the build naming both `_id`s.
- **AC-8**: `/blog` shows its `h1`, its intro, then post cards, newest `publishedAt` first (ties broken by Sanity `_id`), at most 12 per page. Each card shows the cover, the published date, the title as an `h2`, and the excerpt, and the whole card is one link to `/blog/<slug>`. One column on a phone, two on a tablet, three from `lg`. At 390px there is no sideways page scroll.
- **AC-9**: With more than 12 posts, `/blog/page/2`, `/blog/page/3`, and so on each show the next 12. Page 1 lives only at `/blog`; `/blog/page/1` is not built. A labelled pagination nav on every list page links the previous and next pages and reads "Page 2 of 3"; the current page is not a link. With 12 posts or fewer there is no pagination nav and no `/blog/page/*` route. No page carries `rel="prev"` or `rel="next"` links.
- **AC-10**: With no published posts, `/blog` still prerenders with its `h1`, intro, and the empty message from content, and no cards or pagination.
- **AC-11**: A post page shows, from the top: a link back to `/blog` ("All posts"), the title as the `h1`, the published date and, when set, the updated date (each a `<time datetime="YYYY-MM-DD">`), the cover photo (loaded eagerly at high priority), the body, then the closing call to action band. The body renders paragraphs, `h2` and `h3` headings, bullet and numbered lists two levels deep, bold, italic, links, and images as `<figure>` with an optional `<figcaption>`. Body text sits in a column of about 65 to 75 characters per line.
- **AC-12**: Body links open in the same tab. A link with `nofollow` ticked carries `rel="nofollow"`; every other link carries no `rel`.
- **AC-13**: Every cover and body photo follows spec 0019's photo rules (its AC-7): an `<img>` on `cdn.sanity.io` with a `srcset`, `auto=format`, `width` and `height` set, the editor's crop, and the focal point as `object-position`. Body photos and card covers load lazily, except the first card's cover on page 1, which loads eagerly at high priority.
- **AC-14**: Each post's `<head>` holds: the `<title>` (`seo.title` when set, else feature 11's title pattern applied to `title`); the meta description (`seo.description` when set, else `excerpt`); the canonical address `https://bimdelivery.vn/blog/<slug>`; Open Graph tags with `og:type` `article`, `og:image` the cover cut to 1200 by 630 around its focal point, `article:published_time`, and `article:modified_time` when `updatedAt` is set. `/blog` and each `/blog/page/<n>` take their title and description from `blogPage.seo` (page `n` adds its number to the title) and a canonical address of their own.
- **AC-15**: Each post's `<head>` holds one `BlogPosting` JSON-LD (the machine readable summary search engines read) with `headline` (the title), `description` (as the meta description), `image` (the 1200 by 630 address), `datePublished`, `dateModified` (`updatedAt`, else `publishedAt`), `inLanguage`, `mainEntityOfPage` (the canonical address), and `author` and `publisher` both the company: feature 11's Organization `@id` when it defines one, else an inline `Organization` with the site name and `https://bimdelivery.vn`. It parses as JSON and shows no errors in Google's Rich Results Test and the Schema.org validator. Every `<` in the JSON is written as `\u003c`.
- **AC-16**: `/blog`, every `/blog/page/<n>`, and every `/blog/<slug>` appear in feature 11's sitemap, each post with `lastmod` set to `updatedAt`, else `publishedAt`, when that sitemap carries `lastmod`. A post unpublished or deleted leaves the sitemap at the next build.
- **AC-17**: Every page's footer shows a "Blog" link to `/blog` in its bottom row, from `navigation.footerLinks`. The header nav is unchanged.
- **AC-18**: A service whose slug is `blog` fails the build (reserved path). A post slug `page` fails the build.
- **AC-19**: Every blog page prerenders: `dist/client/blog/index.html`, one `dist/client/blog/<slug>/index.html` per post, and `dist/client/blog/page/<n>/index.html` per extra page. No blog page has an `astro-island` or a new script. `pnpm check`, `pnpm lint`, and `pnpm build` pass. Projects build and render exactly as before on the shared loader.
- **AC-20**: Every word on the blog pages other than the posts' own comes from the `blogPage` entry. The list's heading block and the post's header block play the CSS `entrance` on load, and the cards rise with the scroll reveal stagger; under reduced motion nothing moves; no new animation code. Accessibility: one `h1` per page before any `h2`; a card's link is named by its title; the pagination nav has its own label and marks the current page with `aria-current="page"`; every control shows the focus ring.
- **AC-21**: `docs/design.md` and `/styleguide` record the post card, the post body styles, and the pagination nav, each with its contrast pairs.

## Decision

**Chosen option**: Option 1, posts as a second Sanity document type, rendered by prerendered Astro pages (see [rationale.md](rationale.md)).

The SEO team works in the existing Studio. The site reads published posts at build through a `posts` content collection on the same Sanity loader projects use, checks them with Zod, renders the body with `astro-portabletext`, and draws photos with the existing `Photo.astro`. Publish deploys through spec 0019's webhook, relay Worker, and GitHub Actions pipeline, unchanged apart from the webhook's filter.

**Implementation skills**: `sanity-best-practices` (`sanity-io/agent-toolkit`, `.claude/skills/sanity-best-practices/`) · `content-modeling-best-practices` (`sanity-io/agent-toolkit`, `.claude/skills/content-modeling-best-practices/`) · `portable-text-serialization` (`sanity-io/agent-toolkit`, `.claude/skills/portable-text-serialization/`, its `rules/astro.md`) · `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `pnpm` (`antfu/skills`, `.agents/skills/pnpm/`)

**Engineer's choices (2026-11-26)**: the existing Studio, no admin page of its own; several SEO editors as Administrators on the free plan, with a nightly backup first; no scheduled publishing; simple first, so no authors, categories, or tags; headings, lists, and images in the body; built from `docs/design.md` and the current UI; a footer link only; feature 11 ships first.

**Calls made in the design (each with its runner up):**
- **One shared loader**: the projects loader's generic part (perspectives, strict and lenient, the preview fallback, the duplicate check, the store clear) moves into `sanityLoader({ collection, query, toData, orderKey })` in `src/lib/sanity-loader.ts`, used by `projects` and `posts`. Its messages name the collection instead of saying "projects". Runner up: a copy of the loader for posts, about 120 lines that would drift apart.
- **The body stays Portable Text** (Sanity's rich text format, a list of blocks) all the way to the page, kept with its `_type` and `_key`, and rendered by `astro-portabletext` (the renderer the Portable Text skill names for Astro) with one small Astro component per element. Runner up: converting it to HTML or Markdown strings in the loader, which loses the image blocks and needs a sanitiser.
- **Body styles**: classes per element in those components, built from the `design.md` tokens. Runner up: `@tailwindcss/typography`, a new dependency whose defaults fight the dark theme.
- **Pagination**: a pure `blogPages(posts, perPage)` helper in `src/lib/blog.ts` returns each page's posts, number, total, and previous and next addresses. `/blog` takes page 1; `src/pages/blog/page/[page].astro` builds pages 2 onward. `page` is a reserved post slug, so `/blog/page` never collides with a post. Runner up: Astro's `paginate()`, which always builds a page 1 route of its own.
- **Dates**: `publishedAt` and `updatedAt` are plain dates (`YYYY-MM-DD`), with no time and no time zone. They are shown with `Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' })`, so a date never moves by a day. `updatedAt` is set by hand for a real content change, never Sanity's `_updatedAt`, which changes on every typo fix. Runner up: date and time fields, which bring time zones into a list that needs only a day.
- **Share image**: a new pure `shareImageUrl(photo)` in `src/lib/sanity-image.ts` asks the CDN for the editor's crop (`rect`), then `w=1200&h=630&fit=crop&crop=focalpoint` with the focal point as `fp-x` and `fp-y`, `fm=jpg` (some share scrapers still refuse WebP), and `q=80`. Check on a real photo whether the CDN reads `fp-x` and `fp-y` against the original or the `rect`, and use `photoPosition`'s math if it is the latter. Runner up: a separate share image field, one more thing for editors to fill.
- **Footer link**: `navigation.legal` (unused so far) becomes `navigation.footerLinks`, "footer only links: the blog, later the privacy page", drawn in the footer's bottom row as today. Runner up: a second list beside `legal`, two rows for two links.
- **Page copy**: `blogPage` is YAML in `src/content/blogPage/`, like every page outside projects; it moves to Sanity with the other pages in a later slice of spec 0019. Runner up: a Sanity singleton now, which lets the SEO team edit the `/blog` intro but adds a third Studio type for one paragraph.
- **Rules in one place**: the limits live in `src/lib/post-fields.ts` (plain values, no Astro import), read by the Zod schema and by the Studio, as `project-fields.ts` does. The excerpt reuses `SEO_DESCRIPTION_MIN` and `SEO_DESCRIPTION_MAX`, so it is always a valid fallback description.
- **Backup**: `.github/workflows/backup.yml` runs `sanity dataset export production --no-drafts --no-assets` with the existing Viewer token, on a nightly schedule and on `workflow_run` after every finished `Deploy` run. GitHub turns off a public repository's scheduled workflows after 60 days with no commits, and a content only stretch can last that long; the `workflow_run` trigger keeps backups coming whenever content changes, and a failed run emails the developer. Drafts are left out because a public repository's artifacts are downloadable by any signed in GitHub user. Uploaded files are left out because the renders are large and stay in Sanity unless someone deletes them in the Media tool; a file deleted there is not recoverable (Consequences). Runner up: a private R2 bucket (Cloudflare's file storage), which keeps drafts and files too but adds a bucket, a token, and a retention rule.
- **The shared loader's order key**: `orderKey` is `(doc) => string`. Projects keep `orderRank` then `_id`; posts use `publishedAt` then `_id`. In the loader it only decides which of two duplicates is kept; `getPosts` does the real sort.
- **Placeholders**: one pure `fill(template, values)` in `src/lib/blog.ts` (the pattern of the FAQ's `countLine`) fills `{title}`, `{page}`, and `{total}`; the `blogPage` schema refuses a `pageTitle` or `status` without its placeholders, so a typo never ships a literal `{page}`.
- **Head**: a pure `postHead(post, settings, site)` and `listHead(blogPage, page, site)` in `src/lib/blog.ts` return exactly the props feature 11's head API takes, so if feature 11 lands differently only these two functions change.
- **Studio list**: Blog posts is a plain document list sorted by `publishedAt` descending. Projects stay an orderable list.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model** (no relationship to other documents in this slice):

`post` (one Sanity document per post)

| Field | Type | Rule |
|---|---|---|
| `_id` | Sanity id | primary key, Sanity's own (never a dot) |
| `lang` | string | required, one of `LOCALES`; `initialValue` `DEFAULT_LOCALE` (`en`), read only while there is one locale |
| `title` | string | required, at most 100 characters (`POST_TITLE_MAX`); the `h1`, the card, the JSON-LD `headline` |
| `slug` | slug | required, from the title, lowercase kebab case (`SLUG_PATTERN`), at most 96 characters, not in `RESERVED_POST_SLUGS` (`['page']`, `post-fields.ts`, checked by the Studio and Zod), unique per `lang` (a custom `isUnique`, as projects have). Its description warns that changing it after publishing breaks the old address until redirects exist |
| `excerpt` | text | required, 50 to 160 characters; the card's text and the default meta description |
| `cover` | `photo` | required; the card, the post header, the share image, the JSON-LD `image` |
| `publishedAt` | date | required, `initialValue` today in the editor's own time zone; not after today, checked by the Studio only (the build runs on UTC and editors on UTC+7, so a build check would fail posts published before 07:00 in Vietnam) |
| `updatedAt` | date | optional, not before `publishedAt` (Studio and build), not after today (Studio only); "set this only when you change what the post says" |
| `seo` | `seo` | optional, the existing type (title at most 60, description 50 to 160, both or neither) |
| `body` | `postBody` | required and not empty (see `bodyProblems` below) |

`postBody`: an array of `block` and `bodyImage`.
- `block` (Portable Text): styles `normal`, `h2`, `h3` (no `h1`, which is the title); lists `bullet` and `number`, level 1 or 2; decorators `strong` and `em`; one annotation, `link` = `{ href: string, required, https:// or http:// or mailto: or a path starting with /; nofollow: boolean, optional }`.
- `bodyImage`: the `photo` type's fields (an image with hotspot, required `alt`, the public upload notice) plus `caption`, an optional string of at most 200 characters.
- Whole body rules live in one pure function, `bodyProblems(body)` in `post-fields.ts`, called by the Studio's custom validation on the `body` field and by Zod's `superRefine`, so the two can never disagree. It returns a message, naming the block's position, for: an empty body (no block with text that is not blank, and no image); an `h3` before the first `h2`; a list item above level 2; a span mark that is not `strong`, `em`, or the `_key` of one of its block's mark definitions.

The site's Zod shape for a post (strict at every level): `sanityId`, `lang`, `slug` (also not in `RESERVED_POST_SLUGS`), `title`, `excerpt`, `cover` (spec 0019's `sanityPhoto`), `publishedAt` and `updatedAt?` (`YYYY-MM-DD` and a real calendar date, so `2026-02-31` fails; never compared with today), `seo?`, and `body`. `body` is an array of a union: a block `{ _type: 'block', _key, style, listItem?, level?, markDefs, children }` whose mark definitions are `{ _type: 'link', _key, href, nofollow? }` and whose spans are `{ _type: 'span', _key, text, marks }`; or an image `{ _type: 'bodyImage', _key, photo: sanityPhoto, caption? }`. Refinements run `bodyProblems` and check that `updatedAt` is not before `publishedAt`. The collection entry id is `<lang>/<slug>`, from `entryIdOf`; a post missing either is named by its `_id` alone, as projects are.

**Query and mapping** (`src/lib/sanity.ts`). `POSTS_QUERY` returns only what the strict shape allows, reusing the projects query's `PHOTO` projection; check the `@` form against a real post at build:

```groq
*[_type == "post"]{
  _id, lang, "slug": slug.current, title, excerpt, publishedAt, updatedAt,
  seo{ title, description },
  "cover": cover{ ${PHOTO} },
  body[]{
    _type, _key,
    _type == "block" => {
      style, listItem, level,
      markDefs[]{ _type, _key, href, nofollow },
      children[]{ _type, _key, text, marks }
    },
    _type == "bodyImage" => { caption, "photo": @{ ${PHOTO} } }
  }
}
```

`toPostData` builds a new object per document and never throws. GROQ returns `null` for every unset field, at every depth, so it drops `null` values in each body item, mark definition, and span (a deep version of today's shallow `compact`). It turns each body image's `photo` through the existing `toPhoto` (which adds `source: 'sanity'`), and keeps `_type` and `_key` everywhere in the body, because `astro-portabletext` picks each element's component by `_type`. Anything it does not recognise is passed through untouched for Zod to name.

`blogPage` (YAML, one entry per language, `src/content/blogPage/en/blog.yaml`, strict, `lang` required):

| Field | Type | Notes |
|---|---|---|
| `seo` | `{ title, description }` | `/blog` and its pages |
| `heading` | text | the list's `h1` |
| `intro` | emphasisText | under the `h1` |
| `empty` | text | shown when there are no posts |
| `pageTitle` | text with `{title}` and `{page}` | page 2 onward, "{title}, page {page}" |
| `pagination` | `{ navLabel, previous, next, status }` | `status` is "Page {page} of {total}" |
| `post` | `{ backLink, published, updated }` | "All posts", "Published", "Updated" |
| `cta` | callToAction | the closing band on every blog page |

`navigation`: `legal` is renamed `footerLinks`; `src/content/navigation/en/main.yaml` gains `footerLinks: [{ label: Blog, href: /blog }]`.

**State transitions** (Sanity's own, per post, as in spec 0019): no document, then draft (first edit), then published (Publish). Published, then draft plus published (edits pending), then published again. Published, then draft only (Unpublish). Any state, then gone (Delete). Only a change to or from published starts a production build.

**Interface surface** (static pages only, no endpoint on bimdelivery.vn):

| Surface | Kind | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `sanityLoader` (`src/lib/sanity-loader.ts`) | loader factory | `collection`, `query`, `toData`, `orderKey`, plus spec 0019's build config | an Astro `Loader` | as spec 0019 | as spec 0019, messages naming the collection; `sanityClient` in `src/lib/sanity.ts` takes the collection name too, for its "drafts with no token" and fetch error messages |
| `posts` loader (`src/content.config.ts`) | build time GROQ read (Sanity's query language) | `POSTS_QUERY`, `toPostData` | post entries in the Zod shape | none for `published`; Viewer token for `drafts` | Sanity unreachable, or drafts with no token: the build fails by name |
| `POSTS_QUERY`, `toPostData` (`src/lib/sanity.ts`) | pure | | every `post` with each image's asset turned into `url` and `metadata.dimensions`, in the body too; a new object per document, never throwing | | |
| `getPosts(lang)` (`src/lib/content.ts`) | getter | lang | posts sorted by `publishedAt` descending, then `sanityId` | | |
| `getBlogPage(lang)` (`src/lib/content.ts`) | getter, through `loadSingle` | lang | the `blogPage` entry | | missing entry fails the build |
| `blogPages`, `pageHref`, `postJsonLd`, `formatPostDate`, `fill`, `postHead`, `listHead` (`src/lib/blog.ts`) | pure | posts, page size; a post plus the origin and organization; a template and its values | pages (zero posts give one empty page 1); `/blog` or `/blog/page/<n>`; the `BlogPosting` object; the shown date; the filled text; feature 11's head props | | |
| `shareImageUrl` (`src/lib/sanity-image.ts`) | pure | a `SanityPhoto` | the 1200 by 630 address | | |
| `src/pages/blog/index.astro` | `GET /blog` | `getBlogPage(DEFAULT_LOCALE)`, `getPosts(DEFAULT_LOCALE)` | page 1, or the empty state; the pagination nav and status only when there are 2 or more pages | public | |
| `src/pages/blog/page/[page].astro` | `GET /blog/page/<n>`, n of 2 or more | `getStaticPaths` from `blogPages(getPosts(DEFAULT_LOCALE))`, page 1 dropped | that page | public | |
| `src/pages/blog/[slug].astro` | `GET /blog/<slug>` | `getStaticPaths` from `getPosts(DEFAULT_LOCALE)` | the post page in `post.lang`, its head tags and JSON-LD in the `head` slot | public | |
| `src/components/blog/` | components | props from the entries | `PostCard`, `PostHeader`, `PostBody` (the `astro-portabletext` component map: block styles, lists, `link`, `bodyImage` through `Photo.astro`), `Pagination` | | |
| `studio/schema-types/post.ts`, `post-body.ts`, `body-image.ts` | Studio types | | the model above | Studio session | Publish refused with the rule's message |
| `studio/structure.ts` | Studio list | | Projects (orderable), Blog posts (by `publishedAt` descending) | | |
| `PreviewOnSiteAction` | Studio action on `project` and `post` (`sanity.config.ts`: `schemaType` in `['project', 'post']`) | the document's type and `slug` | as spec 0019, with the address by type and the "a draft breaking the rules will not appear" line | Studio session | as spec 0019 |
| Sanity webhook `site-build` | config change | filter `_type in ["project", "post", "previewRequest"]` | as spec 0019 | as spec 0019 | as spec 0019 |
| `.github/workflows/backup.yml` | GitHub Actions: nightly at 19:00 UTC (02:00 in Vietnam), `workflow_run` on `Deploy` completed, and `workflow_dispatch` | `SANITY_READ_TOKEN` passed to the CLI as `SANITY_AUTH_TOKEN` | an artifact `sanity-production-<date and time>.tar.gz`, kept 90 days | the `production` Environment | a failed export fails the run and GitHub emails the developer. If the Viewer token cannot export, stop and decide again: a stronger token would sit in a public repository's Environment |

**What this needs from feature 11** (the contract; if feature 11's spec chooses differently, revise AC-14 to AC-16 before building, and change only `postHead` and `listHead`; AC-14 to AC-16 are verified once feature 11 is built):
- A head API on the layout that takes a page's title, description, canonical path, Open Graph type (`website` or `article`), share image address, and optional extra meta tags (for `article:published_time` and `article:modified_time`), and writes absolute addresses from `site`.
- The site's title pattern (for example `<title> | BIM Delivery`), applied when a post has no `seo.title`.
- A sitemap that lists every prerendered public route, so the blog routes join it with no blog specific code, ideally with a way to set `lastmod` per page.
- `robots.txt` that allows `/blog`.
- Optionally, a sitewide Organization JSON-LD with a stable `@id` that `BlogPosting` can point at; and the decision on `BreadcrumbList`, which posts follow and do not add on their own.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| `/blog` | title, description | `blogPage.seo`; page `n` uses `fill(blogPage.pageTitle, { title: blogPage.seo.title, page: n })` |
| `/blog` | `h1`, intro, empty message | `blogPage.heading`, `.intro`, `.empty` |
| List order, page split | which posts, in which order, on which page | `getPosts`: `publishedAt` descending, then `sanityId`; `blogPages` with `BLOG_PAGE_SIZE` = 12 (`post-fields.ts`) |
| Card | cover, title, excerpt, link | `post.cover`, `.title`, `.excerpt`, `/blog/${post.slug}` |
| Card, post header | shown date | `formatPostDate(post.publishedAt, lang)`; `<time datetime>` is `publishedAt` as stored |
| Card | which covers load eagerly | the first card on page 1, with `fetchpriority="high"`; every other cover lazy |
| Pagination | previous, next, status | `blogPages`: `prevHref`, `nextHref` from `pageHref`; `fill(blogPage.pagination.status, { page, total })`; shown only when `total` is 2 or more |
| Post header | back link | `blogPage.post.backLink`, href `/blog` |
| Post header | updated line | `blogPage.post.updated` plus `formatPostDate(post.updatedAt)`, only when `updatedAt` is set |
| Post body | every block, mark, link, image | `post.body`, through the `PostBody` component map |
| Body link | `rel` | `nofollow` on the link's mark definition: `rel="nofollow"` only when it is `true`; no `rel` otherwise, and no `noopener`, since no link sets `target` |
| Body image | `src`, `srcset`, `width`, `height`, `object-position`, alt, caption | the image's `photo` through `sanity-image.ts` as spec 0019 does; `alt`; `caption` |
| Post head | title | `post.seo.title`, else feature 11's pattern on `post.title` |
| Post head, JSON-LD | description | `post.seo.description`, else `post.excerpt` |
| Post head, JSON-LD | canonical, `mainEntityOfPage` | `new URL('/blog/' + slug, Astro.site)` (`site` = `https://bimdelivery.vn`, spec 0020) |
| Post head, JSON-LD | share image | `shareImageUrl(post.cover)` |
| Post head, JSON-LD | published and modified dates | `publishedAt`; `updatedAt` else `publishedAt` |
| JSON-LD | `author`, `publisher` | feature 11's Organization `@id`, else `settings.siteName` and `Astro.site` |
| JSON-LD | `inLanguage` | `post.lang` |
| Sitemap | `lastmod` | `updatedAt` else `publishedAt`, through feature 11's sitemap |
| Footer | the Blog link | `navigation.footerLinks` |
| Preview toast | address | `DEV_LINK` plus `/blog/<slug>` for a post, `/project/<slug>` for a project, the list path when there is no slug |
| Every blog page | closing band | `blogPage.cta` |
| Every blog page | language | `/blog` and `/blog/page/<n>`: `DEFAULT_LOCALE`; a post page: `post.lang` (only `DEFAULT_LOCALE` posts get routes while there is one locale) |
| Build error message | the post's name and field | `<lang>/<slug>`, the Sanity `_id`, Zod's issue path |
| Backup file | content | `sanity dataset export production --no-drafts --no-assets`; name from the run's date and time |

**Key invariants**:
- Every blog route is prerendered; `output` stays `'static'`; no script and no island on any blog page.
- The Zod schema is the source of truth; the Studio refuses everything Zod rejects; a limit changes once, in `post-fields.ts`.
- `post.body` reaches the page as Portable Text and is rendered only by the `PostBody` component map; there is no raw HTML block type, so editors cannot inject markup.
- A link's `href` is one of the four allowed forms; `javascript:` and every other scheme is refused by both the Studio and Zod.
- Production reads `published` with no token and is strict unless a manual run sets `lenient`; content never fails a preview build.
- The loader maps documents to new objects; nothing is mutated in place. Every post carries `lang`.
- `updatedAt` is only ever set by an editor, never derived from Sanity's own timestamps.
- `blog` is a reserved path, and `page` a reserved post slug.

**Security model**:
- Members: the developer, the client editors, and several SEO editors, all Administrators on the free plan. Any of them can edit or delete any project or post, invite or remove members, and change project settings. Accepted for trusted staff; the nightly backup (AC-1) and Sanity's document history are the recovery path. Restricting the SEO team to posts needs Enterprise custom roles; a cheaper step is the Growth plan's Editor role, which takes away member and settings access but not project editing.
- Read: published posts are public site content. Drafts need a token and appear only on the dev link, behind Cloudflare Access and `noindex`. Uploads are public by their address at once, so the cover and body image fields carry spec 0019's public upload notice.
- Rendering: text is escaped by `astro-portabletext`; link schemes are allowlisted; JSON-LD writes `<` as `\u003c`.
- Backup: only published documents, so a public artifact exposes nothing new. It reuses the Viewer token; no new secret.
- No regulated data. Editors' accounts live in Sanity.

**Configuration required**:
- No new env var or secret. The backup workflow reads the existing `SANITY_READ_TOKEN` from the `production` GitHub Environment (scheduled runs use `main`, which that Environment allows).
- Sanity: add `post` to the `site-build` webhook's filter; invite the SEO editors.
- Cloudflare: add the SEO editors' emails to the dev link's Access policy.
- pnpm: add `astro-portabletext` to the root package, pinned exactly; confirm it needs no install script under `allowBuilds`.

**Critical test scenarios**:
- Happy path: an SEO editor writes a post with two `h2`s, an `h3`, a nested list, an external link marked `nofollow`, an internal link, and two captioned images; previews it; publishes; within minutes it is first on `/blog` and its page renders every element. Verifies **AC-3**, **AC-5**, **AC-6**, **AC-8**, **AC-11**, **AC-12**, **AC-13**.
- Refusals: an `h3` before any `h2`, a `javascript:` link, a 161 character excerpt, a body image with no alt, a future `publishedAt`, and the slug `page` are each refused at Publish. Verifies **AC-4**, **AC-18**.
- Bad published post: a post written through the API with an `h1` block fails the production run naming it; the live site is unchanged; a lenient run deploys without it. Verifies **AC-7**.
- Pagination: exactly 12 posts give `/blog` with no pagination nav and no `/blog/page/*`; 13 give `/blog` with 12 and `/blog/page/2` with 1, no `/blog/page/1`; deleting one goes back to the first case at the next build. Verifies **AC-9**, **AC-16**.
- Dates: a post published at 06:00 in Vietnam (still yesterday in UTC) builds; `updatedAt` before `publishedAt` and `2026-02-31` each fail by name. Verifies **AC-4**, **AC-7**.
- Empty: with every post unpublished, `/blog` builds and shows the empty message. Verifies **AC-10**.
- Search engines: a post's built HTML passes the Rich Results Test and the Schema.org validator; the share card preview shows the 1200 by 630 crop around the focal point; the sitemap lists the post with its `lastmod`. Verifies **AC-14**, **AC-15**, **AC-16**.
- Shared loader: every project page's HTML matches its build from before the loader change, and a broken project still fails the build by name. A small test of `sanityLoader` with a fake read and fake data checks the strict, lenient, and preview branches and the duplicate rule for both collections. Verifies **AC-7**, **AC-19**.
- Backup: a manual run produces the artifact, it holds no `drafts.` documents and no asset files, and a finished `Deploy` run starts another. Verifies **AC-1**.
- Access: an SEO editor signs in, and opens the dev link after the Access email code. Verifies **AC-2**.

## Build plan

Skateboard: the thinnest usable whole first, an SEO editor publishing a post that goes live on a real page; then what search engines read; then polish and the team's invites. Feature 11 is done before step 2.

**1. Safety first**
1. Write `.github/workflows/backup.yml` (nightly, after every finished `Deploy`, and by hand; `production` Environment, pinned actions, `contents: read`, the Studio's packages only, `--no-drafts --no-assets`, 90 day artifact); run it by hand once and confirm the Viewer token can export. Satisfies **AC-1**

**2. A post goes live**
1. Add `src/lib/post-fields.ts` (the limits, `RESERVED_POST_SLUGS`, `BLOG_PAGE_SIZE`, the link pattern, and `bodyProblems`); the Studio's `post`, `postBody`, and `bodyImage` types with every rule, description, `initialValue` (`lang`, `publishedAt`), and the public upload notice; the Blog posts list in `studio/structure.ts`. Satisfies **AC-3**, **AC-4**, **AC-18**
2. Move the projects loader's generic part into `src/lib/sanity-loader.ts` with `orderKey`, give `sanityClient` the collection name, and put `projects` on it; add the `sanityLoader` branch test; compare every project page's HTML before and after. Satisfies **AC-7**, **AC-19**
3. Add `POSTS_QUERY` and `toPostData` (the deep null drop, `toPhoto` for body images) to `src/lib/sanity.ts`; the `posts` collection and its Zod shape with its refinements; `getPosts`; `blog` in `RESERVED_PATHS`. Satisfies **AC-4**, **AC-7**, **AC-18**
4. Add the `blogPage` collection (with the placeholder checks), `getBlogPage`, and `src/content/blogPage/en/blog.yaml` (placeholder copy); rename `navigation.legal` to `footerLinks` in every place it appears (`src/content.config.ts`, the `Navigation` type and `getNavigation` in `src/lib/content.ts`, `src/layouts/PageLayout.astro`, the `Footer` prop, `src/dev/styleguide.astro`) and add the Blog link to `main.yaml`. Satisfies **AC-10**, **AC-17**, **AC-20**
5. Add `astro-portabletext` (pinned exactly); build `PostHeader`, `PostBody` (the component map and its element styles), `PostCard`; `src/lib/blog.ts`'s `formatPostDate` and `fill`; the routes `blog/index.astro` (page 1 and the empty state) and `blog/[slug].astro`, each with `CtaBand`. Satisfies **AC-8**, **AC-10**, **AC-11**, **AC-12**, **AC-13**, **AC-19**
6. Give `PreviewOnSiteAction` posts (address by type, the "will not appear" line) and register it for `post` in `sanity.config.ts`; add `post` to the webhook filter. Merge, let `studio.yml` deploy the Studio, then publish a test post and time it until it is live; save a draft for ten minutes and confirm no run starts. Satisfies **AC-5**, **AC-6**

**3. What search engines read**
1. Add `shareImageUrl` (check the focal point on a real photo), `postJsonLd`, `postHead`, and `listHead`; feed feature 11's head API from both routes and put the `BlogPosting` JSON-LD in the post's `head` slot. Satisfies **AC-14**, **AC-15**
2. Add `blogPages` (zero posts give one empty page) and `pageHref`, `src/pages/blog/page/[page].astro`, and `Pagination` (shown only for 2 or more pages); page titles from `blogPage.pageTitle` through `fill`. Satisfies **AC-9**, **AC-10**, **AC-14**
3. Confirm every blog route is in feature 11's sitemap, with `lastmod` when it supports it; run the validators on a built post. Satisfies **AC-15**, **AC-16**

**4. Finish and hand over**
1. `entrance` on the list heading block and the post header, `data-reveal-stagger` on the cards; the accessibility checks. Satisfies **AC-20**
2. Record the post card, the body styles, and the pagination nav in `docs/design.md` with their contrast pairs, and add `/styleguide` tiles. Satisfies **AC-21**
3. Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm the HTML files under `dist/client/blog/`; check 390px, 1024px, JavaScript off, and reduced motion. Satisfies **AC-19**, **AC-20**
4. Confirm the backup has run green, then invite the SEO editors as Administrators and add their emails to the Access policy. Satisfies **AC-1**, **AC-2**

## Consequences

**Positive**:
- The SEO team publishes on its own, with drafts, previews, and validation, on a tool the client already uses and pays nothing more for.
- Posts are prerendered HTML with photos from the image CDN: fast, crawlable, and checked by name at build.
- One loader now serves every Sanity collection, which makes the later page slices of spec 0019 cheaper.
- The dataset finally has a backup.

**Negative / tradeoffs**:
- Several more Administrators: anyone of them can delete projects, remove members, or change settings. The backup restores content, not a deleted member or a changed setting.
- Publishing takes minutes, and every Publish rebuilds the whole site; a busy writing day means many full builds (GitHub Actions minutes are free on a public repository, but builds queue and cancel).
- A renamed or deleted post leaves a dead address until redirects exist, which costs the search ranking the SEO team built.
- No authors, categories, tags, RSS, or related posts yet; each is a later spec.
- One new dependency (`astro-portabletext`) and two schemas to keep in step (Studio and Zod), as with projects.
- Blog photos add to the Sanity free plan's CDN bandwidth, and every Publish starts a full build whose uncached reads count against its API quota.
- One broken published post blocks every Publish, projects included, until it is fixed or a lenient run is started by hand. The Studio refuses the same things the build does, so this needs a post written around the Studio, but the SEO team is a larger, less technical group than the client's editors.
- The backup holds documents, not uploaded files: a photo deleted in the Media tool is gone for good.
- A never published draft that breaks the rules is left out of its preview, so its toast link shows the 404 page.
- The shared loader touches shipped project code.
- Tables, quotes, and video embeds wait for a later spec.

**Neutral**:
- `navigation.legal` is renamed; feature 13's privacy link will go into `footerLinks`.
- Specs 0002 and 0019 are amended as listed at the top; the backup spec 0019 left open is done here.
- AGENTS.md changes (owned by `/sync`): the Stack line gains `astro-portabletext`, Rules gain the blog routes and the shared loader, and `src/scripts/AGENTS.md` is unchanged (no new script).

## Follow-up

- [ ] Design feature 11 (`/architect SEO foundation`) with the contract above in hand; it ships first.
- [ ] Redirects for renamed and deleted posts (and project slugs, spec 0019): decide whether feature 11 or a spec of their own covers them, before the SEO team renames its first published post.
- [ ] Write a one page guide for the SEO team: signing in, the fields and their limits, headings in order, alt text and captions, `nofollow`, Preview on site and the Access code, Publish, and that changing a published slug breaks links.
- [ ] Watch the members list: if the SEO team grows past about 15, or anyone needs less than Administrator, price the Growth plan's Editor and Contributor roles.
- [ ] Confirm how long the free plan keeps document history, and test restoring one document from a backup file.
- [ ] Later slices, each its own spec when asked for: authors, categories and tags, RSS, related posts, tables and quotes, video embeds, a per post `noindex` or canonical override.
- [ ] `/sync`: the four Sanity skills still live in `.claude/skills/` as copies and are not yet in AGENTS.md (an open item in spec 0019); `portable-text-serialization` now also shapes `src/components/blog/`.
