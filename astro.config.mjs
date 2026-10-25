// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
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

  // Photos outside projects are internet links on Pexels (spec 0006, now
  // superseded for projects by spec 0019). Allowing the one host here is what
  // lets `<Image>` download and optimise them at build like a local file, so
  // visitors get copies from this site's own origin. A link on any other host
  // is also refused by the content schema. Project photos come from Sanity's
  // image CDN instead, drawn as plain `<img srcset>` by `Photo.astro`, so
  // `cdn.sanity.io` needs no entry here.
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

  // The site's two typefaces, both serif (the client asked for serif
  // throughout, 2026-10-16): EB Garamond for body copy and UI, and Playfair
  // Display for headings and display numerals (2026-10-11). Astro
  // downloads the files at build and serves them from this site's own origin,
  // so there is no third party request and no layout shift from a late swap:
  // `optimizedFallbacks` (on by default) generates a metric matched local
  // fallback.
  //
  // Each `cssVariable` is what a Tailwind font token points at, in
  // src/styles/global.css: `--font-body` for EB Garamond, `--font-display`
  // for Playfair. Each weight range pulls the variable font once: EB Garamond
  // covers body (400), semibold (600), and bold (700); Playfair the regular
  // numerals (400) up to bold headings (700).
  //
  // Note for an offline build: the first build on a new machine or in CI needs
  // network access to download the files. Astro caches them after that.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'EB Garamond',
      cssVariable: '--font-garamond',
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Playfair Display',
      cssVariable: '--font-playfair',
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
  ],

  // Astro's typed env schema, the one way code reads configuration (AGENTS.md).
  env: {
    schema: {
      // The contact form's Cloudflare Turnstile widget (spec 0011). A site key
      // is public by design and is inlined into the page's JavaScript at
      // build, so it must exist wherever the build runs: `.env.development`
      // holds Cloudflare's always passing test key for `pnpm dev`, a local
      // `.env` holds one for `pnpm build`, and the live Worker's build
      // variables hold the real key. No default, so a build without it fails
      // rather than shipping a widget that can never pass.
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
      }),

      // Projects come from Sanity (spec 0019), read once per build by the
      // `projects` loader in src/content.config.ts. The project id and the
      // dataset are public (they sit in every photo address), so they have
      // defaults and `pnpm dev`, `pnpm build`, and CI need no env file. The
      // id is also written in studio/project.ts; change both together.
      SANITY_PROJECT_ID: envField.string({
        context: 'server',
        access: 'public',
        default: 'bfqofid8',
      }),
      SANITY_DATASET: envField.string({
        context: 'server',
        access: 'public',
        default: 'production',
      }),
      // `published` for production; `drafts` only in the preview job, which
      // builds the dev link with every current draft.
      SANITY_PERSPECTIVE: envField.enum({
        context: 'server',
        access: 'public',
        values: ['published', 'drafts'],
        default: 'published',
      }),
      // A Viewer token, needed only to read drafts. Held by the preview job
      // alone; a production build reads published content with no token.
      SANITY_READ_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      // On only from a manual run's `lenient` input: an invalid published
      // project is left out with a warning instead of failing the build.
      SANITY_LENIENT: envField.boolean({
        context: 'server',
        access: 'public',
        default: false,
      }),
      // True on every build that is not production (the preview job and
      // manual dev link deploys): every page gets `noindex`.
      SITE_NOINDEX: envField.boolean({
        context: 'server',
        access: 'public',
        default: false,
      }),
    },
  },

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
