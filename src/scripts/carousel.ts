/**
 * The service pages' photo carousel (spec 0013), one script for every intro
 * in the `carousel` layout. It began as the home hero's, which is now a single
 * photo (2026-10-11).
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * The component renders every photo stacked inside a `data-carousel` root,
 * with the first one showing and the rest transparent and hidden from
 * assistive tech. With no JavaScript, or a failed script, the visitor sees
 * the first photo and no controls, which is the band as it was before the
 * carousel.
 *
 * Hooks, all inside the root: `data-carousel-slide` on each photo, and
 * `data-carousel-controls` and `data-carousel-dot` from `CarouselDots`.
 *
 * Once running it reveals the dots and crossfades to the next photo every
 * `INTERVAL_MS`.
 *
 * There is no pause button. Instead the slideshow holds still while the
 * pointer is over the root or keyboard focus is inside it, so whoever is
 * reading or using the controls is never interrupted. A visitor who asks for
 * less motion never gets the autoplay at all; the dots still work,
 * and `global.css` already cuts the fade to an instant swap.
 *
 * Writes go through `setAttribute` and `classList`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */

/** Long enough to take in each photo before it changes. */
const INTERVAL_MS = 6000;

/** The next index, wrapping at the end. */
const nextIndex = (index: number, count: number): number => (index + 1) % count;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setUp = (root: HTMLElement): void => {
  const slides = [
    ...root.querySelectorAll<HTMLElement>('[data-carousel-slide]'),
  ];
  const dots = [
    ...root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'),
  ];
  const controls = root.querySelector<HTMLElement>('[data-carousel-controls]');
  if (slides.length < 2 || !controls) return;

  // State lives in this closure, one carousel per call.
  let current = 0;
  let timer: number | undefined;
  let hovered = false;
  let focused = false;
  /** One reduced motion answer for the band: no slideshow. */
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

  /** Starts, restarts, or stops the clock to match the current state. */
  const sync = (): void => {
    window.clearInterval(timer);
    timer = undefined;
    if (!animates || hovered || focused) return;
    timer = window.setInterval(() => {
      show(nextIndex(current, slides.length));
    }, INTERVAL_MS);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      // Restart the clock, so the chosen photo gets its full turn.
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
  sync();
};

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(setUp);

// Makes this file a module, so its names stay private instead of sharing one
// global scope with the other scripts (`counters.ts` also has `wantsMotion`).
export {};
