/**
 * The load entrance on a service band's reveal units (spec 0013): spec
 * 0012's "entrance plus scroll reveal" rule, generalised from the About
 * capability band to whichever block comes right after a service intro.
 *
 * A reveal unit is an element carrying `data-reveal`, or a direct child of a
 * `data-reveal-stagger` container. When the route passes `entranceFrom`, each
 * unit also takes the `entrance` utility at its own step, counting up from
 * it in reading order: the band moves by the entrance on a screen where it
 * starts in view at load, where the scroll reveal leaves it alone, and by
 * the scroll reveal below the fold, where the entrance plays unseen
 * underneath. The two never fight: the entrance moves `translate`, the
 * scroll reveal `transform` and `opacity` inline.
 *
 * Without `entranceFrom` both return nothing and the unit does not move on
 * load.
 *
 * It lives in `ui` because spec 0014 shared it with the Project page's
 * gallery. That page's animations are all motion's now (2026-10-09), so its
 * first row takes a `data-enter` step for `src/scripts/enter.ts` instead, and
 * the service bands are the helpers' one caller.
 */

export const entranceClass = (
  entranceFrom: number | undefined,
): string | undefined => (entranceFrom === undefined ? undefined : 'entrance');

/** The unit's `--entrance-step`, `unit` places after `entranceFrom`. */
export const entranceStyle = (
  entranceFrom: number | undefined,
  unit: number,
): string | undefined =>
  entranceFrom === undefined
    ? undefined
    : `--entrance-step: ${entranceFrom + unit}`;
