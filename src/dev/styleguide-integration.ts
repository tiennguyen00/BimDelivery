/**
 * Puts the style guide at /styleguide under `pnpm dev`, and nowhere else
 * (spec 0003).
 *
 * The page lives in src/dev/ rather than src/pages/, so it is not a route on
 * its own. This integration injects it, and only when Astro is running the dev
 * server. `pnpm build` never sees the route, so the style guide cannot reach
 * the live site by accident, and dist/ keeps exactly one HTML file per real
 * page route.
 */
import type { AstroIntegration } from 'astro';

export const styleguide = (): AstroIntegration => ({
  name: 'styleguide-dev-only',
  hooks: {
    'astro:config:setup': ({ command, injectRoute, logger }) => {
      if (command !== 'dev') return;

      injectRoute({
        pattern: '/styleguide',
        entrypoint: './src/dev/styleguide.astro',
      });
      logger.info('Style guide available at /styleguide (dev only)');
    },
  },
});
