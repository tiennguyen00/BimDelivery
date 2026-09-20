/**
 * The stat counter (spec 0005).
 *
 * Like `nav.ts`, this module enhances markup that is already correct.
 * `StatsBand.astro` renders the finished, grouped numbers at build time, so
 * with no JavaScript, with a failed script, or with reduced motion asked for,
 * the visitor simply sees the final figures. Nothing here is load bearing.
 *
 * It reads two attributes the band writes, because neither is recoverable from
 * the page alone:
 *
 * - `data-count-to` on each number, the raw value. Parsing "1,200" back into
 *   1200 would mean re-implementing the grouping rules of every locale.
 * - `data-locale` on the band, the page's language. A browser script cannot
 *   see `Astro.currentLocale`, and formatting with the visitor's own locale
 *   would make the counting frames disagree with the number the page shipped.
 *
 * The animation runs once per band, on the first time a quarter of it is on
 * screen, and the observer stops watching immediately afterwards.
 */

/** Fires when a quarter of the band is on screen, which reads as "arrived". */
const THRESHOLD = 0.25;

const DURATION_MS = 1200;

/**
 * Ease out cubic: fast at the start, settling into the final figure. A linear
 * count reads mechanical, and an ease in looks broken for the first third.
 */
const easeOut = (t: number): number => 1 - (1 - t) ** 3;

/** The numbers inside one band, paired with the value each counts to. */
type Target = Readonly<{ element: HTMLElement; value: number }>;

const targetsIn = (band: Element): readonly Target[] =>
  [...band.querySelectorAll<HTMLElement>('[data-count-to]')].flatMap(
    (element) => {
      const value = Number(element.dataset.countTo);
      return Number.isFinite(value) ? [{ element, value }] : [];
    },
  );

/**
 * Counts every number in one band up to its value, then writes the exact
 * figures one last time. The final write is deliberate rather than trusting
 * the last frame: a `requestAnimationFrame` run can end fractionally short,
 * and the number the visitor is left looking at has to be the right one.
 */
const countUp = (band: Element): void => {
  const targets = targetsIn(band);
  if (targets.length === 0) return;

  const format = new Intl.NumberFormat(
    (band as HTMLElement).dataset.locale || undefined,
  );
  const started = performance.now();
  /**
   * `replaceChildren` rather than assigning to `textContent`, so the write is
   * a method call on the node. The project forbids assigning to a property of
   * a parameter (`no-param-reassign` with `props: true`), which is the same
   * reason `nav.ts` reaches for `setAttribute`.
   */
  const write = (target: Target, value: number): void => {
    target.element.replaceChildren(format.format(value));
  };

  const frame = (now: number): void => {
    const progress = Math.min((now - started) / DURATION_MS, 1);
    const eased = easeOut(progress);

    targets.forEach((target) => {
      write(target, Math.round(target.value * eased));
    });

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }
    targets.forEach((target) => write(target, target.value));
  };

  requestAnimationFrame(frame);
};

/**
 * Nothing runs when the visitor has asked for less motion. This is a full stop
 * rather than the 0.01ms cut in `global.css`, because that rule only reaches
 * CSS transitions and this count is a script writing text.
 */
const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const start = (): void => {
  const bands = document.querySelectorAll('[data-stats-band]');
  if (bands.length === 0 || !wantsMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Unobserve first, so a band can never be counted twice.
        observer.unobserve(entry.target);
        countUp(entry.target);
      });
    },
    { threshold: THRESHOLD },
  );

  bands.forEach((band) => observer.observe(band));
};

start();
