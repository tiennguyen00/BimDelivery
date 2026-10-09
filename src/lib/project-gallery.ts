/**
 * The `/project` page's derived values (spec 0014, revised 2026-10-09): the
 * filter's choices, the keys each tile carries for the filter script, and the
 * facts a tile shows on hover. Pure: data in, new values out, no component
 * imported, and no entry mutated.
 *
 * The filter and the tiles meet only through these keys. Each filter field's
 * `name` is a `data-` attribute on every tile, and both sides are written
 * here, from the same functions, so a choice and the tiles it matches cannot
 * disagree.
 */
import type { Locale } from '../i18n/locales';
import type { Project, ProjectPage, Service } from './content';
import { formatArea, type Fact } from './project-detail';

type AreaRange = ProjectPage['filter']['areaRanges'][number];

export type FilterChoice = Readonly<{ value: string; label: string }>;

export type FilterChoices = Readonly<{
  services: readonly FilterChoice[];
  countries: readonly FilterChoice[];
  areas: readonly FilterChoice[];
}>;

/** What a tile carries for the filter, one key per field `name`. */
export type TileKeys = Readonly<{
  service: string;
  country: string;
  area: string;
}>;

export type GalleryTile = Readonly<{
  project: Project;
  keys: TileKeys;
  /** Storeys, floor area, and LOD, each only when the project has it. */
  facts: readonly Fact[];
}>;

/**
 * The text after a location's last comma, "Australia" from "Sydney,
 * Australia". A location with no comma ("Singapore") is its own country.
 */
export const countryOf = (location: string): string =>
  location.slice(location.lastIndexOf(',') + 1).trim();

/**
 * The key of the first band that holds `floorArea`, its position in
 * `areaRanges`, or `''` when no band does or the project gives no area. An
 * empty key never equals a chosen band, so such a project shows only while
 * the area dropdown is on "Any".
 */
export const areaKeyOf = (
  floorArea: number | undefined,
  ranges: readonly AreaRange[],
): string => {
  if (floorArea === undefined) return '';
  const index = ranges.findIndex(
    ({ min = 0, max = Infinity }) => floorArea >= min && floorArea < max,
  );
  return index === -1 ? '' : String(index);
};

export const tileKeys = (
  project: Project,
  ranges: readonly AreaRange[],
): TileKeys => ({
  service: project.service.slug,
  country: countryOf(project.location),
  area: areaKeyOf(project.floorArea, ranges),
});

/**
 * The filter's choices. Each list holds only what at least one project has,
 * so no single choice can empty the wall; only a combination can.
 *
 * - Services in the services' own `order`, by slug.
 * - Countries in the locale's alphabetical order.
 * - Floor area bands in content order, by position.
 */
export const filterChoices = (
  projects: readonly Project[],
  services: readonly Service[],
  ranges: readonly AreaRange[],
  lang: Locale,
): FilterChoices => {
  const keys = projects.map((project) => tileKeys(project, ranges));
  const has = (field: keyof TileKeys, value: string): boolean =>
    keys.some((key) => key[field] === value);

  const countries = [...new Set(keys.map((key) => key.country))].toSorted(
    new Intl.Collator(lang).compare,
  );

  return {
    services: services
      .filter((service) => has('service', service.slug))
      .map((service) => ({ value: service.slug, label: service.title })),
    countries: countries.map((country) => ({ value: country, label: country })),
    areas: ranges.flatMap((range, index) =>
      has('area', String(index))
        ? [{ value: String(index), label: range.label }]
        : [],
    ),
  };
};

/**
 * The facts a tile shows on hover, in the order storeys, floor area, LOD. A
 * fact the entry leaves out has no row. The LOD is the bare number, because
 * its label already says "LOD".
 */
export const tileFacts = (
  project: Project,
  labels: ProjectPage['tileFacts'],
  areaUnit: string,
  lang: Locale,
): readonly Fact[] => {
  const rows: readonly (readonly [string, string | undefined])[] = [
    [
      labels.storeys,
      project.storeys === undefined ? undefined : String(project.storeys),
    ],
    [
      labels.floorArea,
      project.floorArea === undefined
        ? undefined
        : formatArea(project.floorArea, areaUnit, lang),
    ],
    [labels.lod, project.lod === undefined ? undefined : String(project.lod)],
  ];
  return rows.flatMap(([label, value]) =>
    value === undefined ? [] : [{ label, value }],
  );
};

/** Every tile on the wall, in the projects' order. */
export const galleryTiles = (
  projects: readonly Project[],
  page: Pick<ProjectPage, 'filter' | 'tileFacts' | 'detail'>,
  lang: Locale,
): readonly GalleryTile[] =>
  projects.map((project) => ({
    project,
    keys: tileKeys(project, page.filter.areaRanges),
    facts: tileFacts(project, page.tileFacts, page.detail.areaUnit, lang),
  }));
