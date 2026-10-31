/**
 * The content model (spec 0002): ten collections, one per kind of content,
 * each entry in a language folder, `src/content/<collection>/<lang>/<file>`.
 *
 * One exception (spec 0019): `projects` is read from Sanity at build, by the
 * loader at the end of this file, and checked by the same kind of strict
 * schema. Its entry ids are still `<lang>/<slug>`.
 *
 * This file checks one entry at a time: required fields, types, lengths,
 * local image files that exist, photo links on the one allowed host. Rules that need to see several entries at once
 * (unique slugs, matching language folders, valid references) live in
 * `src/lib/content.ts`, the only module that reads these collections.
 */
import { defineCollection, reference } from 'astro:content';
import type { Loader } from 'astro/loaders';
import type { SchemaContext } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  SANITY_DATASET,
  SANITY_LENIENT,
  SANITY_PERSPECTIVE,
  SANITY_PROJECT_ID,
  SANITY_READ_TOKEN,
} from 'astro:env/server';
import { LOCALES } from './i18n/locales';
import { hasBalancedEmphasis } from './lib/emphasis';
import {
  INTRO_MAX,
  LOD_LEVELS,
  PHOTOS_MAX,
  ROOMS_MAX,
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
  SLUG_PATTERN,
  TITLE_MAX,
  WORKLOAD_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from './lib/project-fields';
import {
  PROJECTS_QUERY,
  documentLabel,
  entryIdOf,
  publishedId,
  sanityClient,
  toProjectData,
  type SanityBuildConfig,
  type SanityPerspective,
} from './lib/sanity';

// Shared shapes

const lang = z.enum(LOCALES);

const seo = z.object({
  title: z.string().min(1).max(SEO_TITLE_MAX),
  description: z.string().min(SEO_DESCRIPTION_MIN).max(SEO_DESCRIPTION_MAX),
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
 * Every photo outside projects is an internet link on Pexels (spec 0006,
 * until its page moves to Sanity). The host is the one `image.domains`
 * allows in `astro.config.mjs`; a link anywhere else would render
 * unoptimised, so it fails the build here instead.
 */
const photoUrl = z.url({
  protocol: /^https$/,
  hostname: /^images\.pexels\.com$/,
  error: 'must be an https link on images.pexels.com',
});

const photoSchema = withAlt(photoUrl);

/** A share of a photo's width or height, for a crop or a focal point. */
const fraction = z.number().min(0).max(1);

/**
 * A project photo uploaded to Sanity (spec 0019), as the `projects` loader
 * stores it: the original's CDN address and pixel size, the alt text, and
 * the editor's crop and focal point. `Photo.astro` tells it from a Pexels
 * link by `source`. Strict, and `alt` is required and non empty: these
 * photos exist to show the work, so none is decorative.
 */
const sanityPhoto = z.strictObject({
  source: z.literal('sanity'),
  url: z.url({
    protocol: /^https$/,
    hostname: /^cdn\.sanity\.io$/,
    error: 'must be an https link on cdn.sanity.io',
  }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: text.refine((alt) => alt.trim() !== '', 'must not be blank'),
  crop: z
    .strictObject({
      top: fraction,
      bottom: fraction,
      left: fraction,
      right: fraction,
    })
    .refine(
      (crop) => crop.left + crop.right < 1 && crop.top + crop.bottom < 1,
      {
        error: 'the crop leaves nothing of the photo',
      },
    )
    .optional(),
  hotspot: z.strictObject({ x: fraction, y: fraction }).optional(),
});

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
            'tiktok',
          ]),
          url: z.url({ protocol: /^https$/ }),
        }),
      ),
      // The footer band. In `intro` a `==phrase==` renders in the accent and
      // a `**phrase**` in bold.
      footer: z.strictObject({
        intro: z.array(emphasisText).min(1),
        contactHeading: text,
        /** The heading over the social links column. */
        socialHeading: text,
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
      /** The back to top link's name, which is also its text. */
      backToTop: text,
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
        /** The short line above `heading`, in brass capitals. */
        eyebrow: text,
        /** The large title, the page's `h1`; `==phrase==` turns it brass. */
        heading: emphasisText,
        /** The paragraph under `heading`. */
        lead: text,
        /**
         * The photo behind the whole band (2026-10-24): a local file, the
         * client's own render, not a Pexels link.
         */
        image: imageSchema(image),
        /**
         * The tower's right edge in `image`, as a share of its width from
         * the left (0 to 1). From `lg` the copy starts there, so change it
         * with the photo.
         */
        copyStart: z.number().min(0).max(1),
        /**
         * The same render cut for phones (2026-10-31): a full height square
         * starting at 25 percent of the width cut away, the share the band
         * frames `image` at, so a phone shows the same slice and fetches
         * only that. Cut it again with a new `image` (`CREDITS.md`).
         */
        phoneImage: image(),
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
      services: z
        .strictObject({
          heading: text,
          intro: text,
          illustration: imageSchema(image),
          cardCue: text,
          /**
           * The services that get a card, in this order (spec 0013), by id,
           * such as `en/architectural-bim`. One to three, so a new service
           * reaches the home page only when it is listed here. `getHomePage`
           * checks every id itself; Astro would only log a missing one.
           *
           * `image` is the card's own photo (2026-10-31), a local file cut
           * to the card's 4:5 frame; without one the card takes the first
           * photo of the service page's intro carousel.
           */
          featured: z
            .array(
              z.strictObject({
                service: reference('services'),
                image: imageSchema(image).optional(),
              }),
            )
            .min(1)
            .max(3),
          /**
           * Cards for services with no page of their own (2026-10-11), drawn
           * after the featured ones, home only: no route, no nav item, and
           * the card is not a link. Its photo is written here, since there
           * is no intro carousel to take it from.
           */
          extra: z
            .array(
              z.strictObject({
                title: text,
                summary: text,
                image: photoSchema,
              }),
            )
            .default([]),
        })
        .refine(
          (services) => services.featured.length + services.extra.length <= 4,
          {
            path: ['extra'],
            message:
              'the row holds at most four cards, `featured` and `extra` together',
          },
        ),
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
        /**
         * The one wide photo behind every tile. Each tile is a window onto
         * part of it, so the photo is never cut into separate pictures. A
         * local file, the client's own render.
         */
        image: imageSchema(image),
        link,
      }),
    }),
});

