# Verify: About Us page, capability band entrance · spec 0012 · updated 2026-09-25

_Steps derived from spec 0012's acceptance criteria (ratified 2026-09-25). `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Open `/about-us` at 1920x1080 and watch the capability band on load → the start column, then the end column, fade in and rise 24px over 600ms, 80ms apart, starting after the about band's last number → AC-1
- [x] Repeat at 1440x900 and 1366x768 → same entrance on load → AC-1
- [x] Change the number of items in the `stats` entry, rebuild, reload at 1920x1080 → the columns' `--entrance-step` is `2 + stats.length` and `2 + stats.length + 1`, so they still start right after the last number → AC-2
- [x] Open `/about-us` at 390x844 → both columns sit below the fold at opacity 0; scroll down slowly → they reveal one after the other, and once settled each column keeps only its `--entrance-step` inline style (no leftover `opacity` or `transform`) → AC-3
- [x] Reload at 390x844 while scrolled to the bottom → the band is fully shown, nothing stays hidden → AC-3
- [x] Load `/about-us` at 1920x1080 with JavaScript disabled → the entrance still plays and the band ends fully shown → AC-6
- [x] Load `/about-us` at 1920x1080 with `prefers-reduced-motion: reduce` → nothing moves, the band is fully shown from the first frame → AC-6
- [x] While the band moves on load, check the certification band below and the footer → nothing around the band shifts → AC-7
- [x] Open `/about-us` at 768x1024 → a column at least partly on screen at load rises by the entrance, and a column entirely below the fold reveals on scroll → AC-4
- [x] At 1920x1080 watch the capability heading's gold rule on load → it stays full width while its column rises; at 390x844 scroll down to it → the rule draws → AC-5
- [x] Search `src/` for `entrance` → only the about band's elements and the two capability columns carry it, and only the columns sit inside a scroll reveal hook; the `global.css` comment, `docs/design.md`, and spec 0010 AC-13 name the exception → AC-8

## Commands

- [x] `pnpm check` → 0 errors → gates
- [x] `pnpm lint` and `pnpm format:check` → clean → gates
- [x] `pnpm build` → 8 pages built, `dist/client/about-us/index.html` exists → gates

## Acceptance criteria coverage

- AC-1 (on load entrance at desktop sizes, after the numbers): steps 1 and 2
- AC-2 (steps follow `stats`): step 3
- AC-3 (scroll reveal at 390x844): steps 4 and 5
- AC-4 (one column layout, each column on its own): step 9
- AC-5 (heading rule): step 10
- AC-6 (JavaScript off, reduced motion): steps 6 and 7
- AC-7 (nothing shifts): step 8
- AC-8 (the exception written down, no other pairing): step 11
