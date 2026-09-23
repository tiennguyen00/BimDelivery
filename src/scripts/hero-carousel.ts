/**
 * The home hero's photo carousel.
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * `Hero.astro` renders every photo stacked, with the first one showing and the
 * rest transparent and hidden from assistive tech. With no JavaScript, or a
 * failed script, the visitor sees the first photo and no controls, which is
 * the hero as it was before the carousel.
 *
 * Once running it reveals the controls (one dot per photo, plus the previous
 * and next arrows), crossfades to the next photo every `INTERVAL_MS`, and
 * replays the heading's entrance with each change so the panel arrives with
 * the photo rather than sitting still through all of them.
 * There is no pause button. Instead the slideshow holds still while the
 * pointer is over the band or keyboard focus is inside it, so whoever is
 * reading or using the controls is never interrupted. A visitor who asks for
 * less motion never gets the autoplay at all; the dots and arrows still work,
 * and `global.css` already cuts the fade to an instant swap.
 *
 * Writes go through `setAttribute` and `classList`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */

/** Long enough to read the panel over each photo before it changes. */
const INTERVAL_MS = 6000;

/**
 * The heading's entrance, in the scroll reveal's language (`reveal.ts`: 24px,
 * 600ms, ease out), so the two moving things on the page match. Shorter than
 * the 1s crossfade, so the words settle while the photo is still arriving.
 */
const HEADING_RISE_PX = 24;
const HEADING_DURATION_MS = 600;

/** The index `step` places away, wrapping at both ends. */
const stepIndex = (index: number, step: number, count: number): number =>
  (index + step + count) % count;

const nextIndex = (index: number, count: number): number =>
  stepIndex(index, 1, count);

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setUp = (root: HTMLElement): void => {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-hero-dot]')];
  const controls = root.querySelector<HTMLElement>('[data-hero-controls]');
  const arrows = [
    ...root.querySelectorAll<HTMLButtonElement>('[data-hero-arrow]'),
  ];
  const heading = root.querySelector<HTMLElement>('[data-hero-heading]');
  if (slides.length < 2 || !controls) return;

  // State lives in this closure, one carousel per call.
  let current = 0;
  let timer: number | undefined;
  let hovered = false;
  let focused = false;
  /** One reduced motion answer for the band: no slideshow, and no entrance. */
  const animates = wantsMotion();

  const show = (index: number): void => {
    current = index;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('opacity-100', active);
      slide.classList.toggle('opacity-0', !active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === index));
    });
  };

  /**
   * The heading fading in and rising into place, replayed on each change.
   *
   * Web Animations straight from the browser, not a class swap and not the
   * `motion` package: the hero is the largest contentful paint, so this script
   * stays dependency free, and a fresh call simply supersedes the one running,
   * so a quick run of arrow clicks needs no restart dance. The animation does
   * not fill, so the moment it ends the heading is back on its own styles with
   * nothing left inline, the same promise the scroll reveal makes.
   *
   * The `global.css` reduced motion cut does not reach a Web Animation, which
   * is why this asks `animates` itself.
   */
  const playHeading = (): void => {
    if (!heading || !animates) return;
    heading.animate(
      [
        { opacity: '0', translate: `0 ${HEADING_RISE_PX}px` },
        { opacity: '1', translate: 'none' },
      ],
      { duration: HEADING_DURATION_MS, easing: 'ease-out' },
    );
  };

  /**
   * A photo change after the first: the photo swaps and the heading arrives
   * with it. `show` on its own is the quiet form, for the first paint.
   */
  const change = (index: number): void => {
    show(index);
    playHeading();
  };

  /** Starts, restarts, or stops the clock to match the current state. */
  const sync = (): void => {
    window.clearInterval(timer);
    timer = undefined;
    if (!animates || hovered || focused) return;
    timer = window.setInterval(() => {
      change(nextIndex(current, slides.length));
    }, INTERVAL_MS);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      change(index);
      // Restart the clock, so the chosen photo gets its full turn.
      sync();
    });
  });

  arrows.forEach((arrow) => {
    const step = arrow.dataset.heroArrow === 'prev' ? -1 : 1;
    arrow.addEventListener('click', () => {
      change(stepIndex(current, step, slides.length));
      sync();
    });
  });

  root.addEventListener('pointerenter', () => {
    hovered = true;
    sync();
  });
  root.addEventListener('pointerleave', () => {
    hovered = false;
    sync();
  });
  root.addEventListener('focusin', () => {
    focused = true;
    sync();
  });
  root.addEventListener('focusout', (event) => {
    focused = root.contains(event.relatedTarget as Node | null);
    sync();
  });

  show(0);
  controls.classList.remove('invisible');
  arrows.forEach((arrow) => arrow.classList.remove('invisible'));
  sync();
};

document.querySelectorAll<HTMLElement>('[data-hero-carousel]').forEach(setUp);

// Makes this file a module, so its names stay private instead of sharing one
// global scope with the other scripts (`counters.ts` also has `wantsMotion`).
export {};
