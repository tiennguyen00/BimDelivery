/**
 * Reading Sanity at build (spec 0019): the client, the one projects query,
 * and the pure mapping from a Sanity document to the shape the `projects`
 * collection's Zod schema checks. The loader in `src/content.config.ts`
 * wires them together; nothing here runs at render, so none of it reaches
 * workerd.
 *
 * The mapping never throws on a missing or odd field. It builds a new object
 * and leaves the judging to Zod, so every problem is reported by name, the
 * same way a broken YAML entry was.
 */
import { createClient, type SanityClient } from '@sanity/client';
import {
  portableTextToMarks,
  type PortableTextBlock,
} from './portable-text-marks';

/** A pinned date, so a Sanity API change never reaches a build unasked. */
export const SANITY_API_VERSION = '2026-10-25';

export type SanityPerspective = 'published' | 'drafts';

export type SanityBuildConfig = Readonly<{
  projectId: string;
  dataset: string;
  perspective: SanityPerspective;
  token?: string;
  lenient: boolean;
}>;

export type ClientResult =
  | Readonly<{ ok: true; client: SanityClient }>
  | Readonly<{ ok: false; reason: string }>;

/**
 * A client for one perspective. Never the CDN: a build a webhook started must
 * not read a cached answer from before the change. Drafts need the token.
 */
export const sanityClient = (
  config: SanityBuildConfig,
  perspective: SanityPerspective,
): ClientResult => {
  if (perspective === 'drafts' && !config.token) {
    return {
      ok: false,
      reason:
        '[content] projects: SANITY_PERSPECTIVE is "drafts" but SANITY_READ_TOKEN is not set. Drafts can only be read with a Viewer token.',
    };
  }
  return {
    ok: true,
    client: createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
      perspective,
      ...(perspective === 'drafts' && { token: config.token }),
    }),
  };
};

/** A photo's fields: the editor's choices plus the original's address and size. */
const PHOTO = `alt, crop{ top, bottom, left, right }, hotspot{ x, y }, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height`;

/**
 * Every project, with exactly the fields the site uses (the Zod shape is
 * strict, so no `_type` or `_key` comes back).
 */
export const PROJECTS_QUERY = `*[_type == "project"]{
  _id,
  orderRank,
  lang,
  "slug": slug.current,
  title,
  summary,
  "image": image{ ${PHOTO} },
  seo{ title, description },
  location,
  year,
  client,
  floorArea,
  storeys,
  lod,
  software,
  duration,
  tagline,
  intro[]{ _type, children[]{ _type, text, marks } },
  "portrait": portrait{ ${PHOTO} },
  rooms[]{ name, category, workload, "photos": photos[]{ ${PHOTO} } }
}`;

type Raw = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A new object without the fields GROQ returned as `null` (it never omits one). */
const compact = (fields: Raw): Raw =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  );

/** `undefined` for an object left with no fields, so an emptied group reads as absent. */
const orAbsent = (fields: Raw): Raw | undefined =>
  Object.keys(fields).length > 0 ? fields : undefined;

/** The Sanity id without its `drafts.` prefix: the project's one stable id. */
export const publishedId = (id: unknown): string =>
  typeof id === 'string' ? id.replace(/^drafts\./, '') : '';

/** `<lang>/<slug>`, or `undefined` while either is missing. */
export const entryIdOf = (doc: unknown): string | undefined => {
  if (!isRecord(doc)) return undefined;
  const { lang, slug } = doc;
  return typeof lang === 'string' &&
    lang !== '' &&
    typeof slug === 'string' &&
    slug !== ''
    ? `${lang}/${slug}`
    : undefined;
};

/** How a build message names a document: its entry id and its Sanity id. */
export const documentLabel = (doc: unknown): string => {
  const sanityId = isRecord(doc) ? publishedId(doc._id) : '';
  const entryId = entryIdOf(doc);
  return entryId === undefined
    ? `Sanity _id "${sanityId}"`
    : `${entryId} (Sanity _id "${sanityId}")`;
};

const toPhoto = (raw: unknown): unknown => {
  if (!isRecord(raw)) return raw ?? undefined;
  return compact({
    source: 'sanity',
    url: raw.url,
    width: raw.width,
    height: raw.height,
    alt: raw.alt,
    crop: isRecord(raw.crop)
      ? orAbsent(
          compact({
            top: raw.crop.top,
            bottom: raw.crop.bottom,
            left: raw.crop.left,
            right: raw.crop.right,
          }),
        )
      : undefined,
    hotspot: isRecord(raw.hotspot)
      ? orAbsent(compact({ x: raw.hotspot.x, y: raw.hotspot.y }))
      : undefined,
  });
};

const isBlock = (item: unknown): item is PortableTextBlock =>
  isRecord(item) &&
  item._type === 'block' &&
  Array.isArray(item.children) &&
  item.children.every(
    (span) => isRecord(span) && typeof span.text === 'string',
  );

/** Each paragraph as a marked string; anything that is not a paragraph is left for Zod to name. */
const toIntro = (raw: unknown): unknown =>
  Array.isArray(raw)
    ? raw.map((item) => (isBlock(item) ? portableTextToMarks([item])[0] : item))
    : (raw ?? undefined);

const toRoom = (raw: unknown): unknown =>
  isRecord(raw)
    ? compact({
        name: raw.name,
        category: raw.category,
        workload: raw.workload,
        photos: Array.isArray(raw.photos)
          ? raw.photos.map(toPhoto)
          : raw.photos,
      })
    : raw;

/** Absent rather than empty: an emptied list in the Studio means "no software". */
const nonEmpty = (raw: unknown): unknown =>
  Array.isArray(raw) && raw.length === 0 ? undefined : raw;

/**
 * One Sanity document as the `projects` collection's data, a new object.
 * Photos gain `source: 'sanity'`, `intro` becomes marked strings, and
 * `sanityId` keeps the document's id for messages.
 */
export const toProjectData = (doc: unknown): Raw => {
  if (!isRecord(doc)) return {};
  return compact({
    sanityId: publishedId(doc._id),
    orderRank: doc.orderRank,
    lang: doc.lang,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    image: toPhoto(doc.image),
    seo: isRecord(doc.seo) ? orAbsent(compact(doc.seo)) : undefined,
    location: doc.location,
    year: doc.year,
    client: doc.client,
    floorArea: doc.floorArea,
    storeys: doc.storeys,
    lod: doc.lod,
    software: nonEmpty(doc.software),
    duration: doc.duration,
    tagline: doc.tagline,
    intro: toIntro(doc.intro),
    portrait: toPhoto(doc.portrait),
    rooms: Array.isArray(doc.rooms) ? doc.rooms.map(toRoom) : doc.rooms,
  });
};
