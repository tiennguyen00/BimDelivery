# 0018. Redraw the project detail page as a hero, an overview, and a rooms band

**Date**: 2026-10-12
**Status**: Accepted
**Authorized by**: tiennguyen00 (an annotated reference of three bands: project name and intro beside a large photo; an overview of tagline, name, and facts beside an upright photo; a brown band per room with a large photo carousel with arrows beside the room's name and its workload, "the photos larger than the caption beside them". Chose to keep only the next project link and the contact band from the old page. First built as one band per room; the same day revised to one band: "use only 1 project-room-heading, and add all the image into the carousel", photos to words 2:1, and the words changing, animated, with the photo)
**Replaces**: spec 0015's bands 1 to 4 (intro, cover, story, gallery). Its routes, slugs, head, nav marking, tile links, next project link, and closing band stand.

## Summary

`/project/<slug>` becomes five bands: the hero, the overview, one Coffee rooms band, the next project link, and the accent `CtaBand`. The write up and the photo wall are gone; the hero's intro paragraphs and the rooms carousel take over their jobs. The photos are a native snapping scroller, so they work with no script; a small plain script, `room-carousel.ts`, adds the arrows and keeps the words in step with the photo. No dependency, token, or colour is added.

## Decision

- **Hero**: the About page's `SplitBand`, unchanged: the title as the `h1`, the service's title as the tagline, the entry's `intro`, a "Discover more" button down to `#project-overview`, and the cover photo (`image`). Reused rather than copied, so the two split heroes cannot drift.
- **Overview** (`ProjectOverview`, a `raised` `Section`): the entry's `portrait` at 4:5 beside its `tagline`, the title again at `text-h1` as the band's `h2`, and the facts in two columns at the foot. The facts gain a service row that links to its page, and follow the reference's order: area, location, service, year, then client, storeys, LOD, software, duration. An absent fact has no row.
- **Rooms** (`ProjectRooms`, one band): `accent-deep` (Coffee) fill, labelled by one `sr-only` `h2`, `project-room-heading` (`detail.roomsHeading`). From `lg` the photos take two of three columns, on the left, and the words one, at least a screen tall. Every room's name is listed at the top, and the work list of the room on show sits at the foot under a "What we did" label. Below `lg` the photos come first at 4:3 and the words follow. Only `heading` (6.47:1) and `ink` (4.77:1) are words on Coffee.
- **Photos**: every room's, in content order, in one `carousel-track`, a sideways scroller with one photo per view that snaps, with the scrollbar hidden only once the script runs. With two or more photos, round arrow buttons sit at the photo's bottom corners. They are named from content, ship `no-js:hidden`, and step one photo and wrap. The next photo is read from `scrollLeft` on each press, so a swipe never puts the arrows out of step. Under reduced motion they jump.
- **Words in step**: when the photo on show belongs to another room, by arrow or swipe, its name turns from `ink` to `heading` with a rule sliding in, and its work list replaces the last, the items fading and rising in 60ms apart (CSS transitions in the `room-name` and `room-work` utilities, toggled by `data-active`; no animation dependency). With no script every work list shows, each under its room's name.
- **Content**: `projects` drops `writeUp` and `gallery`, and gains `tagline`, `intro` (1 to 4 paragraphs with marks), `portrait` (a gallery photo, `alt` required), and `rooms` (1 to 6, each with a `name`, a `workload` of 1 to 8 items, and 1 to 9 `photos`). `projectPage.detail` drops `backLink`, `factsHeading`, and `galleryHeading`, and gains `discoverLabel`, `factLabels.service`, `roomsHeading`, `workloadLabel`, and `photoControls` (`previous`, `next`). Everything stays strict.
- **Removed**: the project `IntroBand`, `ProjectCover`, `ProjectStory`, `ProjectPhotos`, and `wall.ts`. They were used only by this page.
- **Motion**: `SplitBand`'s CSS entrance on load. The overview and the rooms band reveal on scroll, and the page imports `reveal.ts` and `room-carousel.ts`.

## Rationale

- One rooms band with every photo in one carousel (the engineer's revision of one band per room): one heading, one place to browse. The words follow the photo rather than staying fixed, so each room keeps its own work list.
- The text animation is CSS transitions, not `motion`: the swap is a class change, as `carousel.ts`'s crossfade is, and `motion` stays limited to the four scripts that already import it.
- A native scroller rather than a crossfade like `carousel.ts`: touch swipes for free, and with no script every photo is still reachable. The arrows are the only enhancement.
- Coffee as a band fill extends its existing role (the service card wash, which already carries `heading` words). Coffee is still never a word.

## Verification (2026-10-12)

`pnpm check`, `pnpm lint`, and `pnpm build` pass, with one HTML file per route and no `astro-island` on a detail page. Checked in Chrome on the `wrangler dev` build:

- At 1440px and 390px there is no sideways scroll, and there are no console errors.
- On Riverside Offices (3 rooms, 8 photos), the arrows step through photos 0 to 7, wrap to 0, then step back to 7. The active name and work list change exactly at each room boundary (Facade, then Atrium from photo 4, then Stair cores from photo 6), and only one work list is ever visible.
- A swipe (a scroll of the track) moves the words the same way.
- College Hall (one photo) renders no arrows.
- With JavaScript off, the arrows are hidden, the track scrolls with its scrollbar, and all three work lists show under their room names.
- Under reduced motion, an arrow press jumps at once and the words swap without moving.
- After scrolling through, no revealed element stays hidden.
- Each page has one `h1`, then `h2`s for the overview, the rooms band (`project-room-heading`, the only room id), and the closing band.
