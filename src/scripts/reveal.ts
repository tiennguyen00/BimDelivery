/**
 * Two small enhancements to the home page (spec 0005), in one module so the
 * site still ships four scripts (flexiable base on other features later): the scroll reveal, which fades and
 * rises a band into place as it arrives, and the heading rule, which draws
 * the gold line under a section heading as the visitor scrolls down and
 * takes it back as they scroll up.
 *
 * The two halves are marked below and are otherwise separate. They share
 * exactly three things, and nothing else crosses between them:
 *
 * - `AMOUNT`, the share of an element that must be in view before it starts.
 * - `wantsMotion`, the one reduced motion check.
 * - `settling`, where the reveal half records each block that is still to
 *   move, so the heading half can let the block come to rest before it draws
 *   the line under its heading.
 *
 * Like `counters.ts`, neither half is load bearing. The built HTML draws
 * every band complete and every rule full width, and no CSS rule hides
 * anything waiting for a script, so with no JavaScript, with a failed
 * script, or with reduced motion asked for, the visitor sees the whole page.
 *
 * Writes go through `style.setProperty` and `removeProperty`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */
import { inView } from 'motion';
import { animate } from 'motion/mini';

/** The share of an element that must be in view before it starts. */
const AMOUNT = 0.2;

/** A full stop, like the counter: reduced motion means nothing moves. */
const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A block's fade and rise, as something a heading inside it can wait for:
 * `done` settles once the block has finished moving, and `finish` settles
 * it.
 */
type Settling = Readonly<{ done: Promise<void>; finish: () => void }>;

const deferred = (): Settling => {
  // The executor runs at once, so `finish` is set before anything reads it.
  let finish = (): void => undefined;
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });
  return { done, finish };
};

/**
 * Each hidden block against its own fade and rise. A `WeakMap`, so a block
 * that leaves the page takes its entry with it.
 *
 * The entry is made when the block is hidden, not when it starts to move: a
 * heading sits at the top of its block, so it crosses its own threshold a
 * moment before the taller block crosses the block's, and with nothing to
 * find it would draw its line under a block that is still invisible.
 */
const settling = new WeakMap<Element, Settling>();

/* ------------------------------------------------------------------------ *
 * The scroll reveal: bands below the fold fade and rise into place once, as
 * they scroll into view.
 *
 * Only this half hides anything, and only what is entirely below the
 * viewport when it starts: an element already on screen, even partly, is
 * left alone, so nothing visible blinks out and back.
 *
 * It reads two attributes written in markup, never in content:
 *
 * - `data-reveal` on an element that reveals on its own.
 * - `data-reveal-stagger` on a container whose direct children reveal one
 *   after another. Each child is watched on its own, never the container,
 *   because the container can be on screen while its later children are not
 *   (a stacked row on a phone).
 * ------------------------------------------------------------------------ */

/** How far an element starts below its place. */
const RISE_PX = 24;

const DURATION_S = 0.6;

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
  settling.set(element, deferred());
};

/**
 * Once the animation ends, motion writes the final values inline and cancels
 * its Web Animation. Removing both properties afterwards hands the element
 * back to its classes, so hover styles and layout are exactly as they were.
 *
 * A heading inside this element is waiting on it, and what it waits for is
 * the element at rest, cleanup included, not merely its last frame.
 */
const reveal = ({ element, delay }: Target): void => {
  animate(
    element,
    { opacity: 1, transform: 'none' },
    { duration: DURATION_S, delay, ease: 'easeOut' },
  ).then(() => {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
    settling.get(element)?.finish();
  });
};

