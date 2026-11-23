/**
 * The FAQ's pure helpers (spec 0020): data in, strings and plain objects out.
 * No Astro import, so every one of them can run anywhere, a page at build
 * included.
 */
import { splitEmphasis } from './emphasis';

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
  /** A BCP 47 language tag: a `Locale` at build, the page's `lang` in the browser. */
  lang: string,
): string => {
  const template =
    new Intl.PluralRules(lang).select(count) === 'one'
      ? templates.one
      : templates.other;
  return template.replace('{count}', new Intl.NumberFormat(lang).format(count));
};

/** An answer with its `**` and `==` marks removed, the words unchanged. */
export const plainAnswer = (answer: string): string =>
  splitEmphasis(answer)
    .map((run) => run.text)
    .join('');

// Search

/** Combining marks, what is left of an accent once a letter is decomposed. */
const MARKS = /\p{M}/gu;

/**
 * Text as the search compares it: accents dropped ("é" to "e"), lower case,
 * and every run of white space one space. The build writes each question's
 * `data-faq-text` with this, and `src/scripts/faq.ts` runs the visitor's
 * words through the same function, so both sides always agree.
 */
export const normaliseSearch = (text: string): string =>
  text
    .normalize('NFD')
    .replace(MARKS, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** A question's `data-faq-text`: its question and plain answer, normalised. */
export const faqSearchText = (question: string, answer: string): string =>
  normaliseSearch(`${question} ${plainAnswer(answer)}`);

/**
 * True when every word of the query appears somewhere in `text`, both
 * already normalised. An empty query matches everything.
 */
export const matchesSearch = (text: string, query: string): boolean =>
  query
    .split(' ')
    .filter((word) => word !== '')
    .every((word) => text.includes(word));

// Structured data (JSON-LD), the machine readable summary search engines read

type QuestionAndAnswer = Readonly<{ question: string; answer: string }>;

/**
 * The `FAQPage` of one region page: every question the page shows, in page
 * order, each name the question exactly as shown and each answer its plain
 * text. Google only accepts FAQ markup that matches answers visible on the
 * page, so the page and this list come from the same entries.
 */
export const faqPageJsonLd = (questions: readonly QuestionAndAnswer[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: plainAnswer(item.answer) },
  })),
});

/** One step of a breadcrumb trail, with its absolute URL. */
export type BreadcrumbStep = Readonly<{ name: string; url: string }>;

/** A `BreadcrumbList`, positions counted from 1, in the order given. */
export const breadcrumbJsonLd = (steps: readonly BreadcrumbStep[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: steps.map((step, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: step.name,
    item: step.url,
  })),
});

/**
 * The text of a `<script type="application/ld+json">`. Every `<` is written
 * as its JSON escape, `<`, which parses back to the same character, so no
 * content can close the script tag or open another.
 */
export const jsonLdScript = (value: unknown): string =>
  JSON.stringify(value).replaceAll('<', '\\u003c');
