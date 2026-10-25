/**
 * The query module (spec 0002): the only code that reads content collections.
 *
 * Pages call these typed getters instead of `getCollection`/`getEntry`. Each
 * getter also checks the rules a schema cannot, because a schema sees one
 * entry at a time: language folders, unique slugs and orders, reserved paths,
 * and references between entries.
 *
 * Errors: a missing required entry or a broken rule is a developer bug found
 * at build time, so it throws and stops the build, naming the file and the
 * rule. A slug lookup that finds nothing is an expected result, so
 * `getServiceBySlug` returns it instead of throwing.
 *
 * The checks and transforms are plain functions over arrays; only the thin
 * `load*` wrappers touch Astro.
 */
import { getCollection } from 'astro:content';
import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { Locale } from '../i18n/locales';

/**
 * Top level paths a service slug may not take, since services live at
 * `/<slug>`. Whoever adds a new top level page adds its path here.
 *
 * `other` is not a path: it is the contact form's "Your needs" answer for
 * anything that is not a service (spec 0011), so a service may not take it
 * either, or two choices would send the same key.
 */
const RESERVED_PATHS: readonly string[] = [
  'about-us',
  'project',
  'contact-us',
  'privacy',
  'api',
  '404',
  'other',
];

// Types

type Entry<C extends CollectionKey> = CollectionEntry<C>;

export type Link = Readonly<{ label: string; href: string }>;

export type NavItem =
  Link | Readonly<{ label: string; children: readonly Link[] }>;

/** The interface strings the site shell needs (spec 0004). */
export type NavUi = Readonly<Entry<'navigation'>['data']['ui']>;

export type Navigation = Readonly<{
  items: readonly NavItem[];
  cta?: Link;
  ui: NavUi;
  /** Footer only links. Normalised to an empty list when the field is absent. */
  legal: readonly Link[];
}>;

/** Site wide settings: the logo, the contact details, the social links, the footer copy. */
export type Settings = Readonly<Entry<'settings'>['data']>;

/** The networks the icon set draws. Matches the `network` enum in the schema. */
export type SocialNetwork = Settings['social'][number]['network'];

export type StatItem = Readonly<Entry<'stats'>['data']['items'][number]>;

export type Service = Readonly<Entry<'services'>['data']> &
  Readonly<{ id: string }>;

export type ServiceLookup =
  | Readonly<{ ok: true; service: Service }>
  | Readonly<{ ok: false; reason: 'not-found' }>;

/** A service as a project names it: a category of one of its rooms. */
export type ProjectCategory = Readonly<{ slug: string; title: string }>;

type ProjectData = Entry<'projects'>['data'];

export type ProjectRoom = Readonly<
  Omit<ProjectData['rooms'][number], 'category'> & { category: ProjectCategory }
>;

/**
 * A project, with each room's category resolved to its service and the
 * project's `categories`: every category its rooms have, each once, in the
 * services' `order` (spec 0019).
 */
export type Project = Readonly<Omit<ProjectData, 'rooms'>> &
  Readonly<{
    id: string;
    rooms: readonly ProjectRoom[];
    categories: readonly ProjectCategory[];
  }>;

/** The Project page's copy, and the copy every detail page shares (spec 0015). */
export type ProjectPage = Readonly<Entry<'projectPage'>['data']>;

// Pure checks and transforms

const fileOf = (entry: { id: string; filePath?: string }): string =>
  entry.filePath ?? entry.id;

const folderLang = (id: string): string => id.split('/')[0] ?? '';

/** Every entry's `lang` must equal its language folder. */
const checkLanguageFolders = <
  T extends { id: string; filePath?: string; data: { lang: string } },
>(
  collection: string,
  entries: readonly T[],
): readonly T[] => {
  const mismatch = entries.find(
    (entry) => entry.data.lang !== folderLang(entry.id),
  );
  if (mismatch) {
    throw new Error(
      `[content] ${collection}: ${fileOf(mismatch)} has lang "${mismatch.data.lang}" ` +
        `but sits in the "${folderLang(mismatch.id)}" folder. The lang field and the folder must match.`,
    );
  }
  return entries;
};

