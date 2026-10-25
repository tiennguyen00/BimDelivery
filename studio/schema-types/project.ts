import {
  orderRankField,
  orderRankOrdering,
} from '@sanity/orderable-document-list';
import {
  defineArrayMember,
  defineField,
  defineType,
  type SlugValidationContext,
} from 'sanity';
import { LOCALES } from '../../src/i18n/locales';
import {
  LOD_LEVELS,
  ROOMS_MAX,
  SLUG_PATTERN,
  TITLE_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from '../../src/lib/project-fields';
import { API_VERSION } from '../project';
import { PHOTO_NOTICE } from './photo';

const whole = 'A whole number.';

/**
 * A slug is unique within its language (spec 0019): two languages may share
 * one, since each language gets its own `/project/<slug>` pages. The draft
 * and the published copy of this same project do not count as a clash.
 */
const isUniqueInLanguage = async (
  slug: string,
  context: SlugValidationContext,
): Promise<boolean> => {
  const { document, getClient } = context;
  const id = (document?._id ?? '').replace(/^drafts\./, '');
  const count = await getClient({ apiVersion: API_VERSION }).fetch<number>(
    'count(*[_type == "project" && slug.current == $slug && lang == $lang && !(_id in [$id, $draft])])',
    { slug, lang: document?.lang ?? '', id, draft: `drafts.${id}` },
  );
  return count === 0;
};

/**
 * One project and its detail page, `/project/<slug>`. Every rule here is one
 * the site's build checks too (`src/content.config.ts`), so the Studio
 * refuses to publish what the build would reject (spec 0019, AC-3).
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'tile', title: 'Tile', default: true },
    { name: 'facts', title: 'Facts' },
    { name: 'page', title: 'Detail page' },
    { name: 'rooms', title: 'Rooms' },
  ],
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'project', newItemPosition: 'after' }),
    defineField({
      name: 'lang',
      title: 'Language',
      type: 'string',
      group: 'tile',
      initialValue: LOCALES[0],
      // Read only while the site has one language.
      readOnly: LOCALES.length === 1,
      hidden: LOCALES.length === 1,
      options: { list: [...LOCALES] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'tile',
      validation: (rule) => rule.required().max(TITLE_MAX),
    }),
    defineField({
      name: 'slug',
      title: 'Address',
      type: 'slug',
      group: 'tile',
      description:
        'The page lives at /project/<this>. Changing it later breaks the old address.',
      options: { source: 'title', maxLength: 96, isUnique: isUniqueInLanguage },
      validation: (rule) =>
        rule
          .required()
          .custom((slug) =>
            slug?.current === undefined || SLUG_PATTERN.test(slug.current)
              ? true
              : 'Lowercase words joined by hyphens, for example harbour-tower.',
          ),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'string',
      group: 'tile',
      description:
        'One line under the title on the tile, and the default search description.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Cover photo',
      type: 'photo',
      group: 'tile',
      description: `The tile and the detail page's hero. ${PHOTO_NOTICE}`,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'facts',
      description:
        'City, then country after the last comma, for example "Sydney, Australia". The country feeds the filter.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year completed',
      type: 'number',
      group: 'facts',
      validation: (rule) =>
        rule.required().integer().error(whole).min(YEAR_MIN).max(YEAR_MAX),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      group: 'facts',
    }),
    defineField({
      name: 'floorArea',
      title: 'Floor area (m²)',
      type: 'number',
      group: 'facts',
      validation: (rule) => rule.integer().error(whole).positive(),
    }),
    defineField({
      name: 'storeys',
      title: 'Storeys',
      type: 'number',
      group: 'facts',
      validation: (rule) => rule.integer().error(whole).positive(),
    }),
    defineField({
      name: 'lod',
      title: 'LOD',
      type: 'number',
      group: 'facts',
      options: {
        list: LOD_LEVELS.map((level) => ({
          value: level,
          title: `LOD ${level}`,
        })),
      },
      validation: (rule) =>
        rule.custom((lod) =>
          lod === undefined || (LOD_LEVELS as readonly number[]).includes(lod)
            ? true
            : 'Pick one of the listed levels.',
        ),
    }),
    defineField({
      name: 'software',
      title: 'Software',
      type: 'array',
      group: 'facts',
      of: [
        defineArrayMember({
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      group: 'facts',
      description: 'Short, for example "8 weeks".',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'page',
      description: "The short line in capitals over the overview's title.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'introText',
      group: 'page',
      description:
        "The hero's 1 to 4 paragraphs. Use Bold and Accent for a phrase; the Accent words show in the accent colour.",
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait photo',
      type: 'photo',
      group: 'page',
      description: `The upright photo beside the facts. ${PHOTO_NOTICE}`,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'Search engines',
      type: 'seo',
      group: 'page',
    }),
    defineField({
      name: 'rooms',
      title: 'Rooms',
      type: 'array',
      group: 'rooms',
      description: `1 to ${ROOMS_MAX} rooms, in the order the carousel shows them.`,
      of: [defineArrayMember({ type: 'room' })],
      validation: (rule) => rule.required().min(1).max(ROOMS_MAX),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'image' },
  },
});