/**
 * One split band's copy on the About & Services page (2026-10-11): the words
 * beside the photo. `cta` is only the button's words; the page decides where
 * it leads, the next band down.
 */
const splitBand = z.strictObject({
  heading: text,
  /** The short brass line under the heading. */
  tagline: text,
  paragraphs: z.array(emphasisText).min(1),
  /**
   * Point lists after the paragraphs (2026-10-29), each under its own small
   * heading when it has one: the client's Team and Expertise points.
   */
  lists: z
    .array(
      z.strictObject({
        heading: text.optional(),
        points: z.array(emphasisText).min(1),
      }),
    )
    .default([]),
  cta: text,
  image: photoSchema,
});

/**
 * One fact in the About page's services overview (2026-10-29): a line icon,
 * a title, and its short points, such as the project stages. `layout`
 * `index` numbers the points and runs them four to a column, in up to three
 * columns (the project locations); `list` is one plain column.
 */
const serviceFact = z
  .strictObject({
    icon: z.enum([...lineIcons, 'globe']),
    title: text,
    layout: z.enum(['list', 'index']).default('list'),
    points: z.array(text).min(1),
  })
  .refine((fact) => fact.layout !== 'index' || fact.points.length <= 12, {
    path: ['points'],
    message: 'an `index` fact holds at most 12 points, three columns of four',
  });

