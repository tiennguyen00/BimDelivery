import { defineArrayMember, defineField, defineType } from 'sanity';
import { CATEGORIES } from '../project';
import { PHOTOS_MAX, WORKLOAD_MAX } from '../../src/lib/project-fields';
import { PHOTO_NOTICE } from './photo';

/**
 * One room (a subproject) of a project: its name, its category, the work
 * done in it, and its photos. The rooms band shows every room's photos in
 * one carousel, in this order.
 */
export const room = defineType({
  name: 'room',
  title: 'Room',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description:
        'The service this room shows. A project is listed under every category its rooms have.',
      options: {
        list: CATEGORIES.map(({ value, title }) => ({ value, title })),
        layout: 'radio',
      },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value === undefined ||
            CATEGORIES.some((category) => category.value === value)
              ? true
              : 'Pick one of the listed categories.',
          ),
    }),
    defineField({
      name: 'workload',
      title: 'What we did',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required().min(1).max(WORKLOAD_MAX),
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      description: `1 to ${PHOTOS_MAX} photos. ${PHOTO_NOTICE}`,
      of: [defineArrayMember({ type: 'photo' })],
      options: { layout: 'grid' },
      validation: (rule) => rule.required().min(1).max(PHOTOS_MAX),
    }),
  ],
  preview: {
    select: { title: 'name', category: 'category', media: 'photos.0' },
    prepare: ({ title, category, media }) => ({
      title,
      subtitle: CATEGORIES.find((item) => item.value === category)?.title,
      media,
    }),
  },
});
