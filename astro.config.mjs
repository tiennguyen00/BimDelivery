// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // RENDERING INVARIANT (spec 0001): every page route must produce a real HTML
  // file at build time. Exactly one route, the future POST /api/contact
  // endpoint, may opt out with `export const prerender = false`.
  //
  // 'static' is Astro's default and means "prerender by default". It is written
  // out explicitly because flipping it to 'server' would silently turn every
  // page into a per-request render: no error, no broken page, just the loss of
  // the zero-JavaScript floor this whole stack was chosen for.
  //
  // The check that does not depend on this line: after `pnpm build`, confirm
  // dist/ contains an HTML file per page route.
  output: 'static',

  // Added at scaffold time on purpose (spec 0001). Nothing needs server
  // rendering yet; having the adapter here means the contact form endpoint is
  // a new file later, not a platform reconfiguration.
  // Adding an adapter does NOT change the prerender default above.
  adapter: cloudflare({
    // Images are optimised at BUILD time and served as plain files (spec 0001:
    // "optimised by Astro at build, at no runtime cost and no monthly bill").
    // The adapter's default, 'cloudflare-binding', would instead transform
    // images at request time through the paid Cloudflare Images binding.
    imageService: 'compile',
  }),

  // English only today, but configured from day one so a second language is a
  // content change rather than a URL migration. prefixDefaultLocale: false
  // keeps today's URLs clean (`/about-us`, not `/en/about-us`).
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: { prefixDefaultLocale: false },
  },

  // `site` is intentionally NOT set yet: the public domain is not chosen.
  // Feature 11 (SEO foundation) sets it for canonical URLs and the sitemap.
  // Left unset deliberately so a missing domain fails loudly when the sitemap
  // lands, rather than quietly emitting canonical URLs pointing at a
  // placeholder host.
});