const startReveals = (): void => {
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

/* ------------------------------------------------------------------------ *
 * The heading rule: the gold line under a section heading follows the
 * scroll. On the way down the page it draws itself from nothing to full
 * width, left to right; on the way back up it takes itself back from full
 * width to nothing, its right end running leftwards, the same draw played
 * in reverse. It does both every time the heading passes.
 *
 * The `heading-rule` utility in `global.css` holds the whole look and ships
 * the line full width, growing from its left edge. This half only moves
 * `--rule-scale` between nothing and full, and writes
 * `--rule-transition: 0s` when one change has to be instant.
 *
 * It reads `data-heading-rule`, written in markup and never in content,
 * exactly as `data-reveal` is. A page that does not import this module
 * leaves every one of them inert, so a later page can take the look with no
 * motion at all, or take both.
 * ------------------------------------------------------------------------ */

/** Headings whose rule is back at nothing, waiting to be drawn. */
const retracted = new WeakSet<Element>();

/** Any part of it is on screen, so taking its rule away would be seen. */
const isOnScreen = (element: Element): boolean => {
  const { top, bottom } = element.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
};

/**
 * Which way a heading went, read from a rectangle rather than a scroll
 * listener: at or below the middle of the viewport it is on the lower side,
 * so it came up from below or has just sunk back down there, which is the
 * visitor scrolling up the page.
 */
const isLow = ({ top }: DOMRectReadOnly): boolean =>
  top >= window.innerHeight / 2;

/**
 * How far above the bottom of the viewport the way back starts. The rule is
 * the foot of the heading, so a heading leaving through the viewport's own
 * bottom edge takes its rule out of sight first; a quarter of the way up
 * leaves the line on screen for the whole of its run back.
 */
const UNDRAW_MARGIN = '0px 0px -25% 0px';

/**
 * The heading left its watch through the bottom, which is the visitor
 * scrolling up. Read against the watch's own shrunk bounds, not the middle of
 * the viewport, so a heading that wraps to several lines still counts.
 */
const sankBelow = ({
  boundingClientRect,
  rootBounds,
}: IntersectionObserverEntry): boolean =>
  boundingClientRect.bottom > (rootBounds?.bottom ?? window.innerHeight);

/**
 * Takes the rule back to nothing with no transition at all, so the
 * retraction is never seen. Both properties are written in the same call:
 * CSS reads the transition from the style a change lands in, so the pair
 * takes effect together and nothing has to be reflowed in between.
 *
 * This is both the opening write, for a heading that starts below the
 * viewport, and the reset once a heading has sunk out of it entirely.
 */
const retract = (heading: HTMLElement): void => {
  retracted.add(heading);
  heading.style.setProperty('--rule-transition', '0s');
  heading.style.setProperty('--rule-scale', '0');
};

/**
 * The other instant write: the rule straight to full width, for a heading
 * that went off the top of the viewport before it could draw, because the
 * visitor scrolled past faster than its block came to rest. It is out of
 * sight, and when the visitor scrolls back up to it the rule is already
 * there, like the rule of every other heading they have passed.
 */
const complete = (heading: HTMLElement): void => {
  retracted.delete(heading);
  heading.style.setProperty('--rule-transition', '0s');
  heading.style.setProperty('--rule-scale', '1');
};

/**
 * Takes the rule back to nothing where the visitor can see it, at the
 * draw's own 600ms and ease out, so the right end runs back to the left
 * edge it grew from.
 */
const undraw = (heading: HTMLElement): void => {
  retracted.add(heading);
  heading.style.removeProperty('--rule-transition');
  heading.style.setProperty('--rule-scale', '0');
};

/**
 * The fade and rise of the block around this heading, if it has one to come.
 * Walks up from the heading, because the element that moves is an ancestor:
 * a heading is never itself a reveal target.
 */
const settlingAbove = (node: Element | null): Promise<void> | undefined =>
  node
    ? (settling.get(node)?.done ?? settlingAbove(node.parentElement))
    : undefined;

/**
 * Draws the rule, once the block it sits in has come to rest. Waiting on the
 * real animation rather than on a matching delay is what keeps the two in
 * step: a heading sits at the top of its block, so it crosses the threshold
 * before the taller block does and a fixed wait would be the wrong length.
 * A heading with no moving block draws at once, which covers the intro
 * heading, whose band never reveals, and any heading whose block was never
 * hidden. Afterwards that promise is already settled, so every later
 * crossing draws with no wait and nothing has to remember that it waited.
 *
 * Removing `--rule-transition` hands the duration back to the utility's own
 * default.
 */
const draw = async (heading: HTMLElement): Promise<void> => {
  // Already full width: the heading never left, so there is nothing to draw.
  if (!retracted.has(heading)) return;

  await settlingAbove(heading);
  // The visitor can scroll it away while its block is still moving; the
  // crossing that brings it back draws it instead.
  if (!retracted.has(heading) || !isOnScreen(heading)) return;

  retracted.delete(heading);
  heading.style.removeProperty('--rule-transition');
  heading.style.setProperty('--rule-scale', '1');
};

/**
 * `inView` keeps watching an element only while its callback returns a
 * function. The draw watch returns this one, so that the rule draws on every
 * crossing rather than only the first; leaving the draw threshold is
 * deliberately not the moment to undraw, because by then the rule, at the
 * foot of the heading, is already below the fold.
 */
const keepWatching = (): void => undefined;

/**
 * Three watches on every marked heading, including one already on screen.
 *
 * The first draws, at the same threshold a block reveals at, so the two
 * moving things on a band arrive together.
 *
 * The second is the way back. It sees the heading whole against a viewport
 * cut short by `UNDRAW_MARGIN`, so its leave handler fires the moment the
 * rule sinks below that line: the visitor is scrolling up, and the rule runs
 * back while it is still in sight. Coming whole into view again draws it,
 * which is what a visitor who scrolls up a little and then down again sees.
 * Leaving through the top of the viewport does nothing, so a heading the
 * visitor has scrolled past keeps its full rule and is already drawn when
 * they scroll back up to it.
 *
 * The third exists for its leave handler alone, which fires only when no
 * part of the heading is on screen, the one moment an instant change cannot
 * be seen. Below the viewport it resets a rule that sank out of view too
 * fast to have finished running back; above it, it completes a rule that
 * never got to draw.
 */
const watch = (heading: HTMLElement): void => {
  inView(
    heading,
    () => {
      void draw(heading);
      return keepWatching;
    },
    { amount: AMOUNT },
  );

  inView(
    heading,
    () => {
      void draw(heading);
      return (entry) => {
        if (sankBelow(entry)) undraw(heading);
      };
    },
    { amount: 'all', margin: UNDRAW_MARGIN },
  );

  inView(
    heading,
    () => (entry) => {
      if (isLow(entry.boundingClientRect)) retract(heading);
      else if (retracted.has(heading)) complete(heading);
    },
    { amount: 'some' },
  );
};

const startRules = (): void => {
  if (!wantsMotion()) return;

  const headings = [
    ...document.querySelectorAll<HTMLElement>('[data-heading-rule]'),
  ];

  /**
   * Only a heading below the viewport is taken back to nothing, so nothing
   * the HTML already drew is erased in front of the visitor, and a heading
   * above it, one the visitor is already past (a restored scroll position,
   * the back button), keeps its full rule for the way back up. One already
   * on screen keeps its full width rule; its draw watches fire at once and
   * find nothing to do, and it behaves like any other heading from its next
   * crossing.
   */
  headings
    .filter(
      (heading) =>
        !isOnScreen(heading) && isLow(heading.getBoundingClientRect()),
    )
    .forEach(retract);
  headings.forEach(watch);
};

startReveals();
startRules();
