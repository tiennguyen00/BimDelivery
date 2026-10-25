/**
 * The Sanity Studio where the client's team edits the site (spec 0019).
 * Projects first; every other page moves here later, one at a time.
 */
import { defineConfig } from 'sanity';
import { media } from 'sanity-plugin-media';
import { structureTool } from 'sanity/structure';
import { PreviewOnSiteAction } from './actions/preview-on-site';
import { DATASET, PROJECT_ID } from './project';
import { schemaTypes } from './schema-types';
import { structure } from './structure';

/** Types editors never create or open by hand. */
const HIDDEN_TYPES: readonly string[] = ['previewRequest'];

export default defineConfig({
  name: 'default',
  title: 'BIM Delivery',
  projectId: PROJECT_ID,
  dataset: DATASET,
  plugins: [
    structureTool({ structure }),
    // The media browser: the one way to find and delete an upload, which
    // stays public by its link until deleted (AC-18).
    media(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        (template) => !HIDDEN_TYPES.includes(template.schemaType),
      ),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === 'project'
        ? [...actions, PreviewOnSiteAction]
        : actions,
    newDocumentOptions: (options) =>
      options.filter((option) => !HIDDEN_TYPES.includes(option.templateId)),
  },
});
