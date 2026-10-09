/**
 * Where a place on cobe's globe lands on its square canvas (spec 0017), so
 * the presence band's HTML markers can sit over the dots cobe draws.
 *
 * This copies cobe 2.0.1's own maths (its `U` and `O` in `dist/index.esm.js`)
 * for a square canvas, `scale` 1, and no `offset`, which is how
 * `src/scripts/globe.ts` creates it. cobe is pinned to that exact version in
 * `package.json`; a cobe upgrade means checking these two functions against
 * its source again.
 */

/** The globe's radius on cobe's canvas, where the canvas half width is 1. */
const RADIUS = 0.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** A place on the unit sphere, in cobe's axes. */
const toSphere = (
  lat: number,
  lon: number,
): readonly [number, number, number] => {
  const latR = toRadians(lat);
  const lonR = toRadians(lon) - Math.PI;
  const ring = Math.cos(latR);
  return [-ring * Math.cos(lonR), Math.sin(latR), ring * Math.sin(lonR)];
};

export type Projection = Readonly<{
  /** From the canvas's left edge, 0 to 1. */
  x: number;
  /** From the canvas's top edge, 0 to 1. */
  y: number;
  /** On the half of the globe facing the visitor. */
  front: boolean;
}>;

/**
 * A latitude and longitude as a point on the canvas, for the globe turned to
 * `phi` (around its axis) and tilted by `theta`.
 */
export const project = (
  lat: number,
  lon: number,
  phi: number,
  theta: number,
): Projection => {
  const [px, py, pz] = toSphere(lat, lon);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const across = (cosP * px + sinP * pz) * RADIUS;
  const up = (sinP * sinT * px + cosT * py - cosP * sinT * pz) * RADIUS;
  const depth = -sinP * cosT * px + sinT * py + cosP * cosT * pz;
  return { x: (across + 1) / 2, y: (1 - up) / 2, front: depth >= 0 };
};

/** The `phi` that turns a longitude to the middle of the globe's face. */
export const phiFacing = (lon: number): number =>
  (3 * Math.PI) / 2 - toRadians(lon);
