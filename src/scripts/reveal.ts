/**
 * The scroll reveal (spec 0005): bands below the fold fade and rise into place
 * once, as they scroll into view.
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * The built HTML draws every element fully visible and no CSS rule hides
 * anything, so with no JavaScript, with a failed script, or with reduced
 * motion asked for, the visitor sees the whole page. Only this script hides,
 * and only what is entirely below the viewport when it starts: an element
 * already on screen, even partly, is left alone, so nothing visible blinks
 * out and back.
 *
 * It reads two attributes written in markup, never in content:
 *
 * - `data-reveal` on an element that reveals on its own.
 * - `data-reveal-stagger` on a container whose direct children reveal one
 *   after another. Each child is watched on its own, never the container,
 *   because the container can be on screen while its later children are not
 *   (a stacked row on a phone).
 *
 * Writes go through `style.setProperty` and `removeProperty`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */
import { inView } from 'motion';
import { animate } from 'motion/mini';

/** How far an element starts below its place. */
const RISE_PX = 24;

const DURATION_S = 0.6;

/** The share of an element that must be in view before it starts. */
const AMOUNT = 0.2;

/** The wait between one stagger child and the next. */
const STAGGER_S = 0.08;

/** An element to reveal, with the wait before it starts. */
type Target = Readonly<{ element: HTMLElement; delay: number }>;

/** Entirely below the viewport, so hiding it cannot be seen. */
const isBelowFold = (element: Element): boolean =>
  element.getBoundingClientRect().top >= window.innerHeight;

const singles = (): readonly Target[] =>
  [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    .filter(isBelowFold)
    .map((element) => ({ element, delay: 0 }));

/**
 * N counts only the hidden children, so when the first cards of a row are
 * already on screen the next hidden one starts at once rather than waiting
 * behind cards that never animate.
 */
const staggered = (): readonly Target[] =>
  [...document.querySelectorAll('[data-reveal-stagger]')].flatMap((container) =>
    [...container.children]
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .filter(isBelowFold)
      .map((element, index) => ({ element, delay: index * STAGGER_S })),
  );

const hide = ({ element }: Target): void => {
  element.style.setProperty('opacity', '0');
  element.style.setProperty('transform', `translateY(${RISE_PX}px)`);
};

/**
 * Once the animation ends, motion writes the final values inline and cancels
 * its Web Animation. Removing both properties afterwards hands the element
 * back to its classes, so hover styles and layout are exactly as they were.
 */
const reveal = ({ element, delay }: Target): void => {
  animate(
    element,
    { opacity: 1, transform: 'none' },
    { duration: DURATION_S, delay, ease: 'easeOut' },
  ).then(() => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  });
};

/** A full stop, like the counter: reduced motion means nothing is hidden. */
const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const start = (): void => {
  if (!wantsMotion()) return;

  const targets = [...singles(), ...staggered()];
  targets.forEach(hide);

  targets.forEach((target) => {
    /**
     * The callback returns nothing, so `inView` stops watching the element
     * after its first entry: each one reveals once and never replays.
     */
    inView(
      target.element,
      () => {
        reveal(target);
      },
      { amount: AMOUNT },
    );
  });
};

start();
