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

// Strict, like every shape the service entries use (spec 0013): a typo
// inside a step or the closing call to action fails the build by name.
const titledText = z.strictObject({ title: text, text });

const callToAction = z.strictObject({
  heading: text,
  text,
  button: z.strictObject(link.shape),
});

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

/**
 * The service pages' glyphs (spec 0013), split by how they are drawn, so a
 * card or tile can only take a line icon and an audience item a solid one.
 * Either list grows by adding a glyph to the map and its name here.
 */
const lineIcons = [
  'blueprint',
  'crane',
  'building-check',
  'scan',
  'clipboard-check',
  'ruler',
  'clash',
  'layers',
  'messages',
] as const;

const solidIcons = [
  'user',
  'presenter',
  'compass',
  'hard-hat',
  'users',
  'users-gear',
  'building',
] as const;

/**
 * The presence band's copy (spec 0005): the home page's band, and a service
 * page's presence block when it carries its own (spec 0013). Strict at every
 * level, so an override is a complete presence, every field and no other.
 */
const presenceContent = z.strictObject({
  heading: text,
  /** A phrase wrapped in `**` renders bold. */
  paragraphs: z.array(emphasisText).min(1),
  /**
   * Each region is a marker on the map, placed by longitude and latitude.
   * The latitude range is the map's own: the SVG stops at 84 north and 56
   * south, so a marker outside it would sit off the map. Six at most, so the
   * names still have room to sit apart.
   */
  regions: z
    .array(
      z.strictObject({
        name: text,
        lon: z.number().min(-180).max(180),
        lat: z.number().min(-56).max(84),
      }),
    )
    .min(1)
    .max(6),
  whyChoose: z.strictObject({ heading: text, items: z.array(text).min(1) }),
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
        /**
         * The services that get a card, in this order (spec 0013), by id,
         * such as `en/architectural-bim`. One to three, so a new service reaches
         * the home page only when it is listed here. `getHomePage` checks
         * every id itself; Astro would only log a missing one.
         */
        featured: z.array(reference('services')).min(1).max(3),
      }),
      // The presence band (spec 0005), which absorbed the old differentiators
      // section. Strict, so a leftover `text` or `image` key fails by name.
      // Shared with the service pages, which show it unless a presence block
      // carries its own (spec 0013).
      presence: presenceContent,
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

/**
 * A dropdown answer's stable key: what the form sends, never the label, so an
 * enquiry reads the same in any language (spec 0011).
 */
const choiceKey = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'must be a lowercase key, for example `lod-300`',
  );

/**
 * A dropdown's choices, in order. Two choices with one key would send the
 * same answer for two different labels, so a repeat fails the build naming
 * the key.
 */
const choices = z
  .array(z.strictObject({ value: choiceKey, label: text }))
  .min(1)
  .superRefine((items, ctx) => {
    items.forEach((item, index) => {
      if (items.slice(0, index).some((other) => other.value === item.value)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'value'],
          message: `repeats the value "${item.value}"; each value must be unique in its list`,
        });
      }
    });
  });

// The Contact page's two bands (spec 0011). Strict at every level, so a
// leftover `nameLabel` from the old four field form, or a typo, fails the
// build by name. The email, phone, and address are `settings.contact`, and
// the "Your needs" choices are the services, so neither is written here.
const contact = defineCollection({
  loader: load('contact', 'yaml'),
  schema: z.strictObject({
    lang,
    seo,
    heading: text,
    intro: emphasisText,
    photo: photoSchema,
    form: z.strictObject({
      heading: text,
      background: photoSchema,
      labels: z.strictObject({
        name: text,
        company: text,
        email: text,
        phone: text,
        country: text,
        need: text,
        projectType: text,
        lod: text,
        message: text,
      }),
      optionalHint: text,
      selectPrompt: text,
      needOtherLabel: text,
      projectTypes: choices,
      lodOptions: choices,
      submitLabel: text,
      sendingLabel: text,
      noScript: text,
    }),
    errors: z.strictObject({
      required: text,
      email: text,
      phone: text,
      tooLong: text,
      captcha: text,
      deliveryFailed: text,
    }),
    success: z.strictObject({ heading: text, text }),
    cards: z.strictObject({
      talk: z.strictObject({ heading: text }),
      visit: z.strictObject({ heading: text }),
    }),
  }),
});

// The Project page's copy (spec 0014): the intro, the empty state, and the
// closing band. Strict at every level, so a leftover key fails the build by
// name. The tiles' words and photos are the `projects` entries.
const projectPage = defineCollection({
  loader: load('projectPage', 'yaml'),
  schema: z.strictObject({
    lang,
    seo,
    heading: text,
    intro: emphasisText,
    emptyState: z.strictObject({ heading: text, text }),
    cta: callToAction,
  }),
});

const notFound = defineCollection({
  loader: load('notFound', 'yaml'),
  schema: z.object({ lang, seo, heading: text, text, button: link }),
});

// Many entry collections

/**
 * A service page's sections (spec 0013): typed blocks, each naming the
 * `layout` that draws it. The route maps every `type/layout` pair to one band
 * component, so a look only one service wants is a new layout here, never an
 * edit to a shared one.
 *
 * A type with one layout is a strict object whose `layout` is a literal. A
 * type with two or more is a discriminated union on `layout` of strict
 * objects, as `features` is. When a type gains its second layout its member
 * changes from the first form to the second, and no YAML changes.
 */
const surface = z.enum(['light', 'dark']);

