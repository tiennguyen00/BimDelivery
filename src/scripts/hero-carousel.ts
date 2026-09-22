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
 * and next arrows) and crossfades to the next photo every `INTERVAL_MS`.
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
  if (slides.length < 2 || !controls) return;

  // State lives in this closure, one carousel per call.
  let current = 0;
  let timer: number | undefined;
  let hovered = false;
  let focused = false;
  const autoplay = wantsMotion();

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
    if (!autoplay || hovered || focused) return;
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

  arrows.forEach((arrow) => {
    const step = arrow.dataset.heroArrow === 'prev' ? -1 : 1;
    arrow.addEventListener('click', () => {
      show(stepIndex(current, step, slides.length));
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
