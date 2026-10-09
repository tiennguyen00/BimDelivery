# src/scripts

The site's plain browser scripts. Each one is a TypeScript module that a component or page pulls in with its own `<script>` block, and Astro bundles it. No framework, no React.

## Files

- `nav.ts`: the services dropdown and the mobile menu (spec 0004). `DESKTOP_QUERY` mirrors Tailwind's `lg` and the `--header-h` media query in `src/layouts/PageLayout.astro`; nothing enforces that the three agree.
- `counters.ts`: the stat counter (spec 0005), reads `data-count-to` and `data-locale`.
- `hero-carousel.ts`: the home hero's crossfade and its scrim panel entrance, on the browser's own Web Animations.
- `reveal.ts`: two separate halves (spec 0005). The scroll reveal (`data-reveal`, `data-reveal-stagger`) fades and rises a band once. The heading rule (`data-heading-rule`, look from the `heading-rule` utility in `src/styles/global.css`) draws the gold line on the way down and takes it back on the way up, every crossing.
- `parallax.ts`: the Project page's tile parallax (spec 0014, revised 2026-10-09), on motion's `scroll()`. Reads `data-parallax-photo` (the photo's frame) and `data-parallax-text` (the words) inside each tile, and marks the tile `data-parallax-on`, which grows the frame (`parallax-photo` in `global.css`) so the sliding photo never shows its edge.
- `enter.ts`: the Project page's load entrance on motion (2026-10-09). Reads `data-enter` (the step, 80ms each), held at opacity 0 from the first paint by the `data-enter` rule in `global.css` (2s failsafe), and marks each element `data-entered`. Leaves an element below the fold to `reveal.ts`, so it is imported after it.
- `hero-scroll.ts`: the Project page hero's scroll (2026-10-09), on motion's `scroll()`. Reads `data-hero-scroll` (the band) and `data-hero-layer` (each block of words, a wrapper of its own so it never shares an element with the entrance): the layers rise and spread apart, staggered, and fade to 0.5; the header (`data-site-header`) slides away by its sticky `top` and fades, and is marked `inert` once gone. All scrubbed, so scrolling up reverses it.
- `typewriter.ts`: the intro heading's typing (spec 0009, assumed), reads `data-words`.
- `project-filter.ts`: the Project page's filter (spec 0014, revised 2026-10-09). Reads `data-project-filter` (the form, holding the list's id), `data-project-filter-status`, and `data-project-filter-empty`; matches each form field's `name` against the same `data-` attribute on every tile, so a new filter is markup only. Its form ships `no-js:hidden`.

## Conventions

- Enhance markup that is already complete. The built HTML shows the finished state (full numbers, open nav panels, every band visible, every rule full width), so with no JavaScript, a failed script, or reduced motion the page is whole. No CSS rule hides anything waiting for a script, with one written exception: the `data-enter` hold in `global.css`, bounded by the `js` class, reduced motion, and a 2s failsafe.
- Reduced motion is a full stop: check `prefers-reduced-motion: reduce` first and move nothing.
- Leave nothing inline once an animation ends, so hover styles and classes own the element again.
- Hooks are `data-` attributes written in markup, never in content. A page that does not import a script leaves its hooks inert.
- Write to the DOM through `style.setProperty` / `removeProperty`, `setAttribute`, `classList`, or `replaceChildren`, never property assignment, because ESLint's `no-param-reassign` flags it (the reason is written in `counters.ts`).
- `motion` is imported here only: by `reveal.ts` (`animate` from `motion/mini` and `inView`), by `parallax.ts` and `hero-scroll.ts` (`animate` from `motion/mini` and `scroll`), and by `enter.ts` (`animate` from `motion/mini`), nothing else from the package.
- A `scroll()` offset Motion can map to a named view timeline range (`start end`/`end start`, `start start`/`end start`, ...) runs on the browser's `ViewTimeline`, which insets the viewport by the page's `scroll-padding-top` (104px on desktop). Write the offset as numbers (`'0 0'`) when it must measure against the real viewport.
- Never animate `transform` or `translate` on the header: a running transform animation makes it the containing block of the fixed mobile menu panel, even when overridden.
- Timings follow the scroll reveal's language where things move together: 24px rise, 600ms, ease out. Behaviour changes are written down in `docs/design.md` under Focus and motion.

_Drafted by /sync from the introducing change, worth a quick human pass._
