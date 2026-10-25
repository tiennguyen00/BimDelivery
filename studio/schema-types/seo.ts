import { defineField, defineType } from 'sanity';
import {
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
} from '../../src/lib/project-fields';

/**
 * A page's search title and description. Optional on a project: left empty,
 * the site uses `<title> | <site name>` and the summary.
 */
export const seo = defineType({
  name: 'seo',
  title: 'Search engines',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) =>
        rule.custom((title, context) => {
          const parent = context.parent as { description?: string } | undefined;
          if (title === undefined) {
            return parent?.description === undefined
              ? true
              : 'Add a title too, or clear the description.';
          }
          return title.length <= SEO_TITLE_MAX
            ? true
            : `At most ${SEO_TITLE_MAX} characters.`;
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.custom((description, context) => {
          const parent = context.parent as { title?: string } | undefined;
          if (description === undefined) {
            return parent?.title === undefined
              ? true
              : 'Add a description too, or clear the title.';
          }
          return description.length >= SEO_DESCRIPTION_MIN &&
            description.length <= SEO_DESCRIPTION_MAX
            ? true
            : `Between ${SEO_DESCRIPTION_MIN} and ${SEO_DESCRIPTION_MAX} characters.`;
        }),
    }),
  ],
});
