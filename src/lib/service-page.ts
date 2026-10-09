/**
 * A service page's plan (spec 0013): from a service's `sections`, the bands
 * the route draws, in order, with everything the route would otherwise work
 * out inline. Pure: data in, a new array out, no component imported, and the
 * entry never mutated.
 *
 * For each block the plan fixes:
 *
 * - `key`, its `type/layout`, which names the band component in the route's
 *   `bands` map;
 * - `block`, the block itself, except a `presence` block, which becomes a
 *   copy carrying its own `content` or, when it has none, `home.presence`;
 * - `headingId`, `<type>-heading`, numbered from a type's second use;
 * - `background`, from `BAND_BACKGROUND`: a `canvas` `Section`, a
 *   `PatternBand` on the block's own `surface`, or a striped `Section` whose
 *   tone turns to `raised` after a `stripe` pattern band, so two stripes
 *   never meet on one tone;
 * - `entranceFrom`, the load entrance steps for the block right after the
 *   intro only (spec 0012's rule, generalised), unless it is `presence`.
 */
import type { Service } from './content';

export type Block = Service['sections'][number];

/**
 * A generic, so it distributes over the union: one key per pair the schema
 * really allows, never a cross of every type with every layout.
 */
type KeyOf<B> = B extends {
  type: infer T extends string;
  layout: infer L extends string;
}
  ? `${T}/${L}`
  : never;

export type BlockKey = KeyOf<Block>;

type TypeOf<K> = K extends `${infer T}/${string}` ? T : never;
type LayoutOf<K> = K extends `${string}/${infer L}` ? L : never;

/** The block a key stands for. */
export type BlockAt<K extends BlockKey> = Extract<
  Block,
  { type: TypeOf<K>; layout: LayoutOf<K> }
>;

/** The presence band's copy, `home.presence` or a block's own. */
export type PresenceContent = NonNullable<BlockAt<'presence/map'>['content']>;

/** A block as the plan hands it on: a presence block's copy is resolved. */
export type PlannedBlock<K extends BlockKey = BlockKey> =
  K extends 'presence/map'
    ? Omit<BlockAt<K>, 'content'> & Readonly<{ content: PresenceContent }>
    : BlockAt<K>;

/** What each band component takes, the same three props for every layout. */
export type BandProps<K extends BlockKey> = Readonly<{
  block: PlannedBlock<K>;
  /** The id the band points at with `aria-labelledby`. */
  headingId: string;
  /** The first load entrance step, on the block after the intro only. */
  entranceFrom?: number;
}>;

type BandSurface = Extract<Block, { surface: string }>['surface'];

/**
 * What a band sits on. Every key must be here and nothing else may be, so a
 * new layout in the schema fails `pnpm check` until it is given one.
 */
export const BAND_BACKGROUND = {
  'intro/carousel': 'canvas',
  'features/cards': 'surface',
  'features/split': 'surface',
  'audiences/grid': 'canvas',
  'process/timeline': 'surface',
  'presence/map': 'striped',
} as const satisfies Record<BlockKey, 'canvas' | 'surface' | 'striped'>;

export type Background =
  | Readonly<{ kind: 'canvas' }>
  | Readonly<{ kind: 'surface'; surface: BandSurface }>
  | Readonly<{ kind: 'striped'; tone: 'canvas' | 'raised' }>;

export type PlannedBand = Readonly<{
  key: BlockKey;
  block: PlannedBlock;
  headingId: string;
  background: Background;
  entranceFrom: number | undefined;
}>;

/**
 * The key built from the block's own two fields. The cast only narrows the
 * template string to the pairs the schema allows, which a real block always
 * is.
 */
export const blockKey = (block: Block): BlockKey =>
  `${block.type}/${block.layout}` as BlockKey;

/** `<type>-heading`, and from a type's second use `<type>-<n>-heading`. */
const headingIdAt = (sections: readonly Block[], index: number): string => {
  const { type } = sections[index];
  const earlier = sections
    .slice(0, index)
    .filter((block) => block.type === type).length;
  return earlier === 0 ? `${type}-heading` : `${type}-${earlier + 1}-heading`;
};

const backgroundOf = (
  block: Block,
  previous: Background | undefined,
): Background => {
  const kind = BAND_BACKGROUND[blockKey(block)];
  if (kind === 'canvas') return { kind };
  if (kind === 'striped') {
    const afterStripe =
      previous?.kind === 'surface' && previous.surface === 'stripe';
    return { kind, tone: afterStripe ? 'raised' : 'canvas' };
  }
  if (!('surface' in block)) {
    throw new Error(
      `[service-page] ${blockKey(block)} is drawn on its own surface but has no \`surface\` field. ` +
        'Give it one in the schema, or change its entry in BAND_BACKGROUND.',
    );
  }
  return { kind, surface: block.surface };
};

/**
 * The intro's load entrance runs the heading at step 0, each paragraph from
 * 1, then the carousel, so the block after it starts one step later still.
 */
const entranceAfter = (block: Block | undefined): number | undefined =>
  block?.type === 'intro' ? block.paragraphs.length + 2 : undefined;

export const planServicePage = (
  sections: readonly Block[],
  homePresence: PresenceContent,
): readonly PlannedBand[] =>
  sections.reduce<readonly PlannedBand[]>((planned, block, index) => {
    const previous = sections[index - 1];
    const band: PlannedBand = {
      key: blockKey(block),
      block:
        block.type === 'presence'
          ? { ...block, content: block.content ?? homePresence }
          : block,
      headingId: headingIdAt(sections, index),
      background: backgroundOf(block, planned.at(-1)?.background),
      entranceFrom:
        block.type === 'presence' ? undefined : entranceAfter(previous),
    };
    return [...planned, band];
  }, []);