const introCarousel = z.strictObject({
  type: z.literal('intro'),
  layout: z.literal('carousel'),
  /** The page's `h1`. */
  heading: text,
  paragraphs: z.array(emphasisText).min(1),
  /** The carousel's photos, in order; the first is the one that loads first. */
  images: z.array(photoSchema).min(1).max(3),
});

const featuresCards = z.strictObject({
  type: z.literal('features'),
  layout: z.literal('cards'),
  surface,
  heading: emphasisText,
  paragraphs: z.array(emphasisText).min(1),
  subheading: emphasisText,
  cards: z
    .array(
      z.strictObject({
        icon: z.enum(lineIcons),
        title: text,
        points: z.array(text).min(1),
      }),
    )
    .min(2)
    .max(4),
});

const featuresSplit = z.strictObject({
  type: z.literal('features'),
  layout: z.literal('split'),
  surface,
  heading: emphasisText,
  paragraphs: z.array(emphasisText).min(1),
  items: z
    .array(
      z.strictObject({
        icon: z.enum(lineIcons),
        title: text,
        text: emphasisText,
      }),
    )
    .min(2)
    .max(6),
});

const audiencesGrid = z.strictObject({
  type: z.literal('audiences'),
  layout: z.literal('grid'),
  heading: emphasisText,
  intro: emphasisText,
  items: z
    .array(
      z.strictObject({
        icon: z.enum(solidIcons),
        title: text,
        text: emphasisText,
      }),
    )
    .min(1)
    .max(6),
});

const processTimeline = z.strictObject({
  type: z.literal('process'),
  layout: z.literal('timeline'),
  surface,
  heading: emphasisText,
  intro: emphasisText.optional(),
  /** Numbered by position, so reordering them renumbers them. */
  steps: z.array(titledText).min(2).max(5),
  cta: callToAction,
});

const presenceMap = z.strictObject({
  type: z.literal('presence'),
  layout: z.literal('map'),
  /** Absent: the page shows `home.presence`. Present: this service only. */
  content: presenceContent.optional(),
});

const block = z.discriminatedUnion('type', [
  introCarousel,
  z.discriminatedUnion('layout', [featuresCards, featuresSplit]),
  audiencesGrid,
  processTimeline,
  presenceMap,
]);

/** The only fields a `==` mark may sit in on a `light` surface block. */
const LIGHT_MARK_FIELDS: readonly string[] = ['heading', 'subheading'];

type Path = readonly (string | number)[];

/** Every string inside a value, each with its path from that value. */
const stringsIn = (
  value: unknown,
  path: Path,
): readonly Readonly<{ path: Path; text: string }>[] => {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown, index) =>
      stringsIn(item, [...path, index]),
    );
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      stringsIn(item, [...path, key]),
    );
  }
  return [];
};

/**
 * The rules that need the whole list (spec 0013, AC-4), still one entry at a
 * time, so they live here rather than in `content.ts`:
 *
 * - exactly one `intro`, and it comes first, so a page has one `h1`;
 * - at most one `presence`;
 * - on a `surface: light` block, a `==` mark only in `heading` or
 *   `subheading`: the stripe drops `gold-ink` to 4.01:1, which passes for
 *   large text only.
 */
const sections = z
  .array(block)
  .min(1)
  .superRefine((blocks, ctx) => {
    const indexesOf = (type: string): readonly number[] =>
      blocks.flatMap((item, index) => (item.type === type ? [index] : []));

    const intros = indexesOf('intro');
    if (intros.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'needs one `intro` block, as the first section',
      });
    }
    intros.forEach((index, nth) => {
      if (nth > 0) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'type'],
          message:
            'is a second `intro` block; a service page has exactly one, as its first section',
        });
      } else if (index !== 0) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'type'],
          message: 'the `intro` block must be the first section',
        });
      }
    });

    indexesOf('presence')
      .slice(1)
      .forEach((index) => {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'type'],
          message:
            'is a second `presence` block; a service page has at most one',
        });
      });

    blocks.forEach((item, index) => {
      if (!('surface' in item) || item.surface !== 'light') return;
      Object.entries(item)
        .filter(([key]) => !LIGHT_MARK_FIELDS.includes(key))
        .flatMap(([key, value]) => stringsIn(value, [index, key]))
        .filter(({ text: line }) => line.includes('=='))
        .forEach(({ path, text: line }) => {
          ctx.addIssue({
            code: 'custom',
            path: [...path],
            message: `has a \`==\` mark on a \`surface: light\` block, where gold words may only sit in \`heading\` or \`subheading\`: "${line}"`,
          });
        });
    });
  });

const services = defineCollection({
  loader: load('services', 'yaml'),
  // Strict at every level (spec 0013): a leftover `image`, `deliverables`,
  // `process`, or `cta` from the old Markdown entries, or a typo anywhere,
  // fails the build by name.
  schema: z.strictObject({
    lang,
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        'must be kebab case, for example `interior-bim`',
      ),
    /** The nav, the home card, and the contact form's choices. */
    title: text,
    /** The home card only. */
    summary: text,
    order: z.number().int().positive(),
    seo: z.strictObject(seo.shape),
    /** The kinds of work the home service card lists (spec 0005); home only. */
    subServices: z.array(text).min(3).max(6),
    /** The page, drawn in this order. */
    sections,
  }),
});

const projects = defineCollection({
  loader: load('projects', 'yaml'),
  schema: () =>
    z.object({
      lang,
      // Capped so a title always fits the Project page's 5:4 tile caption at
      // every width (spec 0014, AC-8). Loosening it means checking that again.
      title: text.max(60),
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
