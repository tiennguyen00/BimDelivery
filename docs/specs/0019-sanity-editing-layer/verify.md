# Verify: client editing in Sanity · spec 0019 · updated 2026-10-25
_Steps derived from spec 0019 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones. Steps marked (done at build) were already run by `/develop` on 2026-10-25 and are worth one more pass._

## UI / manual

### The Studio
- [ ] Open https://bimdelivery.sanity.studio in a private window, sign in with Google, then again with email and password → both reach the Studio; no GitHub account is asked for → AC-1
- [ ] Create a project with 3 rooms in 2 categories and 12 PNG photos (one over 20 MB), edit it, drag it to the top of Projects, unpublish it, delete it → every step works; a room accepts 20 photos and refuses a 21st; a project refuses an 11th room → AC-2
- [ ] Try to publish each of: an empty title, a 61 character title, a photo with no alt (and one with only spaces), slug `Harbour Tower`, a slug already used by another `en` project, year 1899, a span marked both Bold and Accent, `**` typed into the intro, a line break inside an intro paragraph, an empty intro paragraph, a fifth intro paragraph, 9 work items → Publish is refused each time with a message on the field → AC-3
- [ ] Open any photo field and the Media tool → each photo field's description says an upload is public by its link at once; the Media tool finds the upload and deletes it, after which its CDN address stops answering → AC-18
- [ ] Look for `previewRequest` in the Projects list and under "new document" → not offered anywhere → AC-5

### Publish and preview (after tasks 7 and 8 are wired)
- [ ] Publish a change to one project's summary; time it until bimdelivery.vn shows it; record the minutes here → AC-4
- [ ] Unpublish a project, then delete one, then drag one to a new place → each starts one `production` run and the live site follows → AC-4
- [ ] Edit a draft for ten minutes (autosave on), then check GitHub Actions → no run started → AC-6
- [ ] Press "Preview on site" on a project → a toast shows `https://bim-delivery-site-dev.bimdelivery.workers.dev/project/<slug>` and "about 3 minutes"; the dev link then shows the draft, and bimdelivery.vn does not → AC-5
- [ ] Press "Preview on site" twice within a minute → the first `preview` run is cancelled, the second deploys → AC-5
- [ ] Give one project's draft an empty required field, press "Preview on site" → the build passes, that project shows its published version, and the log names it (`<lang>/<slug>`, Sanity `_id`, field) → AC-5 (done at build, locally)
- [ ] Open the dev link in a private window → Cloudflare Access asks for the email code; after it, every page's source has `<meta name="robots" content="noindex">` → AC-19