/** Fails when two entries share a value for `field` (for example two services with one slug). */
const checkUnique = <T extends { id: string; filePath?: string }>(
  collection: string,
  lang: Locale,
  field: string,
  entries: readonly T[],
  valueOf: (entry: T) => string | number,
): void => {
  entries.forEach((entry, index) => {
    const clash = entries
      .slice(index + 1)
      .find((other) => valueOf(other) === valueOf(entry));
    if (clash) {
      throw new Error(
        `[content] ${collection} (${lang}): ${fileOf(entry)} and ${fileOf(clash)} ` +
          `share the ${field} "${valueOf(entry)}". Each ${field} must be unique within a language.`,
      );
    }
  });
};

/**
 * Nothing counts the services (spec 0013). The home page shows the ones
 * `home.services.featured` lists (`resolveFeaturedServices`), and the nav,
 * the contact choices, and the routes show every one, so adding or removing a
 * service is a content edit.
 */
const checkServices = (
  lang: Locale,
  entries: readonly Entry<'services'>[],
): void => {
  checkUnique('services', lang, 'slug', entries, (entry) => entry.data.slug);
  checkUnique('services', lang, 'order', entries, (entry) => entry.data.order);
  const reserved = entries.find((entry) =>
    RESERVED_PATHS.includes(entry.data.slug),
  );
  if (reserved) {
    throw new Error(
      `[content] services (${lang}): ${fileOf(reserved)} uses the slug "${reserved.data.slug}", ` +
        `which is a reserved path (${RESERVED_PATHS.join(', ')}). Pick another slug.`,
    );
  }
};

const byOrder = <T extends { data: { order: number } }>(a: T, b: T): number =>
  a.data.order - b.data.order;

const inLang = <T extends { data: { lang: string } }>(
  lang: Locale,
  entries: readonly T[],
) => entries.filter((entry) => entry.data.lang === lang);

/**
 * Expands the `services` slot, when there is one, into a dropdown of every
 * service, in order. With none (2026-10-11) the nav has no SERVICES control
 * and the service pages are reached from the About & Services page and the
 * home cards.
 */
const expandNavigation = (
  file: string,
  items: Entry<'navigation'>['data']['items'],
  services: readonly Service[],
): readonly NavItem[] => {
  const slots = items.filter((item) => 'type' in item);
  if (slots.length > 1) {
    throw new Error(
      `[content] navigation: ${file} has ${slots.length} services slots. It may have at most one ` +
        '(an item with `type: services`).',
    );
  }
  return items.map((item) =>
    'type' in item
      ? {
          label: item.label,
          children: services.map((service) => ({
            label: service.title,
            href: `/${service.slug}`,
          })),
        }
      : { label: item.label, href: item.href },
  );
};

/**
 * Resolves each room's category to a service in the project's own language,
 * and derives the project's categories (spec 0019): each once, in the
 * services' `order`. A category that names no such service fails the build,
 * naming the project, its Sanity id, and the room.
 */
const resolveProjectCategories = (
  project: Entry<'projects'>,
  services: readonly Entry<'services'>[],
): Project => {
  const { data } = project;
  const own = services
    .filter((service) => service.data.lang === data.lang)
    .toSorted(byOrder);
  const rooms = data.rooms.map((room, index): ProjectRoom => {
    const target = own.find((service) => service.data.slug === room.category);
    if (!target) {
      throw new Error(
        `[content] projects: ${project.id} (Sanity _id "${data.sanityId}") rooms[${index}].category ` +
          `is "${room.category}", which names no service in "${data.lang}". ` +
          `Use one of: ${own.map((service) => service.data.slug).join(', ')}.`,
      );
    }
    return {
      ...room,
      category: { slug: target.data.slug, title: target.data.title },
    };
  });
  const categories = own
    .filter((service) =>
      rooms.some((room) => room.category.slug === service.data.slug),
    )
    .map((service) => ({ slug: service.data.slug, title: service.data.title }));
  return { ...data, id: project.id, rooms, categories };
};

/**
 * The site's project order (spec 0019): the Studio's drag and drop order,
 * `orderRank` (a LexoRank key, so a plain string sort), ties broken by the
 * Sanity id. Sorted once, here; every caller keeps this order.
 */
