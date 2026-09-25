/**
 * Marked phrases inside a line of content copy (spec 0005, extended by spec
 * 0010).
 *
 * Content marks a phrase with one of two pairs, and a component turns the
 * line into runs of plain and marked text:
 *
 * - `**like this**`, bold in the surrounding colour (`strong`).
 * - `==like this==`, bold in the gold that suits the surface (`gold`).
 *
 * Only these two are understood: a YAML string is copy, not a document, and
 * every extra syntax is one more thing an editor can get subtly wrong. Marks
 * never nest or overlap, so a run is always exactly one of the three kinds.
 *
 * Broken marks are caught by the schema (`hasBalancedEmphasis`), so by the
 * time a component calls `splitEmphasis` every mark closes cleanly.
 */

export type EmphasisMark = 'none' | 'strong' | 'gold';

export type EmphasisRun = Readonly<{ text: string; mark: EmphasisMark }>;

type OpenMark = Exclude<EmphasisMark, 'none'>;

const MARKS: Readonly<Record<string, OpenMark>> = {
  '**': 'strong',
  '==': 'gold',
};

/**
 * Splitting on a capturing group keeps the marks: even indexes are text and
 * odd indexes are the marks between them.
 */
const TOKENS = /(\*\*|==)/;

type Scan = Readonly<{
  runs: readonly EmphasisRun[];
  open: OpenMark | undefined;
  broken: boolean;
}>;

const START: Scan = { runs: [], open: undefined, broken: false };

/**
 * One pass over the line. A mark opens a run when none is open and closes it
 * when it matches the open one; any other mark while one is open is a nested
 * or overlapping mark, which breaks the line. Empty text (a line that opens
 * with a mark, say) is dropped rather than rendered as nothing.
 */
const scan = (line: string): Scan =>
  line.split(TOKENS).reduce<Scan>((state, part, index) => {
    if (index % 2 === 0) {
      return part === ''
        ? state
        : {
            ...state,
            runs: [...state.runs, { text: part, mark: state.open ?? 'none' }],
          };
    }
    const mark = MARKS[part];
    if (state.open === undefined) return { ...state, open: mark };
    if (state.open === mark) return { ...state, open: undefined };
    return { ...state, broken: true };
  }, START);

export const splitEmphasis = (line: string): readonly EmphasisRun[] =>
  scan(line).runs;

/**
 * True when every mark closes with the same mark before any other mark
 * opens: no mark left open, none nested inside another, none overlapping.
 */
export const hasBalancedEmphasis = (line: string): boolean => {
  const { open, broken } = scan(line);
  return !broken && open === undefined;
};
