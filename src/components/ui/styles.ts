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
 * Both variants are identical on every dark surface, because both section
 * tones are dark. Primary is an `accent` fill carrying an `on-accent` label
 * (7.71:1), brightening to `accent-hover` on hover with the same label
 * (10.52:1). Secondary is an `accent` border and label (7.71:1 on canvas,
 * 5.04:1 on panel), filling with `accent` on hover so the label turns
 * `on-accent`.
 */
const buttonVariants: Readonly<Record<ButtonVariant, string>> = {
  primary: cx('bg-accent text-on-accent hover:bg-accent-hover'),
  secondary: cx(
    'border-2 border-accent text-accent hover:bg-accent hover:text-on-accent',
  ),
};

export const buttonClass = (variant: ButtonVariant = 'primary'): string =>
  cx(buttonBase, buttonVariants[variant]);

/**
 * The link inside `CtaBand`, the one accent band on the site (spec 0005).
 *
 * It composes `buttonBase`, so the 44px tap target, the padding, and the
 * wrapping label are shared with every other button rather than copied. What
 * it does not do is go through `buttonVariants`: on a full accent fill both
 * variants disappear, the primary's fill into the band behind it and the
 * secondary's border with it. Adding a third variant would make `Button`
 * carry a treatment only one band can ever use.
 *
 * A `canvas` fill with a `heading` label (15.83:1), lifting to `panel` on
 * hover (10.35:1). It sets no focus ring of its own: the band carries
 * `focus-contrast` (global.css), the ring for photos and accent fills, and
 * this link inherits it like anything else placed there.
 *
 * Do not reach for a background class on `<Button>` instead. Tailwind's
 * generated order decides which background utility wins, not the order the
 * classes appear in the attribute, so an override is a silent coin flip.
 */
export const ctaLinkClass = cx(
  buttonBase,
  'bg-canvas text-heading hover:bg-panel',
);

/**
 * The band frame: side gutters, vertical rhythm, and the two content widths
 * (spec 0005). `Section` uses them, and so do the bands that are not a
 * `Section` tone, `CtaBand` and the home hero, so they cannot drift apart. A
 * band that is not a `Section` tone borrows this frame; it never adds a tone
 * to `Section`.
 *
 * From `lg` up the default width is 60% of the screen, so on a desktop the
 * content sits in a centred column with generous margins. It never drops
 * below 50rem (800px), because 60% of a small laptop (about 614px at 1024)
 * would squash the four column grids. So it reads as 60% from about 1340px
 * wide, which covers the common 1440 and 1920 desktops.
 */
export const bandGutterClass = cx('px-4 md:px-6 lg:px-8');
export const bandPaddingClass = cx('py-16 md:py-20 lg:py-24');
/**
 * The bottom half of `bandPaddingClass`, for a band that follows another of
 * the same tone with no gap of its own: the Project page's gallery, which
 * sits straight under its intro (spec 0014).
 */
export const bandPaddingBottomClass = cx('pb-16 md:pb-20 lg:pb-24');
export const bandWidthClass: Readonly<Record<'default' | 'narrow', string>> = {
  default: cx('mx-auto w-full max-w-content lg:max-w-[max(75vw,50rem)]'),
  narrow: cx('mx-auto w-full max-w-narrow'),
};

/**
 * A `canvas` fill with the `field` border (5.04:1 against the fill). The
 * invalid state adds an inset ring rather than a thicker border, so the
 * outline reads as 2px while the box stays exactly the same size and nothing
 * on the page shifts. Colour never carries the error alone: the field also
 * gets `aria-invalid` and a visible message.
 */
export const fieldClass = (invalid = false): string =>
  cx(
    'min-h-11 w-full rounded-ui border bg-canvas px-3 py-2 text-body text-ink',
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
 * Field label, hint, and error, shared so every field component matches. One
 * style everywhere: every surface a field sits on is dark, so the words around
 * the box never change (`ink-muted` 5.32:1 and `error` 5.15:1 at the contact
 * form band's worst pixel).
 */
export const fieldLabelClass = cx('text-small font-semibold text-ink-strong');
export const fieldHintClass = cx('text-small text-ink-muted');
export const fieldErrorClass = cx('text-small text-error');
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
 * The pattern under a `PatternBand` (spec 0013), named by a service block's
 * `surface` in content: `stripe` is the `bg-diagonal` stripe and `dots` the
 * `bg-dots` grid, both on `canvas`. Only `PatternBand` reads it; whatever sits
 * on either takes the same band strings below.
 */
export type BandPattern = 'stripe' | 'dots';

/**
 * The service bands' words (spec 0013): `heading` headings and `ink` body
 * text, the same on both patterns (`ink` 7.78:1 at a dot's centre, 10.07:1
 * over a stripe line).
 */
export const bandHeadingClass = cx('text-heading');
export const bandBodyClass = cx('text-ink');

/**
 * A card (`FeaturesCards`) and a tile (`FeaturesSplit`): a `panel` fill with
 * a `line` border and the card's or the tile's corners. No shadow, because a
 * shadow cannot be seen on a dark page.
 */
export const bandCardClass = cx('rounded-card border border-line bg-panel');
export const bandTileClass = cx('rounded-ui border border-line bg-panel');

/**
 * A line icon's colour: `accent`, 5.15:1 at a dot's centre and 5.04:1 on a
 * `panel`.
 */
export const bandIconClass = cx('text-accent');
