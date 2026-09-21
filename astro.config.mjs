// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { styleguide } from './src/dev/styleguide-integration.ts';
import { DEFAULT_LOCALE, LOCALES } from './src/i18n/locales.ts';

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

  // Photos are internet links on Pexels (spec 0006, assumed). Allowing the one
  // host here is what lets `<Image>` download and optimise them at build like
  // a local file, so visitors get copies from this site's own origin. A link on
  // any other host is also refused by the content schema.
  image: {
    domains: ['images.pexels.com'],
  },

  // English only today, but configured from day one so a second language is a
  // content change rather than a URL migration. prefixDefaultLocale: false
  // keeps today's URLs clean (`/about-us`, not `/en/about-us`).
  // The languages come from src/i18n/locales.ts, the single list the content
  // schemas also read (spec 0002).
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },

  // Inter, the one typeface (spec 0003). Astro downloads the files at build
  // and serves them from this site's own origin, so there is no third party
  // request and no layout shift from a late swap: `optimizedFallbacks` (on by
  // default) generates a metric matched local fallback.
  //
  // `cssVariable` is what Tailwind's `--font-sans` token points at, in
  // src/styles/global.css. The weight range '400 700' pulls Inter's variable
  // font once and covers body (400), semibold (600), and headings (700).
  //
  // Note for an offline build: the first build on a new machine or in CI needs
  // network access to download the files. Astro caches them after that.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],

  // `site` is intentionally NOT set yet: the public domain is not chosen.
  // Feature 11 (SEO foundation) sets it for canonical URLs and the sitemap.
  // Left unset deliberately so a missing domain fails loudly when the sitemap
  // lands, rather than quietly emitting canonical URLs pointing at a
  // placeholder host.

  vite: {
    // Tailwind v4 runs as a Vite plugin; there is no tailwind.config file.
    // Every token lives in the `@theme` block in src/styles/global.css.
    plugins: [tailwindcss()],
  },

  // React is here for one reason: the contact form island in feature 10
  // (spec 0001). Nothing is hydrated by default, so the design system's React
  // components render to static HTML and ship no client JavaScript until that
  // one island asks for it.
  integrations: [react(), styleguide()],
});
