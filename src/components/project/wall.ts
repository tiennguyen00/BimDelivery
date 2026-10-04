/**
 * The photo wall's geometry (spec 0015), shared by the `/project` wall
 * (`ProjectGallery`) and a detail page's gallery (`ProjectPhotos`), so the
 * two walls cannot drift apart: a change here changes both.
 *
 * Only the shape lives here: the grid, the tile frame, and the photo's
 * responsive sizes. Captions, links, and hover stay in each component,
 * because a `/project` tile is a link and a gallery tile is not.
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
