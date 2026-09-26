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
 * The link inside `CtaBand`, the one gold band on the site (spec 0005).
 *
 * It composes `buttonBase`, so the 44px tap target, the padding, and the
 * wrapping label are shared with every other button rather than copied. What
 * it does not do is go through `buttonVariants`: on full gold both variants
 * disappear, the primary's gold fill into the band behind it and the
 * secondary's gold-ink border down to 2.10:1. Adding a third variant would
 * make `Button` carry a treatment only one band can ever use.
 *
 * Black fill, white label (21.00:1), deepening to ink-strong on hover
 * (12.63:1). It sets no focus ring of its own: the band carries
 * `focus-contrast` (global.css), the ring for every surface that is not a
 * light tone, and this link inherits it like anything else placed there.
 *
 * Do not reach for `<Button class="bg-black">` instead. Tailwind's generated
 * order decides which background utility wins, not the order the classes
 * appear in the attribute, so an override is a silent coin flip.
 */
export const ctaLinkClass = cx(
  buttonBase,
  'bg-black text-white hover:bg-ink-strong',
);

/**
 * The band frame: side gutters, vertical rhythm, and the two content widths
 * (spec 0005). `Section` uses them, and so do the two bands that are not a
 * `Section` tone, `CtaBand` and the home hero, so the three cannot drift
 * apart. A band that is not a light tone borrows this frame; it never adds a
 * tone to `Section`.
 *
 * From `lg` up the default width is 60% of the screen, so on a desktop the
 * content sits in a centred column with generous margins. It never drops
 * below 50rem (800px), because 60% of a small laptop (about 614px at 1024)
 * would squash the four column grids. So it reads as 60% from about 1340px
 * wide, which covers the common 1440 and 1920 desktops.
 */
export const bandGutterClass = cx('px-4 md:px-6 lg:px-8');
export const bandPaddingClass = cx('py-16 md:py-20 lg:py-24');
export const bandWidthClass: Readonly<Record<'default' | 'narrow', string>> = {
  default: cx('mx-auto w-full max-w-content lg:max-w-[max(75vw,50rem)]'),
  narrow: cx('mx-auto w-full max-w-narrow'),
};

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

/**
 * A native `<select>` in the same box as every other field, with the site's
 * own `chevron-down` in place of the browser's arrow (spec 0011). The arrow
 * is the `select-chevron` utility in `global.css`, so it is drawn in
 * `--color-ink` from a token and needs no bracket class here. The end
 * padding keeps a long choice clear of it.
 */
export const selectClass = (invalid = false): string =>
  cx(
    fieldClass(invalid),
    'cursor-pointer appearance-none select-chevron pe-10',
  );

/**
 * What a piece sits on: a light tone, or a dark band. One type for the form
 * fields (spec 0011) and the service bands (spec 0013), whose content files
 * name it in their `surface` field.
 *
 * For a field, the control box is identical on both: white, with the `field`
 * border and the `error` ring. Only the words around it change. On `dark`,
 * the contact page's form band, the label and hint are white (10.5:1 at the
 * band's worst point) and the error is `error-on-dark` (5.19:1), because
 * `error` and `ink` would vanish there.
 */
export type Surface = 'light' | 'dark';

/** Field label, hint, and error, shared so every field component matches. */
export const fieldLabelClass: Readonly<Record<Surface, string>> = {
  light: cx('text-small font-semibold text-ink-strong'),
  dark: cx('text-small font-semibold text-white'),
};
export const fieldHintClass: Readonly<Record<Surface, string>> = {
  light: cx('text-small text-ink-muted'),
  dark: cx('text-small text-white'),
};
export const fieldErrorClass: Readonly<Record<Surface, string>> = {
  light: cx('text-small text-error'),
  dark: cx('text-small text-error-on-dark'),
};
export const fieldWrapperClass = cx('flex flex-col gap-1.5');

/**
 * The line above a field's box: the label at the start and the hint, when
 * there is one, at the end (spec 0011). One line either way, so in a grid of
 * fields the boxes of a row line up whether or not each has a hint.
 */
export const fieldHeadClass = cx(
  'flex flex-wrap items-baseline justify-between gap-x-3',
);

/**
 * The service bands on a `PatternBand` (spec 0013), keyed by the band's
 * `surface`. A band component reads its block's `surface` and only these
 * maps, so no band names a colour that depends on what it sits on.
 *
 * On `dark`, black under the `bg-dots-dark` dots, every word is white: 15.5:1
 * at the dots' lightest pixel (`#242424`) and 18.1:1 on a `panel`. On
 * `light`, white under the `bg-diagonal` stripe, headings are black and body
 * text `ink`, which holds 4.56:1 over a stripe line; `ink-muted` would not.
 */
export const bandHeadingClass: Readonly<Record<Surface, string>> = {
  light: cx('text-black'),
  dark: cx('text-white'),
};
export const bandBodyClass: Readonly<Record<Surface, string>> = {
  light: cx('text-ink'),
  dark: cx('text-white'),
};

/**
 * A card (`FeaturesCards`) and a tile (`FeaturesSplit`): fill, border, and
 * corners. On `dark` both are a `panel` fill with a white hairline at 10
 * percent, since a shadow does not read on black; on `light` both are white
 * with the `line` border, and the larger card also lifts off the stripe with
 * `shadow-lg`.
 */
export const bandCardClass: Readonly<Record<Surface, string>> = {
  light: cx('rounded-card border border-line bg-white shadow-lg'),
  dark: cx('rounded-card border border-white/10 bg-panel'),
};
export const bandTileClass: Readonly<Record<Surface, string>> = {
  light: cx('rounded-ui border border-line bg-white'),
  dark: cx('rounded-ui border border-white/10 bg-panel'),
};

/**
 * A line icon's colour. The glyph is a stroke, which counts as a line, so on
 * a light surface it takes `gold-ink` like the presence band's `check`; on
 * black the bright gold reads (6.4:1 at the dots' lightest pixel, 7.5:1 on a
 * `panel`).
 */
export const bandIconClass: Readonly<Record<Surface, string>> = {
  light: cx('text-gold-ink'),
  dark: cx('text-gold-on-dark'),
};
