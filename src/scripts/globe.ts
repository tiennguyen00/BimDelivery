/**
 * The presence band's globe (spec 0017): a dotted globe drawn by cobe that
 * the visitor turns by dragging, with the band's office and project markers
 * riding on it.
 *
 * Like every script here it enhances finished markup. The built HTML shows
 * the flat map with every marker, and that stays the picture with no
 * JavaScript, with no WebGL, or if anything here fails.
 *
 * Cost is the point of most of what follows:
 *
 * - cobe (about 6 kB gzipped) is imported only when the band comes within
 *   `LOAD_MARGIN` of the viewport.
 * - cobe 2 has no loop of its own and draws once per `update()`. Frames run
 *   only while the globe is on screen, the tab is visible, and something
 *   moves: a drag, the coast after a fling, or the idle spin. With reduced
 *   motion asked for there is no spin and no coast, so an idle globe draws
 *   nothing at all.
 * - The device pixel ratio is capped at `MAX_DPR`.
 * - Markers move by `translate` only, and `data-front` is written only when
 *   it changes.
 *
 * Writes go through `style.setProperty`, `setAttribute`, and
 * `toggleAttribute`, never property assignment, for the `no-param-reassign`
 * reason given in `counters.ts`.
 */
import type { COBEOptions, Globe } from 'cobe';
import { phiFacing, project } from '../lib/globe';

/** How far ahead of the viewport cobe starts loading. */
const LOAD_MARGIN = '400px 0px';

const MAX_DPR = 2;

/** The resting tilt, and how far a vertical drag may tilt, in radians. */
const THETA = 0.3;
const THETA_MIN = -0.3;
const THETA_MAX = 0.8;

/** The idle spin, in radians per millisecond: one turn in about a minute. */
const SPIN = 0.0001;

/** A drag across the whole globe turns it half way round. */
const DRAG_TURN = Math.PI;

/** The coast after a fling: its speed kept per 16ms, and where it stops. */
const FRICTION = 0.94;
const MIN_VELOCITY = 0.00002;

/** The markers' first pop, one after another, once the globe fades in. */
const POP_AFTER = 350;
const POP_STEP = 40;

/**
 * How long the globe keeps drawing after it is created, whether anything
 * moves or not. cobe decodes its land texture after `createGlobe` returns and
 * does not draw again when it lands, so with reduced motion (no spin) the
 * globe would otherwise stay an empty sphere until the first drag.
 */
const SETTLE = 800;

/**
 * The look, tuned on `canvas` (`#0c1519`): land dots in the warm grey of
 * `ink-muted` (`#b8aca3`), a faint grid of the same over the sea, and a rim of
 * glow a little lighter than `raised`. cobe draws no markers of its own; the
 * HTML markers are the only ones.
 */
const LOOK: Omit<
  COBEOptions,
  'width' | 'height' | 'phi' | 'theta' | 'devicePixelRatio'
> = {
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 3,
  mapBaseBrightness: 0.12,
  baseColor: [0.72, 0.67, 0.64],
  markerColor: [0, 0, 0],
  glowColor: [0.2, 0.25, 0.27],
  markers: [],
};

/** A full stop, like the other scripts: reduced motion means nothing moves. */
const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Marker = Readonly<{
  element: HTMLElement;
  office: boolean;
  lat: number;
  lon: number;
}>;

const readMarkers = (box: HTMLElement): readonly Marker[] =>
  [...box.querySelectorAll<HTMLElement>('[data-globe-marker]')].map(
    (element) => ({
      element,
      office: element.dataset.kind === 'office',
      lat: Number(element.dataset.lat),
      lon: Number(element.dataset.lon),
    }),
  );

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * cobe writes a `<style>` into `<head>` on every `update()`, for CSS anchor
 * positioning of markers with an `id`. These markers have none, so it only
 * ever holds an empty `:root{}`, but rewriting it would still restyle the
 * whole page every frame. Taken out of the document, the writes cost nothing;
 * cobe's `destroy()` still removes it cleanly.
 */
const detachCobeStyle = (before: Element | null): void => {
  const added = document.head.lastElementChild;
  if (added !== before && added instanceof HTMLStyleElement) added.remove();
};

