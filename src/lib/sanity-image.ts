/**
 * Project photos from Sanity's image CDN (spec 0019): every address, size,
 * and focal point is built here from the photo's stored data, never from env,
 * because pages prerender inside workerd. Pure: data in, strings out, no
 * dependency.
 *
 * Each address asks for the editor's crop as `rect`, one width, and
 * `auto=format`, so a visitor gets WebP or AVIF at about the drawn size and
 * never the original upload.
 */

/** A crop or a focal point, each side or axis a fraction of the original. */
export type PhotoCrop = Readonly<{
  top: number;
  bottom: number;
  left: number;
  right: number;
}>;

export type PhotoHotspot = Readonly<{ x: number; y: number }>;

/**
 * A photo uploaded to Sanity, as the `projects` loader stores it. `width`
 * and `height` are the original upload's pixel size.
 */
export type SanityPhoto = Readonly<{
  source: 'sanity';
  url: string;
  width: number;
  height: number;
  alt: string;
  crop?: PhotoCrop;
  hotspot?: PhotoHotspot;
}>;

/**
 * Any photo a component may draw: a Sanity upload, or a Pexels link
 * (`{ src, alt }`, spec 0006) on the pages that have not moved yet.
 * `Photo.astro` tells them apart by the `source` literal.
 */
export type PhotoSource = SanityPhoto | Readonly<{ src: string; alt: string }>;

export const isSanityPhoto = (photo: PhotoSource): photo is SanityPhoto =>
  'source' in photo && photo.source === 'sanity';

/** The kept part of the original, in its pixels. */
export type PhotoRect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

const isCropped = (crop: PhotoCrop | undefined): crop is PhotoCrop =>
  crop !== undefined &&
  (crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0);

/**
 * The rectangle the editor kept, or the whole photo when there is no crop.
 * Rounded to whole pixels, as the CDN's `rect` wants.
 */
export const photoRect = (photo: SanityPhoto): PhotoRect => {
  const { crop, width, height } = photo;
  if (!isCropped(crop)) return { left: 0, top: 0, width, height };
  const left = Math.round(crop.left * width);
  const top = Math.round(crop.top * height);
  return {
    left,
    top,
    width: Math.max(1, Math.round((1 - crop.left - crop.right) * width)),
    height: Math.max(1, Math.round((1 - crop.top - crop.bottom) * height)),
  };
};

/** The intrinsic size the page reserves: the cropped rectangle's. */
export const photoSize = (
  photo: SanityPhoto,
): Readonly<{ width: number; height: number }> => {
  const { width, height } = photoRect(photo);
  return { width, height };
};

/** One address at `width` pixels wide. */
export const photoUrl = (photo: SanityPhoto, width: number): string => {
  const params = new URLSearchParams();
  if (isCropped(photo.crop)) {
    const rect = photoRect(photo);
    params.set(
      'rect',
      [rect.left, rect.top, rect.width, rect.height].join(','),
    );
  }
  params.set('w', String(width));
  params.set('auto', 'format');
  // `URLSearchParams` writes the commas as `%2C`; the CDN reads either.
  return `${photo.url}?${params.toString().replaceAll('%2C', ',')}`;
};

/**
 * The widths worth asking for: each step no wider than the kept rectangle,
 * or the rectangle's own width when every step is wider. A step past the
 * original would only blow it up.
 */
export const photoWidths = (
  photo: SanityPhoto,
  steps: readonly number[],
): readonly number[] => {
  const { width } = photoRect(photo);
  const fitting = steps.filter((step) => step <= width);
  return fitting.length > 0 ? fitting : [width];
};

export const photoSrcset = (
  photo: SanityPhoto,
  steps: readonly number[],
): string =>
  photoWidths(photo, steps)
    .map((width) => `${photoUrl(photo, width)} ${width}w`)
    .join(', ');

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const percent = (fraction: number): string =>
  `${Math.round(clamp01(fraction) * 1000) / 10}%`;

/**
 * The focal point inside its frame, as `object-position`. The hotspot is a
 * fraction of the original, so it is made relative to the kept rectangle
 * first. With no hotspot the photo is centred.
 */
export const photoPosition = (photo: SanityPhoto): string => {
  const { hotspot } = photo;
  if (hotspot === undefined) return '50% 50%';
  const crop = photo.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const keptX = 1 - crop.left - crop.right;
  const keptY = 1 - crop.top - crop.bottom;
  const x = keptX > 0 ? (hotspot.x - crop.left) / keptX : 0.5;
  const y = keptY > 0 ? (hotspot.y - crop.top) / keptY : 0.5;
  return `${percent(x)} ${percent(y)}`;
};
