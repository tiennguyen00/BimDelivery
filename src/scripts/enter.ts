/**
 * The Project page's load entrance (2026-10-09), on motion: what the CSS
 * `entrance` utility does on the other pages, played by `animate` instead,
 * because every animation on the Project page is motion's. An element fades
 * from 0 and rises 24px into place over 600ms with an ease out, the scroll
 * reveal's language, waiting 80ms per step.
 *
 * It reads one hook, written in markup, never in content: `data-enter`,
 * holding the element's step (`data-enter="2"` waits 160ms). Today the
 * hero's `h1`, intro, and filter (steps 0 to 2) and the gallery's first row
 * of tiles (3 and 4).
 *
 * An entrance played by a script needs its elements hidden before the first
 * paint, which a deferred module cannot do, so this is the one written
 * exception to "no CSS rule hides anything waiting for a script": the
 * `data-enter` hold in `global.css` keeps each one at opacity 0 from the
 * first frame, keyed on the `js` class `PageLayout` sets before paint and
 * only when motion is welcome. The hold carries its own way out: after 2s it
 * shows the element anyway, so a failed or very late script costs the
 * visitor one beat, never the hero.
 *
 * This script lifts the hold the moment it runs by marking every element
 * `data-entered`, and in the same task hands each one it plays to motion,
 * whose animation holds the first keyframe through its delay (`fill: both`),
 * so nothing shows between the two. It leaves two kinds alone, marked and
 * not moved:
 *
 * - One entirely below the fold, a phone's first row of tiles: the scroll
 *   reveal (`reveal.ts`, imported first) has already hidden it inline and
 *   moves it when it arrives. Playing it here as well would fight over
 *   `opacity`.
 * - One the hold's own timeout has already shown, because this script came
 *   late: replaying it would blink it out and back.
 *
 * Under reduced motion the hold never applies and nothing moves; the
 * elements are still marked, so the page is in one state whatever happens.
 *
 * Once an element's animation ends, motion writes the final values inline;
 * removing both hands the element back to its classes, so hover styles and
 * the scroll reveal own it again.
 *
 * Writes go through `setAttribute` and `style.removeProperty`, never
 * property assignment, for the `no-param-reassign` reason given in
 * `counters.ts`.
 */
import { animate } from 'motion/mini';

/** How far an element starts below its place. */
const RISE_PX = 24;

const DURATION_S = 0.6;

/** The wait for each step, the scroll reveal's stagger. */
const STEP_S = 0.08;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Entirely below the viewport, so the scroll reveal owns it. */
const isBelowFold = (element: Element): boolean =>
  element.getBoundingClientRect().top >= window.innerHeight;

/** Still held at 0 by `global.css`, so the visitor has not seen it yet. */
const isHeld = (element: Element): boolean =>
  getComputedStyle(element).opacity === '0';

const stepOf = (element: HTMLElement): number =>
  Number(element.getAttribute('data-enter')) || 0;

const enter = (element: HTMLElement): void => {
  animate(
    element,
    {
      opacity: [0, 1],
      transform: [`translateY(${RISE_PX}px)`, 'none'],
    },
    { duration: DURATION_S, delay: stepOf(element) * STEP_S, ease: 'easeOut' },
  ).then(() => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  });
};

const startEntrance = (): void => {
  const elements = [...document.querySelectorAll<HTMLElement>('[data-enter]')];

  // Every read before any write, so the browser lays out once.
  const toPlay = wantsMotion()
    ? elements.filter((element) => !isBelowFold(element) && isHeld(element))
    : [];

  toPlay.forEach(enter);
  elements.forEach((element) => {
    element.setAttribute('data-entered', '');
  });
};

startEntrance();
