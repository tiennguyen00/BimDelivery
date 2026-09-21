/**
 * The home hero's photo carousel.
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * `Hero.astro` renders every photo stacked, with the first one showing and the
 * rest transparent and hidden from assistive tech. With no JavaScript, or a
 * failed script, the visitor sees the first photo and no controls, which is
 * the hero as it was before the carousel.
 *
 * Once running it reveals the controls (one dot per photo, then a pause
 * button) and crossfades to the next photo every `INTERVAL_MS`. Anything that
 * moves on its own for more than five seconds needs a way to stop it (WCAG
 * 2.2.2), which is what the pause button is. A visitor who asks for less
 * motion gets the carousel paused from the start; the dots still work, and
 * `global.css` already cuts the fade to an instant swap.
 *
 * Writes go through `setAttribute` and `classList`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */

/** Long enough to read the panel over each photo before it changes. */
const INTERVAL_MS = 6000;

const nextIndex = (index: number, count: number): number => (index + 1) % count;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setUp = (root: HTMLElement): void => {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-hero-dot]')];
  const controls = root.querySelector<HTMLElement>('[data-hero-controls]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-hero-toggle]');
  if (slides.length < 2 || !controls || !toggle) return;

  // State lives in this closure, one carousel per call.
  let current = 0;
  let timer: number | undefined;

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

  const isPlaying = (): boolean => timer !== undefined;

  const renderToggle = (): void => {
    const playing = isPlaying();
    toggle.setAttribute(
      'aria-label',
      playing ? 'Pause the slideshow' : 'Play the slideshow',
    );
    toggle
      .querySelector('[data-icon="pause"]')
      ?.classList.toggle('hidden', !playing);
    toggle
      .querySelector('[data-icon="play"]')
      ?.classList.toggle('hidden', playing);
  };

  const play = (): void => {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      show(nextIndex(current, slides.length));
    }, INTERVAL_MS);
    renderToggle();
  };

  const pause = (): void => {
    window.clearInterval(timer);
    timer = undefined;
    renderToggle();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      // Restart the clock, so the chosen photo gets its full turn.
      if (isPlaying()) play();
    });
  });

  toggle.addEventListener('click', () => {
    if (isPlaying()) pause();
    else play();
  });

  show(0);
  controls.classList.remove('invisible');
  if (wantsMotion()) play();
  else renderToggle();
};

document.querySelectorAll<HTMLElement>('[data-hero-carousel]').forEach(setUp);

// Makes this file a module, so its names stay private instead of sharing one
// global scope with the other scripts (`counters.ts` also has `wantsMotion`).
export {};
