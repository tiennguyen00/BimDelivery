/**
 * Loads the client's renders into Sanity as draft projects, one per project
 * folder, for the dev link (spec 0019). The folders sit outside git:
 *
 *   src/assets/images/projects/BIMD - Project Images/
 *     01. BIM Interior Design/1. SP Upper Scale Hotels - KSA/1.png
 *
 *   pnpm --filter bim-delivery-studio exec sanity exec scripts/import-renders.ts --with-user-token
 *
 * Add `-- --dry` to print each project it would write, uploading nothing.
 *
 * The parent folder names the category, the project folder the title and
 * place. Every project is a draft (`drafts.project-en-<slug>`), so only a
 * preview build shows it and production is untouched until an editor
 * publishes. Fields the folders cannot tell (year, alt text, the work done)
 * get stand ins that an editor replaces in the Studio before publishing.
 *
 * Safe to run again: a photo is uploaded once, found again by its SHA-1
 * (so a changed file is a new upload), documents are replaced at fixed ids
 * with stable keys, and each keeps the `orderRank` it was given first.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { LexoRank } from 'lexorank';
import { getCliClient } from 'sanity/cli';
import { marksToPortableText } from '../../src/lib/portable-text-marks';
import { API_VERSION, CATEGORIES, DATASET, PROJECT_ID } from '../project';

const SOURCE_DIR = path.resolve(
  process.cwd(),
  '../src/assets/images/projects/BIMD - Project Images',
);
const IMAGE = /\.(png|jpe?g|webp)$/i;
const SOURCE_NAME = 'bimd-renders';
/** A stand in: required by the site, unknown from the folders. */
const YEAR = 2026;

/** The type folder's keyword to its category. */
const CATEGORY_BY_KEYWORD: readonly (readonly [RegExp, Category])[] = [
  [/interior/i, 'interior-bim'],
  [/architect/i, 'architectural-bim'],
  [/landscape/i, 'landscape-bim'],
];

/** The place after a folder's last " - " to a location; the country follows the last comma. */
const LOCATIONS: Readonly<Record<string, string>> = {
  KSA: 'Saudi Arabia',
  Dubai: 'Dubai, United Arab Emirates',
  Egypt: 'Egypt',
};
const NO_LOCATION = 'Location TBC';

type Category = (typeof CATEGORIES)[number]['value'];

type Folder = Readonly<{
  category: Category;
  title: string;
  location: string;
  files: readonly string[];
}>;

type Asset = Readonly<{ id: string; aspectRatio: number }>;

const client = getCliClient({ apiVersion: API_VERSION }).withConfig({
  perspective: 'raw',
});

const titleOf = (category: Category): string =>
  CATEGORIES.find((item) => item.value === category)?.title ?? category;

/** `1. SP Upper Scale Hotels - KSA` → its title and location. */
const parseProjectFolder = (
  name: string,
): Readonly<{ title: string; location: string }> => {
  const bare = name.replace(/^\d+\.\s*/, '').trim();
  const cut = bare.lastIndexOf(' - ');
  const place = cut === -1 ? undefined : bare.slice(cut + 3).trim();
  return {
    title: cut === -1 ? bare : bare.slice(0, cut).trim(),
    location: (place && LOCATIONS[place]) ?? place ?? NO_LOCATION,
  };
};

/** `HB5 Hotel & Residence Complex` → `hb5-hotel-and-residence-complex`. */
const slugOf = (title: string): string =>
  title
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Natural order, so `10.png` follows `2.png`. */
const byName = (a: string, b: string): number =>
  path.basename(a).localeCompare(path.basename(b), 'en', { numeric: true });