const start = async (box: HTMLElement): Promise<void> => {
  const canvas = box.querySelector<HTMLCanvasElement>('[data-globe-canvas]');
  const layer = box.querySelector<HTMLElement>('[data-globe-layer]');
  const frame = canvas?.parentElement;
  if (!canvas || !layer || !frame) return;

  const { default: createGlobe } = await import('cobe');

  const markers = readMarkers(box);
  const motion = wantsMotion();
  // The globe opens facing the first office, the headquarters by convention.
  const facing = markers.find((marker) => marker.office) ?? markers[0];

  let size = frame.clientWidth;
  let phi = phiFacing(facing?.lon ?? 0);
  let theta = THETA;
  /** The coast's speed, in radians per millisecond. */
  let velocity = 0;
  let drag: { x: number; y: number; time: number } | undefined;
  let hovered = false;
  let onScreen = false;
  let popped = false;
  /** Milliseconds of drawing still owed to the settle, see `SETTLE`. */
  let settle = SETTLE;
  let frameId = 0;
  let last = 0;

  const headBefore = document.head.lastElementChild;
  const globe: Globe = createGlobe(canvas, {
    ...LOOK,
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, MAX_DPR),
    width: size,
    height: size,
    phi,
    theta,
  });

  // cobe wraps the canvas in a div of its own only once WebGL and its
  // shaders are working. Without that, the flat map stays.
  if (canvas.parentElement === frame) {
    globe.destroy();
    return;
  }
  detachCobeStyle(headBefore);

  const place = (): void => {
    markers.forEach(({ element, lat, lon }) => {
      const { x, y, front } = project(lat, lon, phi, theta);
      element.style.setProperty('translate', `${x * size}px ${y * size}px`);
      const shown = front && popped;
      if (shown !== element.hasAttribute('data-front')) {
        element.toggleAttribute('data-front', shown);
      }
    });
  };

  const draw = (): void => {
    globe.update({ phi, theta });
    place();
  };

  const moving = (): boolean =>
    settle > 0 || drag !== undefined || velocity !== 0 || (motion && !hovered);

  const tick = (now: number): void => {
    frameId = 0;
    const step = last === 0 ? 16 : Math.min(now - last, 64);
    last = now;
    settle -= step;
    if (!drag) {
      if (velocity !== 0) {
        phi += velocity * step;
        velocity *= FRICTION ** (step / 16);
        if (Math.abs(velocity) < MIN_VELOCITY) velocity = 0;
      } else if (motion && !hovered) {
        phi += SPIN * step;
      }
    }
    draw();
    schedule();
  };

  const schedule = (): void => {
    if (onScreen && !document.hidden && moving()) {
      if (frameId === 0) frameId = requestAnimationFrame(tick);
    } else {
      if (frameId !== 0) cancelAnimationFrame(frameId);
      frameId = 0;
      last = 0;
    }
  };

  layer.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    layer.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    velocity = 0;
    schedule();
  });

  layer.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const turn = ((event.clientX - drag.x) / size) * DRAG_TURN;
    const tilt = ((event.clientY - drag.y) / size) * DRAG_TURN;
    const elapsed = Math.max(event.timeStamp - drag.time, 1);
    phi += turn;
    theta = clamp(theta + tilt, THETA_MIN, THETA_MAX);
    velocity = motion ? turn / elapsed : 0;
    drag = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    schedule();
  });

  const release = (event: PointerEvent): void => {
    if (!drag) return;
    // A pause before letting go is not a fling.
    if (event.timeStamp - drag.time > 80) velocity = 0;
    drag = undefined;
    schedule();
  };
  layer.addEventListener('pointerup', release);
  layer.addEventListener('pointercancel', release);

  // The spin waits while a mouse is over the globe, so a name can be read.
  layer.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') hovered = true;
  });
  layer.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    schedule();
  });

  new ResizeObserver(() => {
    size = frame.clientWidth;
    globe.update({ width: size, height: size });
    place();
  }).observe(frame);

  // The first pop, staggered, once the globe is on screen and has faded in a
  // little. The delays come off again so a marker turning to the front later
  // pops at once.
  const pop = (): void => {
    popped = true;
    markers.forEach(({ element }, index) => {
      element.style.setProperty('transition-delay', `${index * POP_STEP}ms`);
    });
    place();
    window.setTimeout(
      () => {
        markers.forEach(({ element }) =>
          element.style.removeProperty('transition-delay'),
        );
      },
      markers.length * POP_STEP + 400,
    );
  };

  new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    if (onScreen && !popped) window.setTimeout(pop, POP_AFTER);
    schedule();
  }).observe(box);

  document.addEventListener('visibilitychange', schedule);

  draw();
  box.setAttribute('data-globe-on', '');
};

document.querySelectorAll<HTMLElement>('[data-globe]').forEach((box) => {
  const loader = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      loader.disconnect();
      start(box).catch(() => undefined);
    },
    { rootMargin: LOAD_MARGIN },
  );
  loader.observe(box);
});
