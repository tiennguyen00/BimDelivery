/**
 * The content model (spec 0002): ten collections, one per kind of content,
 * each entry in a language folder, `src/content/<collection>/<lang>/<file>`.
 *
 * This file checks one entry at a time: required fields, types, lengths,
 * local image files that exist, photo links on the one allowed host. Rules that need to see several entries at once
 * (unique slugs, matching language folders, valid references) live in
 * `src/lib/content.ts`, the only module that reads these collections.
 */
import { defineCollection, reference } from 'astro:content';
import type { SchemaContext } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LOCALES } from './i18n/locales';
import { hasBalancedEmphasis } from './lib/emphasis';

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
 * Copy that may carry `**bold**` and `==gold==` phrases (specs 0005 and
 * 0010). Every mark needs a partner of its own kind, and marks never nest or
 * overlap. The message quotes the line, so the build names the text to fix.
 */
const emphasisText = text.refine(hasBalancedEmphasis, {
  error: (issue) =>
    `has a \`**\` or \`==\` mark that is not closed by the same mark, or one mark inside another: "${String(issue.input)}"`,
});

/**
 * The shared image shape around any `src`: one strict object plus a refinement
 * (not a union) keeps the error on the `alt` field, which is the file and
 * field message AC-3 asks for.
 */
const withAlt = <Src extends z.ZodType>(src: Src) =>
  z
    .strictObject({
      src,
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

/**
 * A local file, for the drawn assets only (the logo, the badges). Astro's
 * `image()` helper only exists inside a collection's schema callback, so this
 * shape is a factory.
 */
const imageSchema = (image: SchemaContext['image']) => withAlt(image());

/**
 * Every photo is an internet link on Pexels (spec 0006, assumed). The host is
 * the one `image.domains` allows in `astro.config.mjs`; a link anywhere else
 * would render unoptimised, so it fails the build here instead.
 */
const photoSchema = withAlt(
  z.url({
    protocol: /^https$/,
    hostname: /^images\.pexels\.com$/,
    error: 'must be an https link on images.pexels.com',
  }),
);

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
      /** The same mark drawn light, for the black footer. */
      logoOnDark: imageSchema(image),
      contact: z.object({
        email: z.email(),
        phone: text,
        address: text,
        website: z.url({ protocol: /^https$/ }).optional(),
      }),
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
      // The black footer band. In `intro` and the certification text a
      // `==phrase==` renders in gold and a `**phrase**` in bold white.
      footer: z.strictObject({
        intro: z.array(emphasisText).min(1),
        contactHeading: text,
        certification: z.object({
          heading: text,
          text: emphasisText,
          badges: z.array(imageSchema(image)).min(1),
        }),
        copyright: text,
      }),
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
    /**
     * The interface strings the shell needs (spec 0004). Required, not
     * optional, on purpose: an optional block would let a missing string fall
     * back to an empty `aria-label`, which fails silently for exactly the
     * people it exists for. A missing or empty one stops the build instead.
     */
    ui: z.object({
      skipToContent: text,
      openMenu: text,
      closeMenu: text,
      primaryNavLabel: text,
      footerNavLabel: text,
    }),
    /** Footer only links, such as the privacy page feature 13 adds. */
    legal: z.array(link).optional(),
  }),
});

/**
 * The glyphs a stat may carry, each a key of the map in `Icon.astro`. Listed
 * here because a schema needs real values at runtime and a component's types
 * are gone by then; passing one to `<Icon>` is still type checked, so a name
 * added here but never drawn fails `astro check`.
 */
const statIcons = ['briefcase-clock', 'users', 'building', 'map-pin'] as const;

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
          // Shown by the home page's intro band cards (spec 0005).
          // `StatsBand` is typographic and ignores it.
          icon: z.enum(statIcons),
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
      // Strict (spec 0005, AC-22): the hero has one button, so a leftover
      // `secondaryCta`, or any other unknown key, fails the build by name
      // instead of being dropped without a word.
      hero: z.strictObject({
        heading: text,
        subheading: text,
        /** The carousel's photos, in order; the first is the one that loads first. */
        images: z.array(photoSchema).min(1).max(3),
        primaryCta: link,
      }),
      // The black intro band under the hero (spec 0005). Its numbers are the
      // `stats` entry, so they are written once for the whole site.
      intro: z.strictObject({
        heading: text,
        /**
         * The heading's last words, shown in gold after `heading` and typed
         * through once in order (spec 0009). The first is the real one: it
         * ships in the HTML and is what a screen reader hears.
         */
        headingHighlight: z.array(text).min(1),
        /** The first paragraph opens with `highlight` in gold, then `text`. */
        lead: z.object({ highlight: text, text }),
        paragraphs: z.array(text),
      }),
      overview: z.object({
        heading: text,
        paragraphs: z.array(text).min(1),
        image: photoSchema,
      }),
      // Strict (spec 0005): the band's own copy, plus the one illustration
      // and cue word every service card shares.
      services: z.strictObject({
        heading: text,
        intro: text,
        illustration: imageSchema(image),
        cardCue: text,
      }),
      // The presence band (spec 0005), which absorbed the old differentiators
      // section. Strict, so a leftover `text` or `image` key fails by name.
      presence: z.strictObject({
        heading: text,
        /** A phrase wrapped in `**` renders bold. */
        paragraphs: z.array(emphasisText).min(1),
        /**
         * Each region is a marker on the map, placed by longitude and
         * latitude. The latitude range is the map's own: the SVG stops at 84
         * north and 56 south, so a marker outside it would sit off the map.
         * Six at most, so the names still have room to sit apart.
         */
        regions: z
          .array(
            z.object({
              name: text,
              lon: z.number().min(-180).max(180),
              lat: z.number().min(-56).max(84),
            }),
          )
          .min(1)
          .max(6),
        whyChoose: z.object({ heading: text, items: z.array(text).min(1) }),
      }),
      // The last band on the page (spec 0005): the three lowest `order`
      // projects, then one link to the full list. The tiles' words come from
      // the `projects` entries; only the band's own copy lives here.
      projectShowcase: z.strictObject({
        heading: text,
        intro: text,
        link,
      }),
    }),
});

// The About page's three bands (spec 0010). Strict at every level, so a
// leftover `image`, `highlights`, or `statsHeading` from the old page, or a
// typo, fails the build by name. Its numbers are the shared `stats` entry and
// its badges the footer's, so neither is written here.
const about = defineCollection({
  loader: load('about', 'yaml'),
  schema: z.strictObject({
    lang,
    seo,
    heading: text,
    intro: emphasisText,
    capability: z.strictObject({
      heading: text,
      paragraphs: z.array(emphasisText).min(1),
      /** The first item is the one open on load. */
      accordion: z
        .array(z.strictObject({ title: text, text: emphasisText }))
        .min(1),
    }),
    certification: z.strictObject({
      heading: text,
      paragraphs: z.array(emphasisText).min(1),
    }),
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
  schema: () =>
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
      image: photoSchema,
      deliverables: z.array(text).min(1),
      /** The kinds of work the home service card lists (spec 0005). */
      subServices: z.array(text).min(3).max(6),
      process: z.array(titledText).min(1),
      cta: callToAction,
    }),
});

const projects = defineCollection({
  loader: load('projects', 'yaml'),
  schema: () =>
    z.object({
      lang,
      title: text,
      summary: text,
      image: photoSchema,
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
