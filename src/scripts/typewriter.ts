/**
 * The intro heading's typing effect (spec 0009).
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * `IntroBand.astro` renders the first word in place, a hidden caret, and a
 * `sr-only` copy for assistive tech. With no JavaScript, a failed script, or
 * reduced motion asked for, the visitor sees the first word, still.
 *
 * It reads the words from `data-words`, a JSON array, because the markup only
 * shows the first one.
 *
 * Once the heading is a quarter on screen it shows the caret, then deletes and
 * retypes through every word and back to the first, forever. The live word
 * takes only the room its letters need, so the heading and its gold rule
 * shrink and grow with it. There is no pause button: a known WCAG 2.2.2 gap
 * recorded in the spec.
 *
 * Writes go through `replaceChildren` and `removeAttribute`, never property
 * assignment, for the `no-param-reassign` reason given in `counters.ts`.
 */

const TYPE_MS = 70;
const DELETE_MS = 40;

/** How long each finished word stays before it is deleted. */
const HOLD_MS = 1200;

const THRESHOLD = 0.25;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** One screen state: the text to show, and how long to leave it there. */
type Frame = Readonly<{ text: string; ms: number }>;

/** Hold `from`, delete it letter by letter, then type `to` letter by letter. */
const framesBetween = (from: string, to: string): readonly Frame[] => [
  { text: from, ms: HOLD_MS },
  ...Array.from({ length: from.length }, (_, i) => ({
    text: from.slice(0, from.length - 1 - i),
    ms: DELETE_MS,
  })),
  ...Array.from({ length: to.length }, (_, i) => ({
    text: to.slice(0, i + 1),
    ms: TYPE_MS,
  })),
];

/**
 * One full cycle, from the first word through every other and back to the
 * first, so cycles chain end to start with no jump.
 */
const cycleOf = (words: readonly string[]): readonly Frame[] =>
  words.flatMap((from, index) =>
    framesBetween(from, words[(index + 1) % words.length]),
  );

/** The words in `data-words`, or none when the attribute is missing or wrong. */
const wordsOf = (root: HTMLElement): readonly string[] => {
  try {
    const parsed: unknown = JSON.parse(root.dataset.words ?? '[]');
    return Array.isArray(parsed) &&
      parsed.every((word) => typeof word === 'string' && word !== '')
      ? parsed
      : [];
  } catch {
    return [];
  }
};

const run = async (root: HTMLElement): Promise<void> => {
  const live = root.querySelector<HTMLElement>('[data-typewriter-live]');
  const caret = root.querySelector<HTMLElement>('[data-typewriter-caret]');
  const words = wordsOf(root);
  if (!live || words.length < 2) return;

  caret?.removeAttribute('hidden');
  const cycle = cycleOf(words);

  // Play the frames one after another: each waits on the one before it.
  const play = (): Promise<void> =>
    cycle.reduce(async (previous, frame) => {
      await previous;
      live.replaceChildren(frame.text);
      await wait(frame.ms);
    }, Promise.resolve());

  // Each cycle starts once the last one ends. The awaits unwind every time,
  // so the loop never grows the call stack.
  const loop = async (): Promise<void> => {
    await play();
    return loop();
  };

  await loop();
};

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const start = (): void => {
  const roots = document.querySelectorAll<HTMLElement>('[data-typewriter]');
  if (roots.length === 0 || !wantsMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Unobserve first, so a heading never runs two loops at once.
        observer.unobserve(entry.target);
        void run(entry.target as HTMLElement);
      });
    },
    { threshold: THRESHOLD },
  );

  roots.forEach((root) => observer.observe(root));
};

start();

/** Makes this file a module, so its constants do not clash with `counters.ts`. */
export {};
