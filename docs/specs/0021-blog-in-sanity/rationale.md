# 0021. Rationale: a blog the SEO team runs in Sanity

## Context

> ⚠️ Premise note: the request was a "post management page" for the SEO team to add, edit, and delete posts. The real job is that several non developers publish search content on their own, safely. An admin page is one way to do that, and here the most expensive one, because the site already has a hosted editing app (spec 0019) with sign in, drafts, preview, and Publish wired to deploys.
>
> This feature also assumes feature 11 (SEO foundation: canonical addresses, share cards, sitemap, robots), which has no spec yet. The engineer chose to build feature 11 first, so this spec states what it needs from feature 11 as a contract (in `index.md`) instead of designing those pieces twice. A Follow-up item designs feature 11.

The site is a prerendered Astro site on Cloudflare Workers (spec 0001). Every route must be an HTML file at build, `output` stays `'static'`, and any new layer (auth, database) needs a spec. Projects already come from Sanity at build through a content collection checked by Zod, photos come from Sanity's image CDN, and Publish in the Studio starts a production build through a signed webhook, a relay Worker, and GitHub Actions (spec 0019). The client's editors already work there.

The SEO team is several people with no developer among them. They need to write long form posts with headings, lists, links, and images, control each post's address, search title, and description, preview a draft, and publish, fix, or delete without asking anyone. Search value depends on clean HTML, fast photos, accurate dates, structured data, and a sitemap.

Forces: Sanity's free plan (as of 2026-11-26) gives 20 seats but only the Administrator and Viewer roles; the Growth plan ($15 per editing seat per month) adds Editor, Developer, and Contributor; restricting someone to one document type needs Enterprise custom roles. The dataset has no backup yet (an open item in spec 0019). Every Publish is a full rebuild of a few minutes. The team runs one person's worth of developer time.

## Options considered

### Option 1: posts in the existing Sanity Studio, prerendered pages (chosen)

Add a `post` document type to the Studio and build `/blog` and `/blog/<slug>` at build time from a Sanity backed content collection, the same path projects take.

**Pros**:
- Sign in, drafts, preview, Publish, delete, media browser, and deploys already exist and are proven.
- Every page stays prerendered and Zod checked; no new layer, no new bill.
- One editing tool for the whole client side, not two.

**Cons**:
- On the free plan the SEO team are Administrators and can touch projects and settings.
- Publish to live takes minutes; every post change rebuilds the site.
- Two schemas (Studio and Zod) to keep in step.

### Option 2: Markdown or MDX in git, edited through a git based CMS (Decap, Keystatic, TinaCMS)

Posts live as files in the repo; an editing app commits them.

**Pros**:
- Content history is git history; a backup is free.
- No change to the Sanity setup.

**Cons**:
- Editors need GitHub accounts or a git provider login; spec 0019 ruled that out for the client's team.
- Images land in git or need a separate media store.
- A second editing system beside Sanity for the same client.

### Option 3: a custom admin inside the site (Workers, D1, R2, own sign in)

Build `/admin` with its own login, a database for posts, file storage for images, and a rich text editor.

**Pros**:
- Full control over roles: the SEO team could be limited to posts.
- No dependence on Sanity's plans.

**Cons**:
- Breaks the prerender rule (an admin needs server routes) and adds three new layers, each needing a spec.
- Rebuilds sign in, drafts, uploads, image resizing, and an editor that Sanity already provides; the security of a home made admin is now the developer's to own.
- Weeks of work before the first post.

### Option 4: a hosted blog platform on a subdomain (for example Ghost or WordPress at `blog.bimdelivery.vn`)

**Pros**:
- A mature writing tool with roles, scheduling, and SEO plugins on day one.

**Cons**:
- A subdomain splits search signals from the main site, and the blog no longer looks or loads like the site.
- A monthly bill and a second system to run, patch, and secure.

## Rationale

The job is self service publishing by non developers, and spec 0019 already built exactly that pipeline for projects. Reusing it costs one document type, one loader refactor, and three routes, and keeps every rule that protects the site: prerendered pages, Zod at build, a strict production build, and secrets held only by the relay. Options 2 to 4 each rebuild something that exists or split the site.

The real cost of Option 1 is permissions. Several Administrators can delete projects or change settings, and no free or Growth setting prevents that. The engineer accepted it for trusted staff on the condition that the dataset is backed up first, so the backup moved from a loose to do item into this spec's first build step. If the team grows or trust changes, the Growth plan's Editor role is the next step, priced per seat.

Building feature 11 first keeps the sitewide pieces (canonical addresses, share cards, sitemap, robots) in one place, so the blog adds only what is specific to posts: `BlogPosting` data, the share crop, the dates, and `lastmod`.
