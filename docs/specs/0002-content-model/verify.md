# Verify: Content model · spec 0002 · updated 2026-09-19
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Revert every drill after running it._

## Commands
- [ ] `pnpm check` → 0 errors → AC-12
- [ ] `pnpm build` → passes, and `dist/client/index.html` exists → AC-12
- [ ] Open `src/content.config.ts` → exactly ten collections: settings, navigation, stats, home, about, contact, projectPage, notFound, services, projects → AC-1
- [ ] Every collection folder has an `en/` folder with at least one entry → AC-11
- [ ] `src/assets/images/CREDITS.md` lists every `.jpg` under `src/assets/images/`, each with source and licence; logo and badges are SVG placeholders → AC-11

## UI / manual
- [ ] Open `dist/client/index.html` (or `pnpm dev` then `/`) → `<title>`, meta description, `<h1>`, subheading, and three service titles match `home.yaml` and the service files → AC-10
- [ ] Edit the hero heading in `home.yaml`, rebuild → the new heading appears; `index.astro` and `BaseLayout.astro` hold no visible copy → AC-10

## Failure drills (each must fail `pnpm build` with a message naming the file)
- [ ] Remove `hero.heading` from `home.yaml` → `home → en/home`, `hero.heading: Required` → AC-3
- [ ] Point `hero.image.src` at a missing file → `ImageNotFound` naming the bad image path (see note below) → AC-3
- [ ] Set `hero.image.alt: ""` → error on `hero.image.alt` → AC-4
- [ ] Delete `hero.image.alt` (no `decorative`) → error on `hero.image.alt` → AC-4
- [ ] Make `seo.title` longer than 60 characters, or `seo.description` shorter than 50 → error on `seo.title` / `seo.description` → AC-5
- [ ] Move `services/en/scan-to-bim.md` to `services/vi/` keeping `lang: en` → "has lang "en" but sits in the "vi" folder" → AC-2
- [ ] Set `lang: vi` in `stats/en/stats.yaml` → `lang: Invalid input: expected "en"` → AC-2
- [ ] Give two services the same `slug` → "share the slug" naming both files → AC-6
- [ ] Give two services the same `order` → "share the order" naming both files → AC-6
- [ ] Set a service `slug: contact-us` → "reserved path" → AC-6
- [ ] Point a project's `service` at `en/nope` → "points to service "en/nope", which does not exist" → AC-7
- [ ] Delete `home/en/home.yaml` → "home: the required "en" entry is missing" → AC-8
- [ ] Remove the `type: services` item from `navigation/en/main.yaml` → "has 0 services slots" → AC-8

## Grow by data
- [ ] Copy a service file to `services/en/mep-modeling.md` with a new `slug`, `order: 4`, and `title`; rebuild → a fourth title appears on the home page, with no code change; delete it after → AC-9

## Value sourcing
- [ ] Page language → `resolveLocale(Astro.currentLocale)`; `<html lang>` in the built HTML is `en` → Value sourcing: language
- [ ] Page title and description → change `home.seo.title`, rebuild, see it in `<title>` → Value sourcing: SEO
- [ ] `getNavigation` service items → labels equal each service `title`, hrefs are `/<slug>`, in `order`; swap two services' `order` and the dropdown order swaps → Value sourcing: nav label, href, order
- [ ] `getContactPage` → `details` equals `settings.contact` (change the phone in `site.yaml`, the contact data follows) → Value sourcing: email, phone, address
- [ ] `getProjects` → each project's `service.title` and `service.slug` come from the referenced service; rename a service title and the project follows → Value sourcing: project service
- [ ] Image alt → an image with `decorative: true` (and no `alt`) passes the build → Value sourcing: alt
- [ ] Image size → built HTML or `_astro/` holds optimised files with width and height (checked once feature 6 renders images) → Value sourcing: image size
- [ ] Rows owned by later features (stats formatting, contact island copy, footer, 404, project page, home services cards) → verify in features 5, 6, 9, 10 → Value sourcing: deferred rows

## Acceptance-criteria coverage
- AC-1: config check · AC-2: language folder and locale drills · AC-3: missing field, missing image · AC-4: empty alt, no alt · AC-5: SEO length drill · AC-6: slug, order, reserved drills · AC-7: missing service drill (the cross language case cannot be drilled until a second locale exists) · AC-8: missing entry drills, nav slot drill · AC-9: grow by data · AC-10: home page output · AC-11: entries and credits · AC-12: check and build

Note on AC-3: a missing image fails the build, but Astro's own error names the image path, not the entry file or field. Searching `src/content/` for that path finds the entry.
