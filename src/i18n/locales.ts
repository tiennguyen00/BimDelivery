/**
 * The one list of languages the site supports (spec 0002).
 *
 * `content.config.ts` builds every entry's `lang` enum from it, and
 * `astro.config.mjs` reads it for `i18n`, so the two cannot drift. Adding a
 * language is one entry here plus a folder of content per collection.
 */
export const LOCALES = ['en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** The page's language: Astro's current locale when it is one we support, else the default. */
export const resolveLocale = (value: string | undefined): Locale =>
  value !== undefined && isLocale(value) ? value : DEFAULT_LOCALE;
