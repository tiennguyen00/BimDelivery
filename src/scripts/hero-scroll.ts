/**
 * The Project page hero's scroll (2026-10-09), on motion's `scroll()`, which
 * scrubs an animation by scroll progress: as the visitor scrolls down out of
 * the hero, its words spread apart and rise, and the header slides away.
 * Scrolling back up plays both backwards, exactly, to the still design at
 * the top of the page. Unlike `parallax.ts`, it runs on motion's own scroll
 * tracking in every browser (`ACROSS_THE_HERO` says why), and the scroll is
 * the easing (linear).
 *
 * It reads two hooks, written in markup, never in content:
 *
 * - `data-hero-scroll` on the hero band, whose scroll progress drives both.
 * - `data-hero-layer` on each block of words inside it, top to bottom (the
 *   `h1`, the intro, the filter). Each layer is a wrapper of its own, because
 *   the block inside takes the load entrance (`enter.ts`) by `transform` and
 *   `opacity`, and no two motions may share an element and property.
 *
 * And it finds the site header by `data-site-header`.
 *
 * The words: progress runs from the top of the page to the hero's bottom
 * edge leaving at the top of the viewport. Layer i of n rises
 * `MAX_RISE_PX * (n - i) / n` beyond the scroll, so the top layer rises the
 * most and the gaps between them open up as they go, and waits
 * `i * STAGGER` of the progress before it starts, so they set off one after
 * another. Each fades to `FADE_TO`, not to nothing: the words thin out, they
 * do not vanish.
 *
 * The header: over the first half of the same scroll it slides up by its own
 * height and fades out, so it is gone by the time the hero is half way off
 * screen and stays gone below the hero, until the visitor scrolls back up
 * into it. Once fully gone it is marked `inert`, so a header nobody can see
 * takes no click and no tab stop; the mark goes the moment it starts to come
 * back.
 *
 * It slides by its sticky `top`, never `transform` or `translate`: the
 * mobile menu's panel is `position: fixed` inside it, and an element with a
 * transform animation running is its fixed children's containing block even
 * while its value is overridden, which would shrink the open panel to the
 * header's own box. `top` makes no containing block. While the menu is open,
 * `Header.astro` puts `top` and `opacity` back to rest with `!important`,
 * which beats any animation.
 *
 * Like the other scripts it only enhances: with no JavaScript, a failed
 * script, or reduced motion asked for (checked first, a full stop), nothing
 * moves and the hero and the header are the still design.
 *
 * Writes go through `toggleAttribute`, never property assignment, for the
 * `no-param-reassign` reason given in `counters.ts`; the moving itself is
 * motion's.
 */
import { scroll } from 'motion';
import { animate } from 'motion/mini';

/** How far the top layer rises beyond the scroll; the others rise less. */
const MAX_RISE_PX = 240;

/** The share of the progress each layer waits after the one above it. */
const STAGGER = 0.1;

/** How far the words fade by the hero's end. */
const FADE_TO = 0.5;

/**
 * From the top of the page to the hero's bottom edge leaving the viewport:
 * `start start` to `end start`, written as numbers on purpose. Motion hands
 * the named pair to the browser's `ViewTimeline` as its `exit` range, and a
 * native view timeline insets the viewport by the page's
 * `scroll-padding-top` (`PageLayout`, the header's height plus 1.5rem), so
 * the words would already be 104px into their move at the top of the page.
 * Motion tracks the numeric form itself, against the real viewport, as it
 * does `HEADER_GONE`.
 */
const ACROSS_THE_HERO = ['0 0', '1 0'] as const;

/** The header is gone by the time the hero is half way off screen. */
const HEADER_GONE = ['start start', 'center start'] as const;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One layer, still until its turn and then rising and fading to the end of
 * the hero's scroll.
 */
const spread = (
  layer: HTMLElement,
  hero: HTMLElement,
  index: number,
  count: number,
): void => {
  const rise = (MAX_RISE_PX * (count - index)) / count;
  const start = index * STAGGER;

  scroll(
    animate(
      layer,
      {
        transform: [
          'translateY(0px)',
          'translateY(0px)',
          `translateY(-${rise}px)`,
        ],
        opacity: [1, 1, FADE_TO],
      },
      { ease: 'linear', times: [0, start, 1] },
    ),
    { target: hero, offset: [...ACROSS_THE_HERO] },
  );
};

const hideHeader = (header: HTMLElement, hero: HTMLElement): void => {
  scroll(
    animate(
      header,
      {
        top: ['0px', 'calc(-1 * var(--header-h))'],
        opacity: [1, 0],
      },
      { ease: 'linear' },
    ),
    { target: hero, offset: [...HEADER_GONE] },
  );

  scroll(
    (progress: number) => {
      const gone = progress >= 1;
      if (header.hasAttribute('inert') !== gone) {
        header.toggleAttribute('inert', gone);
      }
    },
    { target: hero, offset: [...HEADER_GONE] },
  );
};

const startHeroScroll = (): void => {
  if (!wantsMotion()) return;

  const hero = document.querySelector<HTMLElement>('[data-hero-scroll]');
  if (!hero) return;

  const layers = [...hero.querySelectorAll<HTMLElement>('[data-hero-layer]')];
  layers.forEach((layer, index) => {
    spread(layer, hero, index, layers.length);
  });

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (header) hideHeader(header, hero);
};

startHeroScroll();
