/**
 * Bold phrases inside a line of content copy (spec 0005).
 *
 * Content writes a bold phrase the way Markdown does, `**like this**`, and a
 * component turns the line into runs of plain and strong text. Only this one
 * mark is understood: a YAML string is copy, not a document, and a second
 * syntax would be one more thing an editor can get subtly wrong.
 *
 * Unbalanced marks are caught by the schema (`hasBalancedEmphasis`), so by the
 * time a component calls `splitEmphasis` every opening `**` has a closing one.
 */

export type EmphasisRun = Readonly<{ text: string; strong: boolean }>;

const MARK = '**';

/**
 * Splitting on the mark alternates plain and strong runs, starting plain, so
 * the odd indexes are the bold ones. Empty runs (a line that opens with a bold
 * phrase, say) are dropped rather than rendered as nothing.
 */
export const splitEmphasis = (line: string): readonly EmphasisRun[] =>
  line
    .split(MARK)
    .map((text, index) => ({ text, strong: index % 2 === 1 }))
    .filter((run) => run.text !== '');

/** True when every `**` in the line has a partner. */
export const hasBalancedEmphasis = (line: string): boolean =>
  line.split(MARK).length % 2 === 1;
