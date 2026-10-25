/**
 * The project `intro` between Sanity's rich text and the site's marked
 * strings (spec 0019). Editors write Portable Text with two buttons, Bold and
 * Accent; the site reads `**bold**` and `==accent==` strings (`emphasis.ts`),
 * so every component that shows marks stays as it is.
 *
 * One block is one paragraph. Neighbouring spans with the same mark merge
 * into one, and spaces at the edge of a marked span move outside the marks,
 * so `** bold **` never reaches the page.
 *
 * Both directions are pure. The reverse, `marksToPortableText`, is for the
 * one time import of the YAML entries (`studio/scripts/import-projects.ts`).
 *
 * The Studio refuses a span with both marks, a typed `**` or `==`, and a
 * line break inside a paragraph. Should one reach the build anyway, it is
 * written out as it is (`**==both==**`), which the schema's
 * `hasBalancedEmphasis` rejects by name.
 */
import { splitEmphasis, type EmphasisMark } from './emphasis';

/** A span's mark, as the Studio names the two buttons. */
export type SpanMark = 'strong' | 'accent';

export type PortableTextSpan = Readonly<{
  _type: 'span';
  _key?: string;
  text: string;
  marks?: readonly string[];
}>;

export type PortableTextBlock = Readonly<{
  _type: 'block';
  _key?: string;
  style?: string;
  markDefs?: readonly unknown[];
  children: readonly PortableTextSpan[];
}>;

const WRAP: Readonly<Record<SpanMark, string>> = {
  strong: '**',
  accent: '==',
};

/** A run of text under one set of marks, in the order the editor set them. */
type Run = Readonly<{ text: string; marks: readonly string[] }>;

const sameMarks = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((mark, index) => mark === b[index]);

/** Neighbouring runs with the same marks become one. */
const mergeRuns = (runs: readonly Run[]): readonly Run[] =>
  runs.reduce<readonly Run[]>((merged, run) => {
    const last = merged.at(-1);
    return last && sameMarks(last.marks, run.marks)
      ? [
          ...merged.slice(0, -1),
          { text: last.text + run.text, marks: last.marks },
        ]
      : [...merged, run];
  }, []);

/**
 * One run as marked text. Spaces at either edge stay outside the marks; a
 * run that is only spaces carries no marks at all. Marks other than the two
 * buttons (none exist today) are ignored.
 */
const writeRun = ({ text, marks }: Run): string => {
  const wrappers = marks.flatMap((mark) =>
    mark === 'strong' || mark === 'accent' ? [WRAP[mark]] : [],
  );
  const core = text.trim();
  if (wrappers.length === 0 || core === '') return text;
  const lead = text.slice(0, text.length - text.trimStart().length);
  const trail = text.slice(text.trimEnd().length);
  const open = wrappers.join('');
  const close = wrappers.toReversed().join('');
  return `${lead}${open}${core}${close}${trail}`;
};

/** One block as one marked string. */
export const blockToMarks = (block: PortableTextBlock): string =>
  mergeRuns(
    block.children.map((span) => ({
      text: span.text,
      marks: span.marks ?? [],
    })),
  )
    .map(writeRun)
    .join('');

/** Every block as one marked paragraph, in order. */
export const portableTextToMarks = (
  blocks: readonly PortableTextBlock[],
): readonly string[] => blocks.map(blockToMarks);

const SPAN_MARK: Readonly<Record<EmphasisMark, readonly SpanMark[]>> = {
  none: [],
  strong: ['strong'],
  gold: ['accent'],
};

/**
 * A marked string as one block, with stable keys built from `key`, for the
 * import. The string is already valid (the YAML passed the schema), so its
 * marks never nest.
 */
export const marksToPortableText = (
  line: string,
  key: string,
): PortableTextBlock => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: splitEmphasis(line).map((run, index) => ({
    _type: 'span',
    _key: `${key}-s${index}`,
    text: run.text,
    marks: SPAN_MARK[run.mark],
  })),
});
