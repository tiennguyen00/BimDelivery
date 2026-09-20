/**
 * The bit TextField and TextArea share: how a field's help text and error
 * message are tied back to the control (spec 0003).
 *
 * It lives in one pure function rather than being written twice, because the
 * aria wiring is the part most likely to drift out of step between the two,
 * and a field whose error is not announced looks completely fine on screen.
 */

export type FieldDescription = Readonly<{
  hintId: string | undefined;
  errorId: string | undefined;
  /** For `aria-describedby`: hint first, then error, so they read in order. */
  describedBy: string | undefined;
}>;

export const describeField = (
  id: string,
  hint: string | undefined,
  error: string | undefined,
): FieldDescription => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ids = [hintId, errorId].filter(Boolean);
  return {
    hintId,
    errorId,
    describedBy: ids.length > 0 ? ids.join(' ') : undefined,
  };
};
