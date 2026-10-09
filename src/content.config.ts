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
 * Copy that may carry `**bold**` and `==accent==` phrases (specs 0005 and
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
const photoUrl = z.url({
  protocol: /^https$/,
  hostname: /^images\.pexels\.com$/,
  error: 'must be an https link on images.pexels.com',
});

const photoSchema = withAlt(photoUrl);

/**
 * A project gallery photo (spec 0015): the same link rule, but `alt` is
 * required and non empty, and `decorative` is not allowed (strict, so it
 * fails as an unknown key). A gallery exists to show the work, so no photo
 * in it is decorative.
 */
const galleryPhoto = z.strictObject({ src: photoUrl, alt: text });

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
      /** The light mark, for the dark header and footer alike. */
      logo: imageSchema(image),
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
      // The footer band. In `intro` and the certification text a
      // `==phrase==` renders in the accent and a `**phrase**` in bold.
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
   * Each location is a marker on the globe (spec 0017), placed by longitude
   * and latitude: an `office` (the headquarters or an office, green, its name
   * always shown) or a `project` (red, its name on hover). The latitude range
   * is the flat fallback map's own: the SVG stops at 84 north and 56 south,
   * so a marker outside it would sit off that map.
   */
  locations: z
    .array(
      z.strictObject({
        name: text,
        kind: z.enum(['office', 'project']),
        lon: z.number().min(-180).max(180),
        lat: z.number().min(-56).max(84),
      }),
    )
    .min(1)
    .max(40),
  /** The legend's words for the two kinds of marker. */
  legend: z.strictObject({ offices: text, projects: text }),
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
      // The intro band under the hero (spec 0005). Its numbers are the
      // `stats` entry, so they are written once for the whole site.
      intro: z.strictObject({
        heading: text,
        /**
         * The heading's last words, shown in the accent after `heading` and typed
         * through once in order (spec 0009). The first is the real one: it
         * ships in the HTML and is what a screen reader hears.
         */
        headingHighlight: z.array(text).min(1),
        /** The first paragraph opens with `highlight` in the accent, then `text`. */
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
        /** The words under each tile's summary, "Read more" (spec 0015). */
        cue: text,
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

/**
 * A floor area band for the Project page's filter, in square metres: `min`
 * counts in and `max` does not, so 5,000 sits in "5,000 to 20,000", never in
 * "under 5,000". A project falls in the first band that holds it.
 */
const areaRange = z
  .strictObject({
    label: text,
    min: z.number().int().nonnegative().optional(),
    max: z.number().int().positive().optional(),
  })
  .superRefine((range, ctx) => {
    if (range.min === undefined && range.max === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['max'],
        message: 'set `min`, `max`, or both',
      });
    } else if (
      range.min !== undefined &&
      range.max !== undefined &&
      range.min >= range.max
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['max'],
        message: 'must be greater than `min`',
      });
    }
  });

/** A line the filter script fills in, with `{count}` where the number goes. */
const countText = text.refine((line) => line.includes('{count}'), {
  error: (issue) =>
    `must contain \`{count}\`, where the number goes: "${String(issue.input)}"`,
});

