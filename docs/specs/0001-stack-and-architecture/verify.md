# Verify: Stack & architecture · spec 0001 · updated 2026-09-19
_This spec is a decision record with no numbered acceptance criteria, so these steps come from the scope's "Done when" for feature 1 and from the spec's rendering invariant. `/check verify` runs these; `/test` locks the ones worth keeping._

## Commands
- [ ] `pnpm install` on a clean clone → finishes with no blocked build scripts and no supply chain policy errors → DW-2
- [ ] `pnpm check` → 0 errors, 0 warnings → DW-2
- [ ] `pnpm build` → build log shows `output: "static"` and `mode: "static"` → DW-2, INV
- [ ] After the build, list `dist/client/**/*.html` → one HTML file for every page route (today that is `index.html` only). If a page route has no HTML file, the rendering config is wrong, whatever `astro.config.mjs` says → INV
- [ ] `dist/server/` holds nothing but the `.prerender` helper → no route renders on demand yet → INV
- [ ] `pnpm exec wrangler deploy --dry-run` → reads assets from `dist/client`; the bindings list shows `SESSION` only, with no `IMAGES` (images are optimised at build, per the spec) → DW-2

## UI / manual
- [ ] `pnpm dev`, open `http://localhost:4321/` → page loads and shows "BIM Delivery" as the heading → DW-2
- [ ] View the raw page source (not devtools) → the heading and paragraph text are already in the HTML the server sent, and there are no `<script>` tags → DW-3

## Recheck triggers
Run the INV steps again after any change to the adapter, `output`, or the adapter's version. The spec calls that change the one most likely to silently flip the site to rendering on every request.

## Coverage
- DW-1 (stack recorded in a spec) → spec 0001 exists; nothing to run
- DW-2 (empty scaffold boots locally and builds clean) → install, check, build, dry run, dev server steps
- DW-3 (text already in the HTML the server sends) → raw page source step
- INV (rendering invariant, spec 0001) → build log, `dist/client` HTML, `dist/server` empty