// The About & Services page (2026-10-11, replacing spec 0010's three bands):
// the company, its experience, the services overview, one band per service,
// then the media band, which has no copy yet. Strict at every level, so a
// leftover `capability` or `certification` from the old page, or a typo,
// fails the build by name.
const about = defineCollection({
  loader: load('about', 'yaml'),
  schema: z.strictObject({
    lang,
    seo,
    /** The company: its name is the page's `h1`. */
    intro: splitBand,
    experience: splitBand,
    services: z.strictObject({
      /**
       * The overview band before the service bands (2026-10-29): the
       * heading, who the team works for, then two to six facts.
       */
      heading: text,
      intro: emphasisText,
      facts: z.array(serviceFact).min(2).max(6),
      /** The button on a band whose service has a page, "Discover more". */
      cue: text,
      /**
       * One band each, in this order. A service with a page is named by id,
       * such as `en/architectural-bim`, and its title, summary, and first
       * intro photo come from that entry; `getAboutPage` checks every id.
       * A service with no page yet writes its own, and its band has no
       * button.
       */
      items: z
        .array(
          z.union([
            z.strictObject({
              service: reference('services'),
              text: emphasisText,
            }),
            z.strictObject({
              title: text,
              tagline: text,
              text: emphasisText,
              image: photoSchema,
            }),
          ]),
        )
        .min(1),
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
    // The detail page's shared words (spec 0018, which replaced spec 0015's
    // back link, facts heading, and gallery heading).
    detail: z.strictObject({
      /** The hero's button down to the overview, "Discover more". */
      discoverLabel: text,
      /** The overview's `<dt>` labels, one per fact a project may carry. */
      factLabels: z.strictObject({
        floorArea: text,
        location: text,
        /** Over a project's category when its rooms have one (spec 0019). */
        service: text,
        /** Over a project's categories when its rooms have several. */
        services: text,
        year: text,
        client: text,
        storeys: text,
        lod: text,
        software: text,
        duration: text,
      }),
      /** Written after the floor area, for example "m²". */
      areaUnit: text,
      /** Written before the LOD number, for example "LOD". */
      lodPrefix: text,
      /** The rooms band's `h2`, read out but not shown. */
      roomsHeading: text,
      /** The label over a room's list of work, "What we did". */
      workloadLabel: text,
      /** The room carousels' arrow buttons, read out, not shown. */
      photoControls: z.strictObject({ previous: text, next: text }),
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

const slug = z
  .string()
  .regex(
    SLUG_PATTERN,
    'must be lowercase kebab case, for example `harbour-tower`',
  );

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Reads every project from Sanity, once per build (spec 0019).
 *
 * - One query, in the perspective the build asks for: `published` (no token)
 *   for production, `drafts` (the Viewer token) for a preview.
 * - Each document is mapped to a new object (`toProjectData`) and checked by
 *   the schema below. Every message names the project, `<lang>/<slug>` and
 *   its Sanity `_id`, then Zod's field.
 * - A failure, published and strict: the build stops, naming every invalid
 *   project. Published and lenient (a manual run): the project is left out
 *   with a warning. In a preview: the draft gives way to its published
 *   version when that passes, else it is left out, with a warning, so one
 *   unfinished draft never fails a preview.
 * - Two documents with one `<lang>/<slug>` are caught before either is
 *   stored: a strict build stops naming both ids; a lenient or preview build
 *   keeps the first by order and warns.
 * - The store is cleared first, so an unpublished or deleted project never
 *   lingers from an earlier build.
 */
const sanityProjects = (): Loader => ({
  name: 'sanity-projects',
  load: async ({ store, parseData, logger, generateDigest }) => {
    const config: SanityBuildConfig = {
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      perspective: SANITY_PERSPECTIVE,
      token: SANITY_READ_TOKEN,
      lenient: SANITY_LENIENT,
    };
    const preview = config.perspective === 'drafts';
    const strict = !preview && !config.lenient;

    const read = async (
      perspective: SanityPerspective,
    ): Promise<readonly Record<string, unknown>[]> => {
      const result = sanityClient(config, perspective);
      if (!result.ok) throw new Error(result.reason);
      try {
        return await result.client.fetch(PROJECTS_QUERY);
      } catch (error) {
        throw new Error(
          `[content] projects: could not read Sanity project "${config.projectId}", dataset "${config.dataset}" (${perspective}): ${messageOf(error)}`,
          { cause: error },
        );
      }
    };

    type Checked =
      | Readonly<{
          ok: true;
          id: string;
          order: string;
          data: Record<string, unknown>;
          label: string;
        }>
      | Readonly<{ ok: false; message: string }>;

    const check = async (doc: Record<string, unknown>): Promise<Checked> => {
      const label = documentLabel(doc);
      try {
        const data = await parseData({
          id: entryIdOf(doc) ?? label,
          data: toProjectData(doc),
        });
        return {
          ok: true,
          id: entryIdOf(doc) ?? '',
          order: `${String(doc.orderRank)}\u0000${publishedId(doc._id)}`,
          data,
          label,
        };
      } catch (error) {
        return {
          ok: false,
          message: `[content] projects: ${label} is invalid. ${messageOf(error)}`,
        };
      }
    };

    const [documents, published] = await Promise.all([
      read(config.perspective),
      preview ? read('published') : Promise.resolve([]),
    ]);

    const results = await Promise.all(
      documents.map(async (doc): Promise<Checked> => {
        const first = await check(doc);
        if (first.ok || !preview) return first;
        const fallback = published.find(
          (candidate) => publishedId(candidate._id) === publishedId(doc._id),
        );
        const second =
          fallback === undefined ? undefined : await check(fallback);
        if (second?.ok) {
          logger.warn(
            `${first.message}\nThis preview shows its published version instead.`,
          );
          return second;
        }
        return {
          ok: false,
          message: `${first.message}\nLeft out of this preview: it has no valid published version.`,
        };
      }),
    );

    const failures = results.flatMap((result) =>
      result.ok ? [] : [result.message],
    );
    if (strict && failures.length > 0) {
      throw new Error(failures.join('\n\n'));
    }
    failures.forEach((message) => {
      logger.warn(
        preview ? message : `${message}\nLeft out of this lenient run.`,
      );
    });

    const valid = results
      .flatMap((result) => (result.ok ? [result] : []))
      .toSorted((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
    const kept = valid.filter((entry, index) => {
      const earlier = valid
        .slice(0, index)
        .find((other) => other.id === entry.id);
      if (earlier === undefined) return true;
      const message = `[content] projects: ${earlier.label} and ${entry.label} share "${entry.id}". Each slug must be unique within a language.`;
      if (strict) throw new Error(message);
      logger.warn(`${message}\nKeeping the first, leaving out the second.`);
      return false;
    });

    store.clear();
    kept.forEach(({ id, data }) => {
      store.set({ id, data, digest: generateDigest(data) });
    });
  },
});

// Strict at every level (spec 0015), so an optional fact with a typo
// fails the build by name instead of quietly vanishing from the facts panel.
// Each entry is one detail page at `/project/<slug>`. The same rules are the
// Studio's validation (`src/lib/project-fields.ts`), so an editor cannot
// publish what this rejects (spec 0019).
const projects = defineCollection({
  loader: sanityProjects(),
  schema: z.strictObject({
    /** The Sanity document's `_id`, for build messages. */
    sanityId: text,
    /** The tiles' order, the showcase's, and the next link's (`getProjects`). */
    orderRank: text,
    lang,
    /** The page's path, `/project/<slug>`. Unique per language. */
    slug,
    title: text.max(TITLE_MAX),
    /** The tile's line, the detail intro, and the default description. */
    summary: text,
    /** The tile and the detail page's cover. */
    image: sanityPhoto,
    /** Absent: the title and description are derived (`projectHead`). */
    seo: z.strictObject(seo.shape).optional(),
    // The facts panel, in the order it shows them. A fact left out has no row.
    location: text,
    /** The year completed. */
    year: z.number().int().min(YEAR_MIN).max(YEAR_MAX),
    client: text.optional(),
    /** In square metres. */
    floorArea: z.number().int().positive().optional(),
    storeys: z.number().int().positive().optional(),
    lod: z.literal(LOD_LEVELS).optional(),
    software: z.array(text).min(1).optional(),
    /** Short text, for example "8 weeks". */
    duration: text.optional(),
    // The detail page's own words and photos (spec 0018).
    /** The short line in capitals over the overview's title. */
    tagline: text,
    /** The hero's paragraphs, from the Studio's rich text (`toProjectData`). */
    intro: z.array(emphasisText).min(1).max(INTRO_MAX),
    /** The overview's upright photo, beside the facts. */
    portrait: sanityPhoto,
    /**
     * The rooms band, in this order: each room's photos join one carousel,
     * and its name, its category, and the work done in it show while they
     * are on screen. A project's categories are its rooms', never stored on
     * the project (`src/lib/content.ts` checks each against the services).
     */
    rooms: z
      .array(
        z.strictObject({
          name: text,
          /** A service's slug in the project's language. */
          category: slug,
          workload: z.array(text).min(1).max(WORKLOAD_MAX),
          photos: z.array(sanityPhoto).min(1).max(PHOTOS_MAX),
        }),
      )
      .min(1)
      .max(ROOMS_MAX),
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
