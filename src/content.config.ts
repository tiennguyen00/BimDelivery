/**
 * The content model (spec 0002): ten collections, one per kind of content,
 * each entry in a language folder, `src/content/<collection>/<lang>/<file>`.
 *
 * This file checks one entry at a time: required fields, types, lengths,
 * image files that exist. Rules that need to see several entries at once
 * (unique slugs, matching language folders, valid references) live in
 * `src/lib/content.ts`, the only module that reads these collections.
 */
import { defineCollection, reference } from 'astro:content';
import type { SchemaContext } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LOCALES } from './i18n/locales';

// Shared shapes

const lang = z.enum(LOCALES);

const seo = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(50).max(160),
});

const link = z.object({
  label: z.string().min(1),
  href: z
    .string()
    .startsWith('/', 'must be an internal path starting with "/"'),
});

const text = z.string().min(1);

/**
 * Astro's `image()` helper only exists inside a collection's schema callback,
 * so the shared image shape is a factory. One strict object plus a refinement
 * (not a union) keeps the error on the `alt` field, which is the file and
 * field message AC-3 asks for.
 */
const imageSchema = (image: SchemaContext['image']) =>
  z
    .strictObject({
      src: image(),
      alt: z.string().optional(),
      decorative: z.literal(true).optional(),
    })
    .superRefine((value, ctx) => {
      const hasAlt = value.alt !== undefined;
      if (hasAlt && value.decorative) {
        ctx.addIssue({
          code: 'custom',
          path: ['alt'],
          message:
            'set either a non empty `alt` or `decorative: true`, not both',
        });
      } else if (hasAlt && value.alt?.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['alt'],
          message:
            '`alt` must not be empty; use `decorative: true` for a purely decorative image',
        });
      } else if (!hasAlt && !value.decorative) {
        ctx.addIssue({
          code: 'custom',
          path: ['alt'],
          message:
            'add a non empty `alt`, or `decorative: true` for a purely decorative image',
        });
      }
    });

const titledText = z.object({ title: text, text });

const callToAction = z.object({ heading: text, text, button: link });

/**
 * Ids are the file path without its extension, for example `en/home`, for
 * every collection. Astro's default id would use a `slug` field when present,
 * which would drop the language folder and let two languages' copies of a
 * service collide.
 */
const pathId = ({ entry }: { entry: string }) =>
  entry.replaceAll('\\', '/').replace(/\.[^/.]+$/, '');

const load = (collection: string, extension: 'yaml' | 'md') =>
  glob({
    base: `./src/content/${collection}`,
    pattern: `**/*.${extension}`,
    generateId: pathId,
  });

// Single entry collections (one fixed file per language)

const settings = defineCollection({
  loader: load('settings', 'yaml'),
  schema: ({ image }) =>
    z.object({
      lang,
      siteName: text,
      tagline: text,
      logo: imageSchema(image),
      contact: z.object({ email: z.email(), phone: text, address: text }),
      social: z.array(
        z.object({
          network: z.enum([
            'linkedin',
            'facebook',
            'youtube',
            'x',
            'instagram',
          ]),
          url: z.url({ protocol: /^https$/ }),
        }),
      ),
      footer: z.object({ text, copyright: text }),
    }),
});

const navigation = defineCollection({
  loader: load('navigation', 'yaml'),
  schema: z.object({
    lang,
    items: z
      .array(
        z.union([z.object({ label: text, type: z.literal('services') }), link]),
      )
      .min(1),
    cta: link.optional(),
  }),
});

const stats = defineCollection({
  loader: load('stats', 'yaml'),
  schema: z.object({
    lang,
    items: z
      .array(
        z.object({
          value: z.number().nonnegative(),
          suffix: z.string().optional(),
          label: text,
        }),
      )
      .min(1),
  }),
});

const home = defineCollection({
  loader: load('home', 'yaml'),
  schema: ({ image }) =>
    z.object({
      lang,
      seo,
      hero: z.object({
        heading: text,
        subheading: text,
        image: imageSchema(image),
        primaryCta: link,
        secondaryCta: link.optional(),
      }),
      whyChooseUs: z.object({
        heading: text,
        items: z.array(titledText).min(1),
      }),
      overview: z.object({
        heading: text,
        paragraphs: z.array(text).min(1),
        image: imageSchema(image),
      }),
      stats: z.object({ heading: text }),
      services: z.object({ heading: text, intro: text }),
      presence: z.object({
        heading: text,
        text,
        regions: z.array(text).min(1),
        image: imageSchema(image).optional(),
      }),
      differentiators: z.object({ heading: text, items: z.array(text).min(1) }),
      certification: z.object({
        heading: text,
        text,
        badges: z
          .array(z.object({ name: text, image: imageSchema(image) }))
          .min(1),
      }),
      cta: callToAction,
    }),
});

const about = defineCollection({
  loader: load('about', 'md'),
  schema: ({ image }) =>
    z.object({
      lang,
      seo,
      heading: text,
      intro: text,
      image: imageSchema(image),
      highlights: z.array(titledText).min(1),
      statsHeading: text,
    }),
});

const contact = defineCollection({
  loader: load('contact', 'yaml'),
  schema: z.object({
    lang,
    seo,
    heading: text,
    intro: text,
    form: z.object({
      nameLabel: text,
      emailLabel: text,
      companyLabel: text,
      messageLabel: text,
      submitLabel: text,
    }),
    errors: z.object({ required: text, email: text, deliveryFailed: text }),
    success: z.object({ heading: text, text }),
  }),
});

const projectPage = defineCollection({
  loader: load('projectPage', 'yaml'),
  schema: z.object({
    lang,
    seo,
    heading: text,
    intro: text,
    emptyState: z.object({ heading: text, text }),
  }),
});

const notFound = defineCollection({
  loader: load('notFound', 'yaml'),
  schema: z.object({ lang, seo, heading: text, text, button: link }),
});

// Many entry collections

const services = defineCollection({
  loader: load('services', 'md'),
  schema: ({ image }) =>
    z.object({
      lang,
      slug: z
        .string()
        .regex(
          /^[a-z0-9]+(-[a-z0-9]+)*$/,
          'must be kebab case, for example `scan-to-bim`',
        ),
      title: text,
      summary: text,
      order: z.number().int().positive(),
      seo,
      image: imageSchema(image),
      deliverables: z.array(text).min(1),
      process: z.array(titledText).min(1),
      cta: callToAction,
    }),
});

const projects = defineCollection({
  loader: load('projects', 'yaml'),
  schema: ({ image }) =>
    z.object({
      lang,
      title: text,
      summary: text,
      image: imageSchema(image),
      order: z.number().int().positive(),
      // Astro only logs a missing reference; src/lib/content.ts fails the build.
      service: reference('services'),
    }),
});

export const collections = {
  settings,
  navigation,
  stats,
  home,
  about,
  contact,
  projectPage,
  notFound,
  services,
  projects,
};