const byOrderRank = (a: Entry<'projects'>, b: Entry<'projects'>): number => {
  const left = `${a.data.orderRank}\u0000${a.data.sanityId}`;
  const right = `${b.data.orderRank}\u0000${b.data.sanityId}`;
  return left < right ? -1 : left > right ? 1 : 0;
};

/**
 * A page's list of services by id, resolved in order: the home page's
 * `services.featured` (spec 0013) and the About & Services page's bands.
 * Checked here rather than trusted to `reference()`, which only logs a
 * missing id: each id must name a service, in the page's own language, once.
 */
const resolveServiceRefs = (
  where: Readonly<{ page: string; file: string; field: string }>,
  lang: Locale,
  refs: readonly Readonly<{ id: string }>[],
  services: readonly Entry<'services'>[],
): readonly Service[] => {
  const { page, file, field } = where;
  return refs.map(({ id }, index) => {
    if (refs.slice(0, index).some((earlier) => earlier.id === id)) {
      throw new Error(
        `[content] ${page}: ${file} lists the service "${id}" twice in ${field}. ` +
          'List each service once.',
      );
    }
    const target = services.find((service) => service.id === id);
    if (!target) {
      throw new Error(
        `[content] ${page}: ${file} lists the service "${id}" in ${field}, which does not exist. ` +
          `Use an id such as "${lang}/architectural-bim", or remove the line.`,
      );
    }
    if (target.data.lang !== lang) {
      throw new Error(
        `[content] ${page}: ${file} (lang "${lang}") lists ${fileOf(target)} (lang "${target.data.lang}") ` +
          `in ${field}. The page and its services must share a language.`,
      );
    }
    return { ...target.data, id: target.id };
  });
};

/**
 * A service's photo: the first one in its page's intro carousel, so a card
 * or band and the page it opens share a picture. The schema gives every
 * service exactly one intro with at least one photo, so a miss is a bug.
 */
export const servicePhoto = (
  service: Service,
): Readonly<{ src: string; alt: string }> => {
  const intro = service.sections.find((block) => block.type === 'intro');
  if (!intro) {
    throw new Error(`[content] service "${service.id}" has no intro block`);
  }
  const [photo] = intro.images;
  return { src: photo.src, alt: photo.alt ?? '' };
};

/** One service band on the About & Services page, ready to draw. */
export type AboutServiceBand = Readonly<{
  title: string;
  tagline: string;
  /** May carry `**bold**` and `==accent==` phrases. */
  text: string;
  image: Readonly<{ src: string; alt: string }>;
  /** The service's page; absent for a service with no page yet. */
  href?: string;
}>;

type AboutServiceItem = Entry<'about'>['data']['services']['items'][number];

/**
 * The About & Services page's service bands, in order: a service with a page
 * takes its title, summary, and photo from that entry, a service without
 * one brings its own and gets no link.
 */
const resolveAboutServices = (
  file: string,
  lang: Locale,
  items: readonly AboutServiceItem[],
  services: readonly Entry<'services'>[],
): readonly AboutServiceBand[] => {
  const resolved = resolveServiceRefs(
    { page: 'about', file, field: 'services.items' },
    lang,
    items.flatMap((item) => ('service' in item ? [item.service] : [])),
    services,
  );
  return items.map((item): AboutServiceBand => {
    if (!('service' in item)) {
      return {
        title: item.title,
        tagline: item.tagline,
        text: item.text,
        image: { src: item.image.src, alt: item.image.alt ?? '' },
      };
    }
    const service = resolved.find((entry) => entry.id === item.service.id);
    if (!service) {
      throw new Error(`[content] about: "${item.service.id}" did not resolve`);
    }
    return {
      title: service.title,
      tagline: service.summary,
      text: item.text,
      image: servicePhoto(service),
      href: `/${service.slug}`,
    };
  });
};

// Astro wrappers

/** Reads a whole collection and checks every entry's language folder, in every language. */
const loadChecked = async <C extends CollectionKey>(collection: C) =>
  checkLanguageFolders(collection, await getCollection(collection));

