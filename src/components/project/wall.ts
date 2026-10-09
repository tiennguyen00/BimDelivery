/**
 * The photo wall's geometry (spec 0015), a detail page's gallery
 * (`ProjectPhotos`). The `/project` wall (`ProjectGallery`) shared it until
 * spec 0014's 2026-10-09 revision gave that wall two wider 3:2 tiles across
 * and a parallax frame; it keeps only the 8px seam in common, written out in
 * its own grid.
 *
 * Only the shape lives here: the grid, the tile frame, and the photo's
 * responsive sizes.
 *
 * Class strings are written out in full inside `cx('…')`, the `styles.ts`
 * rule, so Tailwind's scanner finds them.
 */
import { cx } from '../ui/styles';

/** One column, then two at `md`, then three at `lg`, with 8px seams. */
export const wallGridClass = cx(
  'grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3',
);

/**
 * A fixed 5:4 box, so its space is reserved before the photo arrives and
 * nothing shifts as photos load. The black fill shows only while one loads.
 * `isolate` keeps the photo (on `-z-10`) inside the tile's own stacking
 * context, clipped to the rounded corners.
 */
export const wallTileClass = cx(
  'relative isolate aspect-5/4 overflow-hidden rounded-ui bg-black',
);

/** The photo, covering its tile behind anything drawn over it. */
export const wallImageClass = cx(
  'absolute inset-0 -z-10 size-full object-cover object-center',
);

export const wallImageWidths: readonly number[] = [400, 640, 960, 1280, 1600];

/** Matches the grid: a third of the window at `lg`, a half at `md`. */
export const wallImageSizes =
  '(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw';
