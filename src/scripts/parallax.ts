/**
 * The Project page's tile parallax (spec 0014, revised 2026-10-09): as a tile
 * crosses the screen, its photo slides inside the frame, slower than the
 * page, and its title and summary drift the other way, a little faster, so
 * the three layers (frame, photo, words) read at three depths.
 *
 * Built on motion's `scroll()`, which scrubs an animation by scroll progress:
 * on the browser's own scroll timeline where it has one (Chrome, Edge,
 * Safari), off the main thread, and by its own scroll tracking elsewhere
 * (Firefox), so every browser gets the effect.
 *
 * Progress runs from the moment a tile's top edge enters at the bottom of
 * the viewport (`start end`) to the moment its bottom edge leaves at the top
 * (`end start`). Halfway, with the tile mid screen, both layers sit exactly
 * in their place, so a tile read at rest looks like the still design.
 *
 * - The photo's frame (`data-parallax-photo`, the `parallax-photo` utility)
 *   travels from 14% of its height above its place to 14% below. The script
 *   marks the tile `data-parallax-on` first, which grows the frame 20% past
 *   the tile at the top and the bottom: 14% of a frame 140% as tall as the
 *   tile is the 20% of room, so the photo's edge never shows.
 * - The words (`data-parallax-text`) travel 24px each way, inside the tile's
 *   own padding. Their link's `::after` reaches 24px past them
 *   (`after:-inset-6`), so the whole tile stays clickable wherever they are.
 *
 * Like the other scripts it only enhances: with no JavaScript, a failed
 * script, or reduced motion asked for (checked first, a full stop), nothing
 * is marked or moved and the tile is the still design. A tile the filter
 * hides keeps its animation, and picks up from wherever the page has
 * scrolled to when it comes back.
 *
 * The hover zoom moves the `Image` inside the frame by `scale`, and the load
 * entrance and the scroll reveal move the `<li>`, so no two motions share an
 * element and property.
 *
 * Writes go through `setAttribute`, never property assignment, for the
 * `no-param-reassign` reason given in `counters.ts`; the moving itself is
 * motion's.
 */
import { scroll } from 'motion';
import { animate } from 'motion/mini';

/** How far the photo's frame travels each way, as a share of its height. */
const PHOTO_TRAVEL = '28%';

/** How far the words travel each way. */
const TEXT_TRAVEL = '24px';

/** Scroll progress from the tile entering at the bottom to leaving at the top. */
const ACROSS_THE_SCREEN = ['start end', 'end start'] as const;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One layer of one tile, scrubbed by the tile's own scroll progress, from
 * `from` to `to`. Linear, because scroll is the easing: the layer moves
 * exactly as fast as the visitor scrolls.
 */
const drift = (
  layer: HTMLElement,
  tile: HTMLElement,
  from: string,
  to: string,
): void => {
  scroll(
    animate(
      layer,
      { transform: [`translateY(${from})`, `translateY(${to})`] },
      { ease: 'linear' },
    ),
    { target: tile, offset: [...ACROSS_THE_SCREEN] },
  );
};

const startParallax = (): void => {
  if (!wantsMotion()) return;

  document
    .querySelectorAll<HTMLElement>('[data-parallax-photo]')
    .forEach((photo) => {
      const tile = photo.parentElement;
      if (!tile) return;

      tile.setAttribute('data-parallax-on', '');
      drift(photo, tile, `-${PHOTO_TRAVEL}`, PHOTO_TRAVEL);

      const text = tile.querySelector<HTMLElement>('[data-parallax-text]');
      if (text) drift(text, tile, TEXT_TRAVEL, `-${TEXT_TRAVEL}`);
    });
};

startParallax();
