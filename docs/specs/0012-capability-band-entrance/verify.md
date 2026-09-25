# Verify: About Us page, capability band entrance · spec 0012 · updated 2026-09-25

_Steps derived from spec 0012's requirements (it has no IDed acceptance criteria yet, so each step names the requirement it checks). `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Open `/about-us` at 1920x1080 and watch the capability band on load → the start column, then the end column, fade in and rise 24px over 600ms, 80ms apart, starting after the about band's last number → R1
- [ ] Repeat at 1440x900 and 1366x768 → same entrance on load → R1
- [ ] Change the number of items in the `stats` entry, rebuild, reload at 1920x1080 → the columns' `--entrance-step` is `2 + stats.length` and `2 + stats.length + 1`, so they still start right after the last number → R1
- [ ] Open `/about-us` at 390x844 → both columns sit below the fold at opacity 0; scroll down slowly → they reveal one after the other, and once settled each column keeps only its `--entrance-step` inline style (no leftover `opacity` or `transform`) → R2
- [ ] Reload at 390x844 while scrolled to the bottom → the band is fully shown, nothing stays hidden → R2
- [ ] Load `/about-us` at 1920x1080 with JavaScript disabled → the entrance still plays and the band ends fully shown → R3
- [ ] Load `/about-us` at 1920x1080 with `prefers-reduced-motion: reduce` → nothing moves, the band is fully shown from the first frame → R3
- [ ] While the band moves on load, check the certification band below and the footer → nothing around the band shifts → R4

## Commands

- [ ] `pnpm check` → 0 errors → gates
- [ ] `pnpm lint` and `pnpm format:check` → clean → gates
- [ ] `pnpm build` → 8 pages built, `dist/client/about-us/index.html` exists → gates

## Requirements coverage

- R1 (on load entrance at desktop sizes, after the numbers): steps 1 to 3
- R2 (scroll reveal at 390x844): steps 4 and 5
- R3 (JavaScript off, reduced motion): steps 6 and 7
- R4 (nothing shifts): step 8
