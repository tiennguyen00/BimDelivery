/**
 * The one time import of the six placeholder projects (spec 0019, AC-12),
 * from `src/content/projects/en/*.yaml` into published Sanity documents.
 *
 *   pnpm --filter bim-delivery-studio import:projects
 *
 * (`sanity exec --with-user-token`, so it writes as the developer's Sanity
 * login.) Safe to run again: every photo is uploaded once, found again by
 * its Pexels address (`source.url`) even if Pexels sends different bytes;
 * documents are written with `createOrReplace` at fixed ids
 * (`project-en-<slug>`, never a dot, since Sanity hides dotted ids from
 * requests without a token); room and photo keys are stable; and `orderRank`
 * is built the same way each run. It ends by counting the projects with no
 * token, as a visitor's build would, and fails unless there are six.
 *
 * Each room's category is the project's old `service`; `intro` becomes
 * Portable Text with the reverse of the site's converter.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { LexoRank } from 'lexorank';
import { getCliClient } from 'sanity/cli';
import { parse } from 'yaml';
import { marksToPortableText } from '../../src/lib/portable-text-marks';
import { API_VERSION, DATASET, PROJECT_ID } from '../project';

type YamlPhoto = { src: string; alt: string };

type YamlProject = {
  lang: string;
  slug: string;
  title: string;
  summary: string;
  image: YamlPhoto;
  order: number;
  service: string;
  seo?: { title: string; description: string };
  location: string;
  year: number;
  client?: string;
  floorArea?: number;
  storeys?: number;
  lod?: number;
  software?: string[];
  duration?: string;
  tagline: string;
  intro: string[];
  portrait: YamlPhoto;
  rooms: { name: string; workload: string[]; photos: YamlPhoto[] }[];
};

const EXPECTED = 6;
const SOURCE_DIR = path.resolve(process.cwd(), '../src/content/projects/en');

const client = getCliClient({ apiVersion: API_VERSION });

/** The photo's asset id: the one uploaded before from this address, else a new upload. */
const assetFor = async (url: string): Promise<string> => {
  const existing = await client.fetch<string | null>(
    '*[_type == "sanity.imageAsset" && source.name == "pexels" && source.url == $url][0]._id',
    { url },
  );
  if (existing) return existing;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const name = new URL(url).pathname.split('/').at(-1) ?? 'photo.jpeg';
  const asset = await client.assets.upload('image', bytes, {
    filename: name,
    source: { name: 'pexels', id: url, url },
  });
  console.log(`  uploaded ${name}`);
  return asset._id;
};

const photo = async (item: YamlPhoto, key?: string) => ({
  _type: 'photo' as const,
  ...(key && { _key: key }),
  asset: { _type: 'reference' as const, _ref: await assetFor(item.src) },
  alt: item.alt,
});

/** `en/landscape-bim` → `landscape-bim`. */
const categoryOf = (service: string): string =>
  service.split('/').at(-1) ?? service;

const toDocument = async (entry: YamlProject, orderRank: string) => {
  const category = categoryOf(entry.service);
  const rooms = await Promise.all(
    entry.rooms.map(async (room, i) => ({
      _type: 'room' as const,
      _key: `room-${i}`,
      name: room.name,
      category,
      workload: room.workload,
      photos: await Promise.all(
        room.photos.map((item, j) => photo(item, `photo-${i}-${j}`)),
      ),
    })),
  );
  return {
    _id: `project-${entry.lang}-${entry.slug}`,
    _type: 'project' as const,
    orderRank,
    lang: entry.lang,
    slug: { _type: 'slug' as const, current: entry.slug },
    title: entry.title,
    summary: entry.summary,
    image: await photo(entry.image),
    ...(entry.seo && { seo: { _type: 'seo' as const, ...entry.seo } }),
    location: entry.location,
    year: entry.year,
    ...(entry.client !== undefined && { client: entry.client }),
    ...(entry.floorArea !== undefined && { floorArea: entry.floorArea }),
    ...(entry.storeys !== undefined && { storeys: entry.storeys }),
    ...(entry.lod !== undefined && { lod: entry.lod }),
    ...(entry.software !== undefined && { software: entry.software }),
    ...(entry.duration !== undefined && { duration: entry.duration }),
    tagline: entry.tagline,
    intro: entry.intro.map((line, i) =>
      marksToPortableText(line, `intro-${i}`),
    ),
    portrait: await photo(entry.portrait),
    rooms,
  };
};

type ProjectDocument = Awaited<ReturnType<typeof toDocument>>;

/** One LexoRank key per project, in `order`, the same every run. */
const ranks = (count: number): readonly string[] =>
  Array.from({ length: count })
    .reduce<readonly LexoRank[]>(
      (keys) => [...keys, (keys.at(-1) ?? LexoRank.min()).genNext()],
      [],
    )
    .map((rank) => rank.toString());

const main = async () => {
  const files = (await readdir(SOURCE_DIR)).filter((file) =>
    file.endsWith('.yaml'),
  );
  const entries = (
    await Promise.all(
      files.map(
        async (file) =>
          parse(
            await readFile(path.join(SOURCE_DIR, file), 'utf8'),
          ) as YamlProject,
      ),
    )
  ).toSorted((a, b) => a.order - b.order);
  const keys = ranks(entries.length);

  console.log(
    `Importing ${entries.length} projects into ${PROJECT_ID}/${DATASET}`,
  );
  // One project at a time, so a failed download names its project.
  const documents = await entries.reduce<Promise<readonly ProjectDocument[]>>(
    async (done, entry, index) => {
      const list = await done;
      console.log(`- ${entry.lang}/${entry.slug}`);
      return [...list, await toDocument(entry, keys[index] ?? '')];
    },
    Promise.resolve([]),
  );

  await documents
    .reduce(
      (transaction, document) => transaction.createOrReplace(document),
      client.transaction(),
    )
    .commit();

  // Counted the way a production build reads: published, no token.
  const visitor = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    perspective: 'published',
  });
  const [projects, assets] = await Promise.all([
    visitor.fetch<number>('count(*[_type == "project"])'),
    client.fetch<number>(
      'count(*[_type == "sanity.imageAsset" && source.name == "pexels"])',
    ),
  ]);
  console.log(
    `Projects readable with no token: ${projects}. Imported photo assets: ${assets}.`,
  );
  if (projects !== EXPECTED) {
    throw new Error(
      `Expected ${EXPECTED} projects readable with no token, found ${projects}.`,
    );
  }
};

await main();
