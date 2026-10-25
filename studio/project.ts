/**
 * The Studio's fixed values (spec 0019). All public: the project id and the
 * dataset appear in every image address on the site anyway.
 *
 * The site reads the same project id as the default of `SANITY_PROJECT_ID`
 * in `astro.config.mjs`; a change here changes that line too.
 */
export const PROJECT_ID = 'bfqofid8';

export const DATASET = 'production';

/** A pinned date, so a Sanity API change never reaches the Studio unasked. */
export const API_VERSION = '2026-10-25';

/**
 * The dev link, where "Preview on site" builds every draft (the `preview`
 * job in `.github/workflows/deploy.yml`).
 */
export const DEV_LINK = 'https://bim-delivery-site-dev.bimdelivery.workers.dev';

/**
 * The services a room may name, by slug, with the titles editors see. A copy
 * of `src/content/services/en/*.yaml` (each file's `slug` and `title`), since
 * services still live in the repo; a new service adds a line here. The build
 * checks each room's category against the real services either way.
 */
export const CATEGORIES = [
  { value: 'architectural-bim', title: 'Architectural BIM' },
  { value: 'interior-bim', title: 'Interior BIM' },
  { value: 'landscape-bim', title: 'Landscape BIM' },
] as const;
