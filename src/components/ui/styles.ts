/**
 * The class strings the Astro and React versions of a component share
 * (spec 0003), so a `Button` looks the same whichever one a page reaches for.
 *
 * Two rules hold this file together, and both exist because Tailwind reads
 * source files as plain text rather than running them:
 *
 * 1. Every class string is written out in full, inside a `cx('…')` call. A
 *    class assembled from fragments (`` `bg-${tone}` ``) is invisible to
 *    Tailwind's scanner, so the CSS is simply never generated and the element
 *    renders unstyled with no error anywhere.
 * 2. `cx` is registered in .prettierrc.json under `tailwindFunctions`, which
 *    is what lets the Prettier plugin sort the classes inside these calls the
 *    same way it sorts a `class` attribute.
 */

/** Joins class parts, dropping anything falsy. */
export const cx = (...parts: readonly (string | false | undefined)[]): string =>
  parts.filter(Boolean).join(' ');

export type ButtonVariant = 'primary' | 'secondary';

/**
 * Shared by every button: 44px minimum height for a comfortable tap target,
 * and a label that may wrap on a narrow screen rather than being clipped.
 */
const buttonBase = cx(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-ui px-5 py-2.5 text-body font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
);

/**
 * Both variants are identical on white and on tint, because both section tones
 * are light. Primary is the brand gold FILL carrying a black label (8.73:1);
 * secondary is the only gold that may be a border or a word, `gold-ink`
 * (5.05:1 on white), and fills with the brand gold on hover so the brand
 * colour lands on the interaction while the label stays at 8.73:1.
 */
const buttonVariants: Readonly<Record<ButtonVariant, string>> = {
  primary: cx('bg-gold text-black hover:bg-gold-deep'),
  secondary: cx(
    'border-2 border-gold-ink text-gold-ink hover:bg-gold hover:text-black',
  ),
};

export const buttonClass = (variant: ButtonVariant = 'primary'): string =>
  cx(buttonBase, buttonVariants[variant]);

/**
 * The invalid state adds an inset ring rather than a thicker border, so the
 * outline reads as 2px while the box stays exactly the same size and nothing
 * on the page shifts. Colour never carries the error alone: the field also
 * gets `aria-invalid` and a visible message.
 */
export const fieldClass = (invalid = false): string =>
  cx(
    'min-h-11 w-full rounded-ui border bg-white px-3 py-2 text-body text-ink',
    invalid ? 'border-error ring-1 ring-error ring-inset' : 'border-field',
  );

/** Field label, hint, and error, shared so the two field components match. */
export const fieldLabelClass = cx('text-small font-semibold text-ink-strong');
export const fieldHintClass = cx('text-small text-ink-muted');
export const fieldErrorClass = cx('text-small text-error');
export const fieldWrapperClass = cx('flex flex-col gap-1.5');