/** Every image under a folder, subfolders included, in name order. */
const imagesIn = async (dir: string): Promise<readonly string[]> =>
  (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && IMAGE.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .toSorted(byName);

const subfolders = async (dir: string): Promise<readonly string[]> =>
  (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const readFolders = async (): Promise<readonly Folder[]> => {
  const types = await subfolders(SOURCE_DIR);
  const nested = await Promise.all(
    types.map(async (type) => {
      const category = CATEGORY_BY_KEYWORD.find(([pattern]) =>
        pattern.test(type),
      )?.[1];
      if (!category) throw new Error(`No category matches folder "${type}".`);
      const projects = await subfolders(path.join(SOURCE_DIR, type));
      return Promise.all(
        projects.map(async (name) => ({
          category,
          ...parseProjectFolder(name),
          files: await imagesIn(path.join(SOURCE_DIR, type, name)),
        })),
      );
    }),
  );
  return nested.flat();
};

/** The file's asset: the one with the same bytes uploaded before, else a new upload. */
const assetFor = async (file: string): Promise<Asset> => {
  const bytes = await readFile(file);
  const sha1 = createHash('sha1').update(bytes).digest('hex');
  const existing = await client.fetch<{
    _id: string;
    aspectRatio: number;
  } | null>(
    '*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]{_id, "aspectRatio": metadata.dimensions.aspectRatio}',
    { sha1 },
  );
  if (existing) return { id: existing._id, aspectRatio: existing.aspectRatio };

  const relative = path.relative(SOURCE_DIR, file).replaceAll('\\', '/');
  const asset = await client.assets.upload('image', bytes, {
    filename: path.basename(file),
    source: { name: SOURCE_NAME, id: relative },
  });
  console.log(`  uploaded ${relative}`);
  return {
    id: asset._id,
    aspectRatio: asset.metadata.dimensions?.aspectRatio ?? 1,
  };
};

const photo = (asset: Asset, alt: string, key?: string) => ({
  _type: 'photo' as const,
  ...(key && { _key: key }),
  asset: { _type: 'reference' as const, _ref: asset.id },
  alt,
});

const toDocument = (
  folder: Folder,
  assets: readonly Asset[],
  orderRank: string,
) => {
  const slug = slugOf(folder.title);
  const service = titleOf(folder.category);
  const place = folder.location === NO_LOCATION ? '' : `, ${folder.location}`;
  const line = `${service} for ${folder.title}${place}.`;
  const alt = (index: number) =>
    `${folder.title}, ${service.toLowerCase()} render ${index + 1} of ${assets.length}`;
  // The most upright photo, else the second, so the portrait differs from the cover.
  const portrait = assets.reduce<number>(
    (best, asset, index) =>
      asset.aspectRatio < (assets[best]?.aspectRatio ?? Infinity)
        ? index
        : best,
    assets.length > 1 ? 1 : 0,
  );
  const [first] = assets;
  if (!first) throw new Error(`No images in "${folder.title}".`);
  return {
    _id: `drafts.project-en-${slug}`,
    _type: 'project' as const,
    orderRank,
    lang: 'en',
    slug: { _type: 'slug' as const, current: slug },
    title: folder.title,
    summary: line,
    image: photo(first, alt(0)),
    location: folder.location,
    year: YEAR,
    tagline: service,
    intro: [marksToPortableText(line, 'intro-0')],
    portrait: photo(assets[portrait] ?? first, alt(portrait)),
    rooms: [
      {
        _type: 'room' as const,
        _key: 'room-0',
        name: service,
        category: folder.category,
        workload: [`${service} model`],
        photos: assets.map((asset, j) => photo(asset, alt(j), `photo-0-${j}`)),
      },
    ],
  };
};

const main = async () => {
  const folders = await readFolders();
  const ids = folders.map(
    (folder) => `drafts.project-en-${slugOf(folder.title)}`,
  );
  const known = await client.fetch<
    readonly { _id: string; orderRank: string }[]
  >('*[_type == "project"]{_id, orderRank}');
  const kept = new Map(
    known
      .filter((doc) => ids.includes(doc._id))
      .map((doc) => [doc._id, doc.orderRank]),
  );
  // New projects go last, after every project not made by this script.
  const last = known
    .filter((doc) => !ids.includes(doc._id))
    .map((doc) => doc.orderRank)
    .toSorted()
    .at(-1);
  const fresh = ids.reduce<readonly LexoRank[]>(
    (ranks) => [
      ...ranks,
      (
        ranks.at(-1) ?? (last ? LexoRank.parse(last) : LexoRank.min())
      ).genNext(),
    ],
    [],
  );

  if (process.argv.includes('--dry')) {
    folders.forEach((folder, index) => {
      console.log(
        `${ids[index]}  ${folder.category}  "${folder.title}"  "${folder.location}"  ${folder.files.length} photos`,
      );
    });
    return;
  }

  console.log(
    `Loading ${folders.length} projects into ${PROJECT_ID}/${DATASET} as drafts`,
  );
  // One project at a time, so a failed upload names its project.
  const documents = await folders.reduce<
    Promise<readonly ReturnType<typeof toDocument>[]>
  >(async (done, folder, index) => {
    const list = await done;
    console.log(`- ${folder.title} (${folder.files.length} photos)`);
    const assets = await folder.files.reduce<Promise<readonly Asset[]>>(
      async (uploaded, file) => [...(await uploaded), await assetFor(file)],
      Promise.resolve([]),
    );
    const id = ids[index] ?? '';
    const rank = kept.get(id) ?? fresh[index]?.toString() ?? '';
    return [...list, toDocument(folder, assets, rank)];
  }, Promise.resolve([]));

  await documents
    .reduce(
      (transaction, document) => transaction.createOrReplace(document),
      client.transaction(),
    )
    .commit();

  const drafts = await client.fetch<number>('count(*[_id in $ids])', { ids });
  console.log(`Draft projects in Sanity: ${drafts} of ${folders.length}.`);
  if (drafts !== folders.length) {
    throw new Error(`Expected ${folders.length} drafts, found ${drafts}.`);
  }
};

await main();