### The site
- [ ] On `/project`, `/project/<slug>`, open the network panel → every project photo is an `<img>` on `cdn.sanity.io` with `w=` and `auto=format`, served as WebP or AVIF near the drawn width, never the PNG original; `width` and `height` are set and nothing shifts while photos load → AC-7
- [ ] Set a crop and a focal point on one cover photo in the Studio, publish → the tile, the hero, and the portrait show the crop, framed round the focal point → AC-7
- [ ] Give a project rooms in Architectural and Interior BIM → its tile, its home showcase pane, and its hero tagline read "Architectural BIM · Interior BIM" (services' order, each once); the overview row is labelled "Services" with "Architectural BIM and Interior BIM", each a link to its service page → AC-8
- [ ] On `/project`, choose each service tab → the project above shows under both; choose New Zealand → College Hall and Corner Block show; choose an area band → the wall narrows as before → AC-9
- [ ] On a project page, check the rooms band with JavaScript on and off → each room name has its category over it in `ink`, in the list and in the no script fallback → AC-10
- [ ] Build a project with 10 rooms of 20 photos; view it at 390px and 1440px → every photo but the hero is lazy, the arrows step and wrap, the words follow, and there is no sideways page scroll at 390px → AC-17
- [ ] Open every page outside projects (home copy, About, Contact, the three services, 404) → unchanged; their photos are still Pexels copies from the site's own origin → AC-15

## Commands
- [ ] `pnpm --filter bim-delivery-studio run import:projects` twice → the second run uploads nothing; `count(*[_type == "project"])` stays 6 and `count(*[_type == "sanity.imageAsset"])` stays 31 → AC-12 (done at build)
- [ ] Build the site and diff each project page's visible text and alt text against the last YAML build → only the new category labels differ → AC-12 (done at build)
- [ ] `pnpm check && pnpm lint && pnpm build`, then `find dist/client -name '*.html' | wc -l` → 14, one per route; `grep -l astro-island dist/client/project/*/index.html dist/client/project/index.html` → nothing → AC-13 (done at build)
- [ ] Write an invalid published project through the API (61 character title, a photo with no alt), run `pnpm build` → it fails naming `en/<slug>`, the Sanity `_id`, `title`, and `portrait.alt`; run with `SANITY_LENIENT=true` → it builds the other six and warns; delete the document → AC-11 (done at build, locally)
- [ ] Repeat that through GitHub: Publish the bad entry → the `production` run fails, the live site stays as it was, GitHub emails the developer; then `workflow_dispatch` with `lenient` → deploys the rest → AC-11
- [ ] Send the relay a request with no signature, a wrong one, and an unknown event → 401, 401, 400, and no Actions run → AC-14 (done at build, locally under `wrangler dev`)
- [ ] Check the repo and the `production` Environment → no secret in the repo; the Environment allows `main` only; `GITHUB_DISPATCH_TOKEN` exists only as a relay Worker secret; Workers Builds is disconnected → AC-14
- [ ] Merge a change under `studio/` to `main` → `studio.yml` redeploys the Studio → AC-16
- [ ] Run a `preview` build and read the log → the name check reports `bim-delivery-site-dev` with no routes before `wrangler deploy` → AC-5, AC-14

## Value sourcing
- [ ] Categories on the tile, showcase, and tagline come from each room's `category` → change one room's category in the Studio and publish → all three update, in services' `order`, each once
- [ ] The overview row label → one category reads "Service", two read "Services"; each link goes to `/<service slug>`
- [ ] The rooms band label → shows that room's own category, not the project's first
- [ ] The filter tabs → a service no room uses has no tab; adding a room in it adds the tab
- [ ] Tile `data-service` → holds every category slug joined by `|`
- [ ] Order → drag a project to the top in the Studio → it becomes the first tile, the first showcase pane, and the next link from the old last project wraps to it
- [ ] Photo `src` and `srcset` → a cropped photo's addresses carry `rect=` in pixels; an uncropped one has no `rect`; no width over the kept rectangle is offered
- [ ] Photo `width` and `height` → equal the cropped rectangle, not the original
- [ ] Photo `object-position` → moves with the focal point, relative to the crop; `50% 50%` with none
- [ ] Preview toast address → a project with no slug yet links to `/project`
- [ ] Strict or lenient → only the `lenient` input of a manual run drops an invalid entry; a push or a Publish never does
- [ ] `noindex` → present on every page of a `preview` build, absent on production (done at build: 14 of 14, and 0 of 14)
- [ ] Photo `alt` → the Studio's alt text, word for word, on every project photo
- [ ] Intro paragraphs → Bold renders bold, Accent renders in the accent, with no stray spaces inside the marks
- [ ] Entry id → `<lang>/<slug>`; renaming a slug moves the page (and breaks the old address)
- [ ] Build error message → names the entry id, the Sanity `_id`, and the field
- [ ] Which content a build reads → `production` reads published only; `preview` reads drafts
- [ ] Which GitHub job runs → Publish starts `production`, "Preview on site" starts `preview`, never the other way
- [ ] Turnstile key → production pages carry the real key; preview pages carry the test key `1x00000000000000000000AA`
- [ ] Studio host → `studio/sanity.cli.ts` says `bimdelivery`, and the Studio answers at https://bimdelivery.sanity.studio (done at build)

## Acceptance-criteria coverage
- AC-1 Studio sign in · AC-2 Studio editing · AC-3 publish refusals · AC-4 publish timing and events · AC-5 preview, fallback, cancel, toast, hidden type, name check · AC-6 no build on typing · AC-7 network panel, crop and focal point · AC-8 categories · AC-9 filter · AC-10 room label · AC-11 strict, lenient, through GitHub · AC-12 import twice, text diff · AC-13 gates and routes · AC-14 relay, secrets, Environment · AC-15 other pages · AC-16 studio.yml · AC-17 large carousel · AC-18 photo notice and Media tool · AC-19 Access and noindex
