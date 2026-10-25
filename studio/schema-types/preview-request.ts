import { defineField, defineType } from 'sanity';

/**
 * One hidden, published document, `_id: "previewRequest"`, that exists only
 * to start a preview build (spec 0019). The "Preview on site" action rewrites
 * its time; the `site-build` webhook sees the change and the relay Worker
 * starts the `preview` job. Editors never see it: it is left out of every
 * list and of "new document".
 */
export const previewRequest = defineType({
  name: 'previewRequest',
  title: 'Preview request',
  type: 'document',
  fields: [
    defineField({
      name: 'requestedAt',
      title: 'Requested at',
      type: 'datetime',
    }),
  ],
});