/** Reads the one required entry `<lang>/<file>` of a single entry collection. */
const loadSingle = async <C extends CollectionKey>(
  collection: C,
  lang: Locale,
  file: string,
): Promise<Entry<C>> => {
  const id = `${lang}/${file}`;
  const entry = (await loadChecked(collection)).find(
    (candidate) => candidate.id === id,
  );
  if (!entry) {
    throw new Error(
      `[content] ${collection}: the required "${lang}" entry is missing. ` +
        `Expected a file at src/content/${collection}/${id}.*`,
    );
  }
  return entry;
};

// Getters

export const getSettings = async (lang: Locale) =>
  (await loadSingle('settings', lang, 'site')).data;

export const getStats = async (lang: Locale): Promise<readonly StatItem[]> =>
  (await loadSingle('stats', lang, 'stats')).data.items;

/** The home page, with `services.featured` resolved to its services, in order. */
export const getHomePage = async (lang: Locale) => {
  const [entry, services] = await Promise.all([
    loadSingle('home', lang, 'home'),
    loadChecked('services'),
  ]);
  const featured = resolveServiceRefs(
    { page: 'home', file: fileOf(entry), field: 'services.featured' },
    lang,
    entry.data.services.featured,
    services,
  );
  return { ...entry.data, services: { ...entry.data.services, featured } };
};

/** The About & Services page, with its service bands resolved, in order. */
export const getAboutPage = async (lang: Locale) => {
  const [entry, services] = await Promise.all([
    loadSingle('about', lang, 'about'),
    loadChecked('services'),
  ]);
  const items = resolveAboutServices(
    fileOf(entry),
    lang,
    entry.data.services.items,
    services,
  );
  return { ...entry.data, services: { ...entry.data.services, items } };
};

/** The contact page copy, plus the email, phone, and address from site settings. */
export const getContactPage = async (lang: Locale) => {
  const [page, settings] = await Promise.all([
    loadSingle('contact', lang, 'contact'),
    getSettings(lang),
  ]);
  return { ...page.data, details: settings.contact };
};

export const getProjectPage = async (lang: Locale): Promise<ProjectPage> =>
  (await loadSingle('projectPage', lang, 'project')).data;

export const getNotFoundPage = async (lang: Locale) =>
  (await loadSingle('notFound', lang, 'not-found')).data;

/** Every service in `lang`, sorted by `order`. */
export const getServices = async (
  lang: Locale,
): Promise<readonly Service[]> => {
  const entries = inLang(lang, await loadChecked('services'));
  checkServices(lang, entries);
  return entries
    .toSorted(byOrder)
    .map((entry) => ({ ...entry.data, id: entry.id }));
};

export const getServiceBySlug = async (
  lang: Locale,
  slug: string,
): Promise<ServiceLookup> => {
  const service = (await getServices(lang)).find(
    (candidate) => candidate.slug === slug,
  );
  return service ? { ok: true, service } : { ok: false, reason: 'not-found' };
};

/** The site navigation, with the services slot expanded from the services collection. */
export const getNavigation = async (lang: Locale): Promise<Navigation> => {
  const [entry, services] = await Promise.all([
    loadSingle('navigation', lang, 'main'),
    getServices(lang),
  ]);
  return {
    items: expandNavigation(fileOf(entry), entry.data.items, services),
    ...(entry.data.cta && { cta: entry.data.cta }),
    ui: entry.data.ui,
    legal: entry.data.legal ?? [],
  };
};

/**
 * Every project in `lang`, in the Studio's order, each with its rooms'
 * categories resolved. Empty when there are none. Read from Sanity at build
 * (spec 0019); the loader has already caught a repeated slug.
 */
export const getProjects = async (
  lang: Locale,
): Promise<readonly Project[]> => {
  const [projects, services] = await Promise.all([
    loadChecked('projects'),
    loadChecked('services'),
  ]);
  const entries = inLang(lang, projects);
  checkUnique('projects', lang, 'slug', entries, (entry) => entry.data.slug);
  return entries
    .toSorted(byOrderRank)
    .map((entry) => resolveProjectCategories(entry, services));
};