// The Project page's copy (spec 0014): the hero, the filter, the empty state,
// and the closing band. Strict at every level, so a leftover key fails the
// build by name. The tiles' words and photos are the `projects` entries.
//
// It also holds the copy every project detail page shares (spec 0015): the
// tiles' cue, and `detail`, the labels, units, and closing band around each
// project's own words.
const projectPage = defineCollection({
  loader: load('projectPage', 'yaml'),
  schema: z.strictObject({
    lang,
    seo,
    heading: text,
    intro: emphasisText,
    /** The photo behind the `h1` and the filter, under the 60% scrim. */
    hero: z.strictObject({ image: photoSchema }),
    /**
     * The filter in the hero. Its choices come from the projects themselves
     * (each project's service, the country at the end of its `location`, and
     * the band its `floorArea` falls in), so only the words live here.
     */
    filter: z.strictObject({
      /** The form's name for a screen reader, "Filter projects". */
      label: text,
      /** The service tabs' group name, read out but not shown. */
      serviceLabel: text,
      /** The first tab, which shows every service. */
      allServices: text,
      countryLabel: text,
      areaLabel: text,
      /** Each dropdown's first choice, which shows every project. */
      anyOption: text,
      /** In order. A band no project falls in is left out of the dropdown. */
      areaRanges: z.array(areaRange).min(1),
      /**
       * Read out after each change. `one` for a single project, `other` for
       * every other count (a language with more plural forms uses `other`
       * for them too).
       */
      results: z.strictObject({ one: countText, other: countText }),
      /** Shown in place of the wall when no project matches. */
      noResults: z.strictObject({ heading: text, text, reset: text }),
    }),
    /** The words under each tile's title, "Read more". */
    tileCue: text,
    /** The labels of the facts a tile shows on hover. */
    tileFacts: z.strictObject({ storeys: text, floorArea: text, lod: text }),
    emptyState: z.strictObject({ heading: text, text }),
    cta: callToAction,
    detail: z.strictObject({
      backLink: z.strictObject(link.shape),
      factsHeading: text,
      /** The facts panel's `<dt>` labels, one per fact a project may carry. */
      factLabels: z.strictObject({
        location: text,
        year: text,
        client: text,
        floorArea: text,
        storeys: text,
        lod: text,
        software: text,
        duration: text,
      }),
      /** Written after the floor area, for example "m²". */
      areaUnit: text,
      /** Written before the LOD number, for example "LOD". */
      lodPrefix: text,
      galleryHeading: text,
      nextLabel: text,
      cta: callToAction,
    }),
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
/**
 * The pattern a band sits on (spec 0003, 2026-10-09): `stripe` is a `canvas`
 * band under the diagonal stripe, `dots` a `canvas` band under the dot grid.
 */
const surface = z.enum(['stripe', 'dots']);

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

/**
 * The rules that need the whole list (spec 0013, AC-4), still one entry at a
 * time, so they live here rather than in `content.ts`:
 *
 * - exactly one `intro`, and it comes first, so a page has one `h1`;
 * - at most one `presence`.
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

/** The levels of development a project may name (spec 0015). */
const LOD_LEVELS = [100, 200, 300, 350, 400, 500] as const;

// Strict at every level (spec 0015), so an optional fact with a typo
// (`floorarea`) fails the build by name instead of quietly vanishing from
// the facts panel. Each entry is one detail page at `/project/<slug>`.
const projects = defineCollection({
  loader: load('projects', 'yaml'),
  schema: z.strictObject({
    lang,
    /** The page's path, `/project/<slug>`. Unique per language (`getProjects`). */
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'must be lowercase kebab case, for example `harbour-tower`',
      ),
    // Capped so a title always fits the Project page's 5:4 tile caption at
    // every width (spec 0014, AC-8). Loosening it means checking that again.
    title: text.max(60),
    /** The tile's line, the detail intro, and the default description. */
    summary: text,
    /** The tile and the detail page's cover. */
    image: photoSchema,
    /** The tiles' order, and which project the next link points to. */
    order: z.number().int().positive(),
    // Astro only logs a missing reference; src/lib/content.ts fails the build.
    service: reference('services'),
    /** Absent: the title and description are derived (`projectHead`). */
    seo: z.strictObject(seo.shape).optional(),
    // The facts panel, in the order it shows them. A fact left out has no row.
    location: text,
    /** The year completed. */
    year: z.number().int().min(1900).max(2100),
    client: text.optional(),
    /** In square metres. */
    floorArea: z.number().int().positive().optional(),
    storeys: z.number().int().positive().optional(),
    lod: z.literal(LOD_LEVELS).optional(),
    software: z.array(text).min(1).optional(),
    /** Short text, for example "8 weeks". */
    duration: text.optional(),
    /** The write up, one to four titled sections. */
    writeUp: z
      .array(
        z.strictObject({
          heading: text,
          paragraphs: z.array(emphasisText).min(1),
        }),
      )
      .min(1)
      .max(4),
    /** The detail page's photo wall, in this order. */
    gallery: z.array(galleryPhoto).min(2).max(9),
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
