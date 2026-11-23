/**
 * The FAQ's pure helpers (spec 0020): data in, strings and plain objects out.
 * No Astro import, so every one of them can run anywhere, a page at build
 * included.
 */
import type { Locale } from '../i18n/locales';

/** A count line's two templates, each with a `{count}` slot. */
export type CountTemplates = Readonly<{ one: string; other: string }>;

/**
 * "10 questions": the template the language's plural rules pick, `one` or
 * `other` (any other category falls back to `other`), with the number
 * formatted for the language. The search script builds the same line in the
 * browser (`src/scripts/faq.ts`).
 */
export const countLine = (
  templates: CountTemplates,
  count: number,
  lang: Locale,
): string => {
  const template =
    new Intl.PluralRules(lang).select(count) === 'one'
      ? templates.one
      : templates.other;
  return template.replace('{count}', new Intl.NumberFormat(lang).format(count));
};
