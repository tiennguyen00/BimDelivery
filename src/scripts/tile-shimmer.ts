/**
 * The Project page's loading shimmer (2026-10-26), on motion: while a tile's
 * photo is on its way from Sanity's image CDN, a soft `heading` band sweeps
 * across the tile's `panel` fill, and once the photo has arrived it fades in
 * over the shimmer, which then stops and hides.
 *
 * It reads three hooks, written in markup, never in content:
 *
 * - `data-tile-shimmer` on each tile, holding one `<img>`.
 * - `data-shimmer` on the layer under the photo, shipped `hidden`, so with
 *   no script, a failed one, or reduced motion the tile is its plain fill
 *   and the photo simply appears. Nothing is hidden waiting for this script.
 * - `data-shimmer-band` on the band inside it, the part that moves.
 *
 * A photo already there when the script runs (from the cache, or the first
 * row on a fast connection) is left alone, with no shimmer and no fade. A
 * lazy photo below the fold, or in a tile the filter has hidden, keeps its
 * shimmer running until the browser fetches it. Every band starts in the
 * same task, so the sweeps run in step across the wall.
 *
 * The photo's `opacity` is its own property on its own element: the hover
 * zoom is `scale` on the same `<img>`, the parallax is `transform` on its
 * frame, and the entrance and the reveal move the `<li>`. A photo that fails
 * to load stops the shimmer and shows its alt text on the fill.
 *
 * Under reduced motion nothing runs at all. Once the fade ends the inline
 * `opacity` is removed, handing the photo back to its classes.
 *
 * Writes go through `toggleAttribute`, `style.setProperty`, and
 * `removeProperty`, never property assignment, for the `no-param-reassign`
 * reason given in `counters.ts`.
 */
import { animate } from 'motion/mini';

/** One sweep: across in the first 80%, then a rest off the tile's edge. */
const SWEEP_S = 1.6;

const SWEEP_TIMES = [0, 0.8, 1];

/** The photo's fade once it has arrived. */
const FADE_S = 0.5;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A photo still to arrive, a lazy one not yet asked for included. One that
 * has already failed counts as complete, so it never waits on a shimmer.
 */
const isPending = (photo: HTMLImageElement): boolean => !photo.complete;

const shimmer = (tile: HTMLElement): void => {
  const photo = tile.querySelector('img');
  const layer = tile.querySelector<HTMLElement>('[data-shimmer]');
  const band = layer?.querySelector<HTMLElement>('[data-shimmer-band]');
  if (!photo || !layer || !band || !isPending(photo)) return;

  layer.toggleAttribute('hidden', false);
  photo.style.setProperty('opacity', '0');
  const sweep = animate(
    band,
    {
      transform: ['translateX(-100%)', 'translateX(200%)', 'translateX(200%)'],
    },
    {
      duration: SWEEP_S,
      times: SWEEP_TIMES,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  );

  const stop = (): void => {
    sweep.cancel();
    layer.toggleAttribute('hidden', true);
    photo.style.removeProperty('opacity');
  };

  photo.addEventListener(
    'load',
    () => {
      // Decoded first, so the fade never starts on a blank frame.
      void photo
        .decode()
        .catch(() => undefined)
        .then(() =>
          animate(
            photo,
            { opacity: [0, 1] },
            { duration: FADE_S, ease: 'easeOut' },
          ),
        )
        .then(stop);
    },
    { once: true },
  );
  photo.addEventListener('error', stop, { once: true });
};

const startShimmer = (): void => {
  if (!wantsMotion()) return;
  document
    .querySelectorAll<HTMLElement>('[data-tile-shimmer]')
    .forEach(shimmer);
};

startShimmer();
