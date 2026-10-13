/**
 * The back to top link's visibility, on every page (`PageLayout`).
 *
 * The link itself needs no script: it is an anchor to `#main`, glided by
 * `scroll-behavior: smooth`. This only hides it near the top of the page,
 * where it has nothing to do, by toggling `data-shown`; the CSS in
 * `PageLayout` draws both states.
 */

/** Shown once the visitor is this many viewport heights down the page. */
const SHOW_AFTER = 0.8;

const init = (): void => {
  const link = document.querySelector<HTMLElement>('[data-back-to-top]');
  if (!link) return;

  let shown = false;
  let queued = false;

  const update = (): void => {
    queued = false;
    const next = window.scrollY > window.innerHeight * SHOW_AFTER;
    if (next === shown) return;
    shown = next;
    if (next) link.setAttribute('data-shown', '');
    else link.removeAttribute('data-shown');
  };

  /** One check per frame, however many scroll events the frame brings. */
  const schedule = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  // A reload or a back navigation can restore the page mid scroll.
  update();
};

init();

/** Makes this file a module, so its `init` does not clash with the other scripts. */
export {};
