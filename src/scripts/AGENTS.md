# src/scripts

The site's plain browser scripts. Each one is a TypeScript module that a component or page pulls in with its own `<script>` block, and Astro bundles it. No framework, no React.

## Files

- `nav.ts`: the services dropdown and the mobile menu (spec 0004). `DESKTOP_QUERY` mirrors Tailwind's `lg` and the `--header-h` media query in `src/layouts/PageLayout.astro`; nothing enforces that the three agree.
- `counters.ts`: the stat counter (spec 0005), reads `data-count-to` and `data-locale`.
- `hero-carousel.ts`: the home hero's crossfade and its scrim panel entrance, on the browser's own Web Animations.
- `reveal.ts`: two separate halves (spec 0005). The scroll reveal (`data-reveal`, `data-reveal-stagger`) fades and rises a band once. The heading rule (`data-heading-rule`, look from the `heading-rule` utility in `src/styles/global.css`) draws the gold line on the way down and takes it back on the way up, every crossing.
- `typewriter.ts`: the intro heading's typing (spec 0009, assumed), reads `data-words`.

## Conventions

- Enhance markup that is already complete. The built HTML shows the finished state (full numbers, open nav panels, every band visible, every rule full width), so with no JavaScript, a failed script, or reduced motion the page is whole. No CSS rule hides anything waiting for a script.
- Reduced motion is a full stop: check `prefers-reduced-motion: reduce` first and move nothing.
- Leave nothing inline once an animation ends, so hover styles and classes own the element again.
- Hooks are `data-` attributes written in markup, never in content. A page that does not import a script leaves its hooks inert.
- Write to the DOM through `style.setProperty` / `removeProperty`, `setAttribute`, `classList`, or `replaceChildren`, never property assignment, because ESLint's `no-param-reassign` flags it (the reason is written in `counters.ts`).
- `motion` is imported here only, and only by `reveal.ts`: `animate` from `motion/mini` and `inView`, nothing else from the package.
- Timings follow the scroll reveal's language where things move together: 24px rise, 600ms, ease out. Behaviour changes are written down in `docs/design.md` under Focus and motion.

_Drafted by /sync from the introducing change, worth a quick human pass._
