# 0017. The presence band's interactive globe, on cobe

**Date**: 2026-10-09
**Status**: Accepted
**Authorized by**: tiennguyen00 ("replace the current map with a global 3D globe model that users can rotate by clicking and dragging", red markers for projects, green for offices; colours chosen for the globe only, dummy locations until real ones are supplied)

## Summary

The presence band's flat dotted world map becomes a dotted 3D globe that the visitor can turn by dragging. Green markers show the headquarters and offices, red markers show project locations, and each marker pops up as it turns into view. The globe is drawn by `cobe` (about 6 kB gzipped), loaded only when the band comes near the viewport. The flat map stays as the picture without JavaScript or WebGL. This adds a third animation dependency, so the rule naming `motion` and `lenis` as the only ones changes.

## Context

- **Performance.** The band sits below the fold on the home page and on every service page. The heavy route (three.js with globe.gl, roughly 200 to 300 kB gzipped) costs far more than a decorative band is worth.
- **A WebGL loop is the real cost**, not the download: a globe redrawn 60 times a second drains a phone's battery while nobody looks at it.
- **Touch.** A drag that turns the globe must not stop the page scrolling.
- **The site's script conventions** (`src/scripts/AGENTS.md`): the built HTML is complete without JavaScript, reduced motion moves nothing, and no CSS rule hides content waiting for a script.
- **Colour.** The brand palette has no green, and its red is the form error colour. The engineer chose to keep the globe's two marker colours out of the palette.

## Decision

`cobe` 2.0.1, pinned exactly, draws the globe in `src/scripts/globe.ts`, a plain script with no framework. The markers are HTML laid over the canvas, placed each frame by a pure projection in `src/lib/globe.ts` that copies cobe's own maths.

- **Draw on demand.** cobe 2 has no render loop of its own and draws once per `update()`. The script runs a `requestAnimationFrame` loop only while the band is on screen, the tab is visible, and something moves (dragging, the coast after a fling, the idle spin). With reduced motion asked for there is no spin and no coast, so the idle globe draws nothing.
- **Load late.** `import('cobe')` runs when an `IntersectionObserver` sees the band within 400px of the viewport.
- **No reflow on swap.** With the `js` class on `html` (set in the head before first paint) the map's box is square from the first paint, with the flat map centred in it. The globe fades in over the flat map in the same box, so nothing moves when it arrives. Without JavaScript the box is the flat map's own size.
- **Fallback.** If WebGL or cobe's shaders fail, the flat map stays. The script tells by looking for the wrapper div cobe adds around the canvas only on success.
- **No style churn.** Every `update()` rewrites a `<style>` element cobe puts in `<head>` for its CSS anchor feature, which would recalculate the page's styles 60 times a second. The globe gives its markers no `id`, so that element only ever holds an empty `:root{}`. The script detaches it from the document after creating the globe.
- **Drag.** Pointer events on the box: a horizontal drag turns the globe (`phi`), and a vertical drag tilts it within a small range (`theta`). The canvas carries `touch-action: pan-y`, so on a phone a vertical swipe still scrolls the page. The idle spin pauses while a mouse is over the globe, so a label can be read.
- **Device pixel ratio** capped at 2.
- **Markers.** Offices are a 14px green (`#3ddc97`) dot with a pulsing halo (Tailwind's `animate-ping`, `motion-safe` only) and their name always shown. Projects are a 10px red (`#ff5d52`) dot whose name shows on hover. Shape and size differ as well as colour, and the green is much lighter than the red, so the two kinds still read apart for visitors who cannot tell red from green. A marker on the far side of the globe shrinks and fades out, and it pops back (scale with a slight overshoot, 300ms) as it turns to the front.
- **Accessibility.** The canvas, the markers, and the legend are hidden from assistive tech. The places are two real lists, one per kind, labelled by the legend's words and visually hidden.

## Content model

`presence.regions` becomes `presence.locations`: `{ name, kind: 'office' | 'project', lon, lat }`, one to 40 of them. The latitude range stays 84 to minus 56 because the flat fallback map stops there. `presence.legend: { offices, projects }` holds the legend's words. The home page ships placeholder locations until the real ones are supplied.

## Acceptance criteria

- **AC-1**: On the home page and a service page with the map layout, the presence band shows a dotted globe that turns slowly on its own, with green office markers (names shown) and red project markers.
- **AC-2**: Dragging with a mouse turns the globe and tilts it within limits; letting go of a fling coasts to a stop; the spin pauses while the mouse is over the globe.
- **AC-3**: On a touch screen a horizontal drag turns the globe and a vertical swipe scrolls the page.
- **AC-4**: A marker turning to the far side fades out, and pops back as it returns. Hovering a project marker shows its name.
- **AC-5**: `cobe` is not requested until the band is near the viewport, and no frames are drawn while the band is off screen or the tab is hidden.
- **AC-6**: With reduced motion, the globe does not spin, coast, or pulse, but dragging still turns it.
- **AC-7**: With JavaScript off, the flat map shows the same markers, and nothing is hidden. With WebGL unavailable, the flat map stays.
- **AC-8**: Nothing below the band moves when the globe appears.
- **AC-9**: A screen reader hears two lists of place names, offices and projects, and nothing from the canvas.
- **AC-10**: No horizontal scroll at 360px, no console errors, and `pnpm check`, `pnpm lint`, and `pnpm build` run clean.

Supersedes spec 0005 AC-25 to AC-27 (the six region cap and the region labels on the flat map) and the map part of spec 0007.

## Options considered

1. **cobe** (chosen): about 6 kB gzipped, its dotted look matches the current map, it draws on demand, and it is MIT licensed. It has no built-in drag, so the script adds about 100 lines.
2. **three.js with globe.gl**: very capable, but 30 to 50 times the size for a decorative band.
3. **d3-geo orthographic on a 2D canvas**: about 30 kB, needs the land data shipped and the dots projected by hand every frame on the main thread.
4. **Keep the flat map**: free, but it is not what was asked for.

## Code area

- `src/scripts/globe.ts` (new), `src/lib/globe.ts` (new)
- `src/components/ui/PresenceBand.astro`, `src/components/service/PresenceMap.astro`, `src/pages/index.astro`
- `src/content.config.ts`, `src/content/home/en/home.yaml`, `src/content/README.md`
- `package.json` (`cobe`), `AGENTS.md`, `src/scripts/AGENTS.md`, `docs/design.md`
