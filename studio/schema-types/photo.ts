import { defineField, defineType } from 'sanity';

/**
 * Shown on every photo field (spec 0019, AC-18). Sanity serves an upload by
 * its link the moment it lands, draft or not, and unpublishing the project
 * does not take it down: only deleting the file in the Media tool does.
 */
export const PHOTO_NOTICE =
  'An upload is public by its link at once, even as a draft. Upload only photos the client may show publicly, never an NDA project. To take one back, delete it in the Media tool.';

/**
 * A photo with its focal point, crop, and alt text: the cover, the portrait,
 * and every room photo. The site serves it resized from Sanity's image CDN,
 * never the original upload, so any size Sanity accepts is fine.
 */
export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'image',
  description: PHOTO_NOTICE,
  options: {
    hotspot: true,
    accept: 'image/png,image/jpeg,image/webp',
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'What the photo shows, for people who cannot see it, for example "A glass tower seen from the street below".',
      validation: (rule) =>
        rule
          .required()
          .custom((alt) =>
            typeof alt === 'string' && alt.trim() !== ''
              ? true
              : 'Write what the photo shows; alt text may not be empty.',
          ),
    }),
  ],
  validation: (rule) =>
    rule.custom((value) =>
      value === undefined || value.asset ? true : 'Upload a photo.',
    ),
});
