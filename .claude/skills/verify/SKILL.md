---
name: verify
description: How to build, serve, and drive this Astro site in a real browser to verify a change. Read before verifying any page.
---

# Verify recipe (BIM Delivery site)

## Serve the real build

```bash
pnpm build                                              # pages land in dist/client/ (expect 8 HTML files)
pnpm exec wrangler dev --port 8799 --ip 127.0.0.1       # serves dist/client on workerd; run in background
```

`wrangler dev` needs no login for local serving. Stop it afterwards (kill `workerd.exe` and the wrangler node process on Windows).

## Drive a browser

Playwright is not a project dependency. Install only the driver into a scratch dir and use the system Chrome:

```bash
npm i playwright-core@1.55.0          # in a scratch dir, not the repo
# chromium.launch({ channel: 'chrome', headless: true })
```

## Flows worth driving on the home page

- Hero carousel: `[data-hero-slide]` classes `opacity-100`/`opacity-0`, `[data-hero-arrow="prev|next"]`, `[data-hero-dot]` `aria-current`. Autoplay is 6 s and pauses on hover and focus.
- Scroll reveal: `[data-reveal]` and `[data-reveal-stagger] > *` start at opacity 0 below the fold; scroll slowly to the bottom and check none stay hidden.
- Counters: `[data-stats-band]` / `[data-count-to]`. Sampling text at intervals misses the animation; attach a `MutationObserver` to one number and record every value.
- Typewriter: `[data-typewriter-live]`, words from `data-words`.
- Probes that matter: `reducedMotion: 'reduce'` (no motion, final values shown), `javaScriptEnabled: false` (all content visible), 390 px width (no horizontal scroll), reload while scrolled to the bottom.

## Gotchas

- `scrollIntoViewIfNeeded` on a heading may leave the stats band under the 0.25 threshold, so the counter never fires. Scroll in steps instead.
- The sticky header card sits over the hero; check the top 80 px in screenshots.
