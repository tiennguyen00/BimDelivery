/**
 * Two small enhancements to the home page (spec 0005), in one module so the
 * site still ships exactly four scripts: the scroll reveal, which fades and
 * rises a band into place as it arrives, and the heading rule, which draws
 * the gold line under a section heading in the direction the visitor is
 * scrolling.
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
 * The heading rule: the gold line under a section heading draws itself in
 * the direction the visitor arrived from, and draws again every time the
 * heading comes back.
 *
 * The `heading-rule` utility in `global.css` holds the whole look and ships
 * the line full width. This half only moves `--rule-scale` between nothing
 * and full, says which edge it grows from through `--rule-origin`, and
 * writes `--rule-transition: 0s` when one change has to be instant.
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
 * Takes the rule back to nothing with no transition at all, so the
 * retraction is never seen. Both properties are written in the same call:
 * CSS reads the transition from the style a change lands in, so the pair
 * takes effect together and nothing has to be reflowed in between.
 *
 * This is both the opening write, for a heading that starts off screen, and
 * the reset once a heading has left the viewport entirely.
 */
const retract = (heading: HTMLElement): void => {
  retracted.add(heading);
  heading.style.setProperty('--rule-transition', '0s');
  heading.style.setProperty('--rule-scale', '0');
};

/**
 * Which edge the line grows from. The entry's own rectangle says where the
 * heading was at the moment it arrived: at or below the middle of the
 * viewport it came up from below, so the line runs left to right, the way
 * the page is read; above the middle the visitor is scrolling up the page,
 * so it runs back the other way. A heading already on screen when this
 * module runs is never retracted and so never draws, which is what covers an
 * anchor jump, a restored scroll position, and the back button: there is no
 * direction to read, and the rule simply stays full width.
 */
const originFor = (entry: IntersectionObserverEntry): string =>
  entry.boundingClientRect.top >= window.innerHeight / 2 ? 'left' : 'right';

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
 * The origin is only ever written here, with the rule at nothing, so the
 * flip from one edge to the other is never visible, and removing
 * `--rule-transition` hands the duration back to the utility's own default.
 */
const draw = async (
  heading: HTMLElement,
  entry: IntersectionObserverEntry,
): Promise<void> => {
  // Already full width: the heading never left the viewport, so there is
  // nothing to draw and the origin must not be touched.
  if (!retracted.has(heading)) return;

  await settlingAbove(heading);
  // The visitor can scroll it away while its block is still moving; the
  // crossing that brings it back draws it instead.
  if (!retracted.has(heading) || !isOnScreen(heading)) return;

  retracted.delete(heading);
  heading.style.removeProperty('--rule-transition');
  heading.style.setProperty('--rule-origin', originFor(entry));
  heading.style.setProperty('--rule-scale', '1');
};

/**
 * `inView` keeps watching an element only while its callback returns a
 * function. The draw watch returns this one, so that the rule draws on every
 * crossing rather than only the first; leaving the draw threshold is
 * deliberately not the moment to reset, so it has nothing to do.
 */
const keepWatching = (): void => undefined;

/**
 * Two watches on every marked heading, including one already on screen.
 *
 * The first draws, at the same threshold a block reveals at, so the two
 * moving things on a band arrive together. The second exists for its leave
 * handler alone, which fires only when no part of the heading is on screen:
 * a stricter test than the draw threshold, and the only moment at which
 * taking the rule away cannot be seen.
 */
const watch = (heading: HTMLElement): void => {
  inView(
    heading,
    (_element, entry) => {
      void draw(heading, entry);
      return keepWatching;
    },
    { amount: AMOUNT },
  );

  inView(heading, () => () => retract(heading), { amount: 'some' });
};

const startRules = (): void => {
  if (!wantsMotion()) return;

  const headings = [
    ...document.querySelectorAll<HTMLElement>('[data-heading-rule]'),
  ];

  /**
   * Only a heading that is off screen is taken back to nothing, so nothing
   * the HTML already drew is erased in front of the visitor. One already on
   * screen keeps its full width rule; its draw watch fires at once and finds
   * nothing to do, and it behaves like any other heading from its next
   * crossing.
   */
  headings.filter((heading) => !isOnScreen(heading)).forEach(retract);
  headings.forEach(watch);
};

startReveals();
startRules();
