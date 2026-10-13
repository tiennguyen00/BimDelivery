/**
 * The home page's scroll aware nav underline.
 *
 * The header's server HTML underlines the page being built, which is the
 * whole story everywhere but home. Home is a tour of the other pages, so as the
 * visitor scrolls, the underline follows the band on screen: each band that
 * stands for a page carries `data-nav-section` with that page's href (set
 * through `Section`'s `navSection` prop, and the footer's, which stands for
 * Contact Us), and the top level nav links carry
 * `data-nav-item`. Above the first marked band the underline sits on the page
 * itself, which is the state the HTML shipped in.
 *
 * Only the underline moves. `aria-current="page"` stays on Home, because the
 * page the visitor is on has not changed.
 *
 * A page that does not import this leaves its hooks inert, so every other page
 * keeps the fixed underline.
 */

/** The same rule as `Header.astro`: `/about-us/` and `/about-us` match. */
const normalise = (path: string): string => path.replace(/\/+$/, '') || '/';

/**
 * A band is current once the visitor has scrolled through this share of it,
 * measured from the bottom of the viewport: that much of the band has come
 * into view. So the underline changes as a band arrives, not once the band
 * before it is finished.
 */
const SCROLLED_THROUGH = 0.4;

/** A pixel or two of slack for the rounding in `scrollY` on zoomed pages. */
const BOTTOM_SLACK = 2;

/**
 * How far the visitor has scrolled into a band: the part of it above the
 * bottom of the viewport. A band taller than the viewport counts as reached
 * once its top meets the top of the viewport, so a very tall band never
 * fills the screen under the previous band's link.
 */
const isReached = (section: HTMLElement, viewport: number): boolean => {
  const { top, height } = section.getBoundingClientRect();
  const scrolledInto = viewport - top;
  return scrolledInto >= Math.min(height * SCROLLED_THROUGH, viewport);
};

const currentHref = (
  sections: readonly HTMLElement[],
  fallback: string,
): string => {
  const root = document.documentElement;
  const viewport = window.innerHeight;
  /**
   * At the very end of the page the last band may be too short to ever be
   * scrolled far enough into, and its link would never light. The bottom of
   * the page is always the last band.
   */
  const atBottom =
    viewport + window.scrollY >= root.scrollHeight - BOTTOM_SLACK;
  const passed = atBottom
    ? sections
    : sections.filter((section) => isReached(section, viewport));
  const last = passed[passed.length - 1];
  return last ? normalise(last.dataset.navSection ?? fallback) : fallback;
};

const init = (): void => {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-nav-section]'),
  );
  const items = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[data-nav-item]'),
  );
  if (sections.length === 0 || items.length === 0) return;

  const home = normalise(window.location.pathname);
  let shown = '';
  let queued = false;

  /** Writes only when the band changes, and to both copies of the nav. */
  const update = (): void => {
    queued = false;
    const href = currentHref(sections, home);
    if (href === shown) return;
    shown = href;
    items.forEach((item) => {
      if (normalise(item.getAttribute('href') ?? '') === href) {
        item.setAttribute('data-active', '');
      } else {
        item.removeAttribute('data-active');
      }
    });
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
