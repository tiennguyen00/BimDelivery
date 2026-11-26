/**
 * The few Workers runtime types the site's one on demand route uses (spec
 * 0022, `src/pages/api/contact.ts`).
 *
 * The bindings themselves (`Cloudflare.Env`) are generated from wrangler.jsonc
 * into `worker-configuration.d.ts` by `pnpm typegen`; run it again after
 * adding or renaming a binding. It reads `.dev.vars.example`, not your local
 * `.env`, so the result is the same on every machine. It runs with
 * `--include-runtime=false` on purpose: the full runtime types redeclare the
 * DOM's `Element` for HTMLRewriter, which breaks the browser scripts type
 * checked in this same project (`track.prepend(...)` in `room-carousel.ts`,
 * for one). So the runtime types the generated bindings name are declared
 * here, only as far as this site uses them.
 */

declare module 'cloudflare:workers' {
  /** The Worker's bindings and secrets, as wrangler.jsonc declares them. */
  export const env: Cloudflare.Env;
}

/** A rate limiting binding (`ratelimits` in wrangler.jsonc). */
interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** The static assets binding. The adapter uses it; the site never calls it. */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
