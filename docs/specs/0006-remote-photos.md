# 0006 · Photos served from internet links, and a white hero photo

**Status**: Assumed
**Date**: 2026-09-21
**Authorized by**: tiennguyen00, during /develop ("refine the whole homepage first for the demo, then get back to update the architecture later")

## Owed decision

Where the site's photos come from. Spec 0002 models every image as a local file checked by Astro's `image()` helper, and spec 0005 expects the hero photo to be a local file (`src/assets/images/home/hero.jpg`). Moving photos to internet links changes the content model (a photo `src` becomes a URL), the build (Astro now downloads photos at build time, so a build needs network access to the photo host), and the licence trail (credits now point at a third party host). It also changes the hero's look: a white background photo with the object centred, under the existing dark panel.

## Assumption built on

- Every **photo** on the site (home hero, overview, presence, the three services, the five projects, About) is an `https` link on `images.pexels.com`, written in the content entry. The schema rejects any other host or a local path.
- The logo and the three placeholder badge SVGs stay local files. They are drawn for this project, not photos, and the real ones replace them before launch.
- Astro still optimises every photo at build (`imageService: 'compile'`, spec 0001): it downloads each link once, resizes it, and serves the copies from this site's own domain. Visitors never load an image from Pexels. `image.domains` in `astro.config.mjs` allows `images.pexels.com`, and nothing else.
- Components read a photo's size from the link at build (`inferSize`, and `inferRemoteSize` for the hero's width steps), so content does not carry a width and height.
- Each link asks Pexels for a bounded source width (`w=2560` for the hero, `w=1600` for every other photo), so the build never downloads a 6000px original.
- The hero photo is a plain white background with one small object in the centre (Pexels 3961750, a clay model house). The dark `bg-scrim` panel, the white text, and the rest of spec 0005's hero are unchanged, as the engineer chose.
- The local `.jpg` files are removed; `src/assets/images/CREDITS.md` lists each Pexels photo and its licence.

## Code area

- `astro.config.mjs` (`image.domains`)
- `src/content.config.ts` (a `photoSchema` beside the local `imageSchema`)
- `src/content/home/en/home.yaml`, `src/content/about/en/about.md`, `src/content/services/en/*.md`, `src/content/projects/en/*.yaml`
- `src/components/home/Hero.astro`, `src/components/ui/Card.astro`, `src/components/ui/MediaText.astro`, `src/dev/styleguide.astro`
- `src/assets/images/` (photos removed, credits rewritten)

## Requirements

- Every photo on every page is an internet link in content; no `.jpg` is left in `src/assets/images/`.
- A photo link on any other host, or a local path, fails the build naming the file and field.
- `pnpm check`, `pnpm lint`, and `pnpm build` run clean, and `dist/client/` still holds one HTML file per route.
- The built pages serve optimised copies from this site's own origin (`/_astro/…`), not `images.pexels.com`.
- The hero shows the white background photo with the object centred, under the dark panel.

## Ratify

This decision was recorded by /develop, not deliberated. Run `/architect remote photos` to deliberate and ratify it (and fold it into specs 0002 and 0005). Until then it stays flagged as an owed decision; it does not block marking the feature `done`.

Open points for that pass:

- The build now depends on Pexels being reachable. A Pexels outage or a removed photo fails the build (Cloudflare builds on push), where a local file never could.
- The centred object and the centred dark panel sit in the same place, so the panel covers much of the object on most screens. Worth a design look once the demo is done.
