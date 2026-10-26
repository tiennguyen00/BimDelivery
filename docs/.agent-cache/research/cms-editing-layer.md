# CMS editing layer: research cache

Date: 2026-10-25. Budget used: 5 web searches, 8 page fetches (budget spent).
Legend: "fetched" = read from the live page today; "search excerpt" = only seen in search result text, not opened; "unconfirmed" = could not verify in this session.

## 1. TinaCMS / TinaCloud

- Plans (fetched, https://tina.io/pricing):
  - Free: $0 "Forever", 2 users, 2 roles. No editorial workflow listed.
  - Team: $24/project/month or $290/year, 3 users included (up to 10), 2 roles. No editorial workflow listed.
  - Team Plus: $41/project/month or $490/year, 5 users included (up to 20), 2 roles. Editorial Workflow listed.
  - Business: $249/project/month or $2,990/year, 20 users included, 3 roles (Beta). Editorial Workflow listed.
  - Enterprise: custom. "Custom Editorial Workflow", SSO, GitHub Enterprise support.
  - Extra seats: $90/yr (Team), $150/yr (Team Plus), $180/yr (Business). The page's comparison table shows $9, $15, $18 per user with no period. The page does not reconcile the two.
- Editorial workflow: listed only on Team Plus and above. The page does not describe the draft or review mechanics. A Gappsy review (search excerpt, https://gappsy.com/tools/tinacms/) says the workflow has draft and review states. Unverified.
- Price conflicts: the Gappsy review says "from $24/month". An Aug 2024 Tina blog post (search excerpt, https://tina.io/blog/Pricing-Updates-its-now-cheaper-to-use-Tinas-best-feature-) quotes Team Plus at $49/month. The fetched page shows $41. The fetched page is the one to trust.
- Media: the pricing page lists a "100 MB" asset size cap on every plan. It does not name a media store (repo, S3, R2, or Tina Cloud media). The storage question is unconfirmed.
- Unconfirmed: editor sign-in by email or Google without GitHub (the pricing page is silent; the FAQ URL https://tina.io/docs/tina-cloud/faq returned 404); static admin build to public/admin; YAML support; Tina Cloud free-plan user cap is 2 (fetched).

## 2. Keystatic / Keystatic Cloud

- https://keystatic.com/pricing returned 404. https://keystatic.com/cloud returned 404. One search returned nothing about Keystatic.
- Unconfirmed: free-plan user limit; paid price; whether editors can sign in without GitHub; image hosting; whether the Astro admin needs server-rendered routes.
- Next step (not done, budget spent): read the Keystatic docs directly, starting from https://keystatic.com.

## 3. Pages CMS (pagescms.org)

- Free and open source, MIT licensed. The homepage says "Pages CMS is 100% free". No paid tier is stated (fetched, https://pagescms.org/).
- Collaborators are invited by email with no GitHub account needed. They can edit content and media. They cannot manage .pages.yml, manage collaborators, or use cache admin (search excerpt, https://pagescms.org/docs/configuration/collaborators/).
- Collaborator saves go through the GitHub App installation token. The committer is not the collaborator by default. Setting `settings.commit.identity: user` adds the collaborator's name and email (search excerpt, same URL).
- Media is stored in the GitHub repo. External storage (S3, R2) is marked "Soon" (fetched, https://pagescms.org/).
- Draft, branch, or review workflow: not stated. The "Permissions" feature is marked "Soon" (fetched, https://pagescms.org/).

## 4. Sanity (API CMS)

- Free (fetched, https://www.sanity.io/pricing): $0, up to 20 seats, 2 permission roles (Administrator, Viewer), 2 datasets (public only), 10k documents, 100 GB assets, 100 GB bandwidth, 1M API CDN requests/month, 250k API requests/month. No extra seats, datasets, or storage can be bought on Free.
- Growth: $15/seat/month, up to 50 seats, 5 roles (adds Editor, Developer, Contributor), private datasets, scheduled drafts. Overage pricing applies.
- Scheduled drafts: Growth only, not Free (fetched, https://www.sanity.io/pricing).
- Live preview and visual editing: included on Free (fetched, https://www.sanity.io/pricing).
- Image pipeline and global CDN: included on all plans. No image-specific limits are listed. Delivery is bounded by the asset storage and bandwidth quotas. Media Library is an add-on that Growth does not include (fetched, https://www.sanity.io/pricing).
- Viewer-role users do not use a seat (fetched, https://www.sanity.io/pricing).
- Unconfirmed: an Astro integration or loader; fit for an Astro static site (not searched).
- Search excerpts gave conflicting Free figures (500k or 1M API CDN; 10 GB or 100 GB storage). The official page figures above are the ones to trust.

## 5. Cloudflare Workers Builds

- Preview builds: enable under Settings > Build > Branch control, "Enable Preview Builds" (fetched, https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/).
- A push to a non-production branch runs the build, then the preview deploy command instead of the production deploy. For new Workers the default preview command is `npx wrangler preview` (fetched, same URL).
- Preview URL: shown in the Worker's "Previews" section, and posted as a pull request comment on GitHub and GitLab (fetched, https://developers.cloudflare.com/workers/ci-cd/builds/).
- Deploy hook, REST API, or webhook to start a build: not documented on the Workers Builds pages fetched. The only trigger documented is a git push. Unconfirmed.
- Conflicts: a search excerpt gives the default preview command as `npx wrangler versions upload`. A search excerpt also mentions a newer "Worker Previews" feature with `wrangler preview` (third-party reports only, not confirmed on Cloudflare's pages).
- Unconfirmed: whether a Workers static-assets site gets a preview URL the same way.

## 6. CloudCannon

- Not checked (budget spent).

## Freshness

Searches and fetches run 2026-10-25. Tina and Sanity pricing pages were read today; the Tina pricing page has no last-updated date. Keystatic and the Tina FAQ URLs returned 404. Re-check all prices before any purchase.
