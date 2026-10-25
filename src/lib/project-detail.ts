/**
 * A project detail page's derived values (spec 0015, revised by spec 0018):
 * its path, the project after it, the overview's fact rows, and the page
 * head. Pure: data in, new values out, no component imported, and no entry
 * mutated.
 *
 * Formatting lives here rather than in a component, so every fact list
 * reads the same and the numbers follow the page's locale in one place.
 */
import type { Locale } from '../i18n/locales';
import type { Project, ProjectCategory, ProjectPage } from './content';

/** A project's page, `/project/<slug>`. */
export const projectHref = (slug: string): string => `/project/${slug}`;

/**
 * The project after `current` in the site's order (`getProjects` sorts once,
 * by `orderRank`), the last wrapping round to the first. With fewer than two
 * projects there is none, so the page never links to itself.
 */
export const nextProject = (
  projects: readonly Project[],
  current: Project,
): Project | undefined => {
  if (projects.length < 2) return undefined;
  const index = projects.findIndex((project) => project.id === current.id);
  return index === -1 ? undefined : projects[(index + 1) % projects.length];
};

/** A piece of a fact's value: a link when it has an `href`, else plain text. */
export type FactPart = Readonly<{ text: string; href?: string }>;

/**
 * One fact row. `value` is its plain text. `links`, when present, is the
 * same value in pieces, some of them links, as the categories row draws it
 * ("Architectural BIM and Interior BIM", each a link).
 */
export type Fact = Readonly<{
  label: string;
  value: string;
  links?: readonly FactPart[];
}>;

/**
 * The categories as one list in the page's language, each title a link to
 * its service page: `Intl.ListFormat` writes the words between them.
 */
const categoryParts = (
  categories: readonly ProjectCategory[],
  lang: Locale,
): readonly FactPart[] =>
  new Intl.ListFormat(lang, { type: 'conjunction' })
    .formatToParts(categories.map((category) => category.title))
    .map((part, index, parts) => {
      if (part.type === 'literal') return { text: part.value };
      const position = parts
        .slice(0, index)
        .filter((earlier) => earlier.type === 'element').length;
      const category = categories[position];
      return category === undefined
        ? { text: part.value }
        : { text: part.value, href: `/${category.slug}` };
    });

type DetailCopy = ProjectPage['detail'];

/**
 * A floor area grouped for the locale, then the unit: "18,500 m²". Shared by
 * the facts panel and the `/project` tiles, so the two always agree.
 */
export const formatArea = (
  floorArea: number,
  unit: string,
  lang: Locale,
): string => `${new Intl.NumberFormat(lang).format(floorArea)} ${unit}`;

/**
 * The overview's fact rows (spec 0018), in the fixed order floor area,
 * location, service, year, client, storeys, LOD, software, duration. A fact
 * the entry leaves out has no row at all, never an empty one.
 *
 * The service row lists every category of the project's rooms (spec 0019),
 * each a link to its service page, under `factLabels.service` for one and
 * `factLabels.services` for several.
 *
 * The year is written as it is (no thousands separator); the floor area is
 * grouped for the locale, then the unit; the software list is joined the
 * locale's way, as a list of units ("Revit, Navisworks").
 */
export const projectFacts = (
  project: Project,
  detail: Pick<DetailCopy, 'factLabels' | 'areaUnit' | 'lodPrefix'>,
  lang: Locale,
): readonly Fact[] => {
  const { factLabels: labels } = detail;
  const services = categoryParts(project.categories, lang);
  const rows: readonly (readonly [
    string,
    string | undefined,
    (readonly FactPart[])?,
  ])[] = [
    [
      labels.floorArea,
      project.floorArea === undefined
        ? undefined
        : formatArea(project.floorArea, detail.areaUnit, lang),
    ],
    [labels.location, project.location],
    [
      project.categories.length > 1 ? labels.services : labels.service,
      services.map((part) => part.text).join(''),
      services,
    ],
    [labels.year, String(project.year)],
    [labels.client, project.client],
    [
      labels.storeys,
      project.storeys === undefined ? undefined : String(project.storeys),
    ],
    [
      labels.lod,
      project.lod === undefined
        ? undefined
        : `${detail.lodPrefix} ${project.lod}`,
    ],
    [
      labels.software,
      project.software === undefined
        ? undefined
        : new Intl.ListFormat(lang, { type: 'unit' }).format(project.software),
    ],
    [labels.duration, project.duration],
  ];
  return rows.flatMap(([label, value, links]) => {
    if (value === undefined) return [];
    return links === undefined ? [{ label, value }] : [{ label, value, links }];
  });
};

/**
 * The page head: the entry's `seo` when it sets one, otherwise
 * `<title> | <site name>` and the summary.
 */
export const projectHead = (
  project: Project,
  siteName: string,
): Readonly<{ title: string; description: string }> =>
  project.seo ?? {
    title: `${project.title} | ${siteName}`,
    description: project.summary,
  };
