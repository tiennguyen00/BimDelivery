/**
 * The rules a project must meet, written once (spec 0019). The site's Zod
 * schema (`src/content.config.ts`) and the Sanity Studio's validation
 * (`studio/schema-types/`) both read these, so the Studio refuses what the
 * build would reject, and a limit changes in one place.
 *
 * Plain values only: the Studio bundles this file, so it may import nothing
 * from Astro.
 */

/** The levels of development a project may name (spec 0015). */
export const LOD_LEVELS = [100, 200, 300, 350, 400, 500] as const;

/**
 * Lowercase kebab case, for example `harbour-tower`: a project's slug and a
 * room's category, which is a service's slug.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Capped so a title always fits the Project page's tile caption at every
// width (spec 0014, AC-8). Loosening it means checking that again.
export const TITLE_MAX = 60;

export const YEAR_MIN = 1900;
export const YEAR_MAX = 2100;

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MIN = 50;
export const SEO_DESCRIPTION_MAX = 160;

/** The hero's paragraphs. */
export const INTRO_MAX = 4;

/** Rooms per project, work items per room, photos per room (spec 0019). */
export const ROOMS_MAX = 10;
export const WORKLOAD_MAX = 8;
export const PHOTOS_MAX = 20;
