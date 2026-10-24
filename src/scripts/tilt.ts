/**
 * The home showcase's 3D hover (2026-10-24), on `ProjectShowcase`, after
 * daisyUI's `hover-3d` card but following the pointer smoothly instead of
 * snapping between eight zones.
 *
 * While a mouse moves over a tile (`data-tilt`), this writes, once a frame:
 *
 * - `--tilt-axis` and `--tilt-angle`: the card turns about an axis at right
 *   angles to the pointer's offset from the tile's centre, so the edge
 *   nearest the pointer rises toward the visitor. The angle grows from 0 at
 *   the centre to `MAX_DEG` at the tile's edge, the same on a side as in a
 *   corner, as daisyUI's zones do.
 * - `--tilt-depth`: the perspective, `DEPTH` times the tile's longer side,
 *   so every pane, a tall column or a wide L, turns by the same feel.
 * - `--glare-x` and `--glare-y`: where the glare sits, the pointer itself.
 *
 * The turn, its springs, the lift, and the glare's fade are CSS in the
 * component. The tile's link never moves, so the measurements are of a box
 * that stands still while the card tilts above it.
 *
 * On leaving, the CSS springs the card back to no transform at all; the
 * properties stay while the glare fades where it was, then are all
 * removed, so nothing stays inline.
 * Mouse only, since a touch has no hover to follow, and nothing at all under
 * reduced motion.
 */

/** The largest turn, at the tile's edge. daisyUI's own. */
const MAX_DEG = 10;

/** The perspective as a multiple of the tile's longer side, daisyUI's ratio. */
const DEPTH = 4;

/**
 * How long to keep the properties after leaving: past the glare's 400ms
 * fade and the card's 500ms spring back.
 */
const SETTLE_MS = 600;

const PROPERTIES = [
  '--tilt-axis',
  '--tilt-angle',
  '--tilt-depth',
  '--glare-x',
  '--glare-y',
] as const;

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Offset = readonly [dx: number, dy: number];

/** The pointer's offset from the box's centre, each axis -0.5 to 0.5. */
const offsetIn = (box: DOMRect, x: number, y: number): Offset => [
  Math.min(0.5, Math.max(-0.5, (x - box.left) / box.width - 0.5)),
  Math.min(0.5, Math.max(-0.5, (y - box.top) / box.height - 0.5)),
];

/**
 * The turn for an offset. The axis is the offset turned a quarter, so the
 * near edge comes forward; the angle follows the offset's larger axis, so a
 * corner turns no further than a side.
 */
const turn = ([dx, dy]: Offset): Readonly<{ axis: string; angle: string }> => {
  const reach = Math.min(1, 2 * Math.max(Math.abs(dx), Math.abs(dy)));
  return reach === 0
    ? { axis: '1, 0', angle: '0deg' }
    : {
        axis: `${(2 * dy).toFixed(3)}, ${(-2 * dx).toFixed(3)}`,
        angle: `${(reach * MAX_DEG).toFixed(2)}deg`,
      };
};

const follow = (tile: HTMLElement): void => {
  let frame = 0;
  let settle = 0;
  let pointer: Readonly<{ x: number; y: number }> | undefined;

  const draw = (): void => {
    frame = 0;
    if (!pointer) return;
    const box = tile.getBoundingClientRect();
    const offset = offsetIn(box, pointer.x, pointer.y);
    const { axis, angle } = turn(offset);
    tile.style.setProperty('--tilt-axis', axis);
    tile.style.setProperty('--tilt-angle', angle);
    tile.style.setProperty(
      '--tilt-depth',
      `${Math.round(DEPTH * Math.max(box.width, box.height))}px`,
    );
    tile.style.setProperty(
      '--glare-x',
      `${((offset[0] + 0.5) * 100).toFixed(1)}%`,
    );
    tile.style.setProperty(
      '--glare-y',
      `${((offset[1] + 0.5) * 100).toFixed(1)}%`,
    );
  };

  const clear = (): void => {
    settle = 0;
    PROPERTIES.forEach((name) => tile.style.removeProperty(name));
  };

  tile.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    window.clearTimeout(settle);
    settle = 0;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame === 0) frame = requestAnimationFrame(draw);
  });

  tile.addEventListener('pointerleave', () => {
    pointer = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    window.clearTimeout(settle);
    settle = window.setTimeout(clear, SETTLE_MS);
  });
};

const init = (): void => {
  if (!wantsMotion()) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach(follow);
};

init();

/** Makes this file a module, so its `init` does not clash with the other scripts. */
export {};
