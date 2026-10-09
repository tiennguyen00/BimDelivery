/**
 * The Project page's filter (spec 0014, revised 2026-10-09): the service tabs
 * and the two dropdowns in the hero narrow the photo wall to the projects
 * that match every choice.
 *
 * Like the other scripts, it enhances markup that is already complete. The
 * wall ships with every project showing, and the form ships `no-js:hidden`,
 * so with JavaScript off the visitor sees the whole wall and no control that
 * does nothing. A failed script leaves the form showing over a full wall,
 * which still lists every project.
 *
 * Matching is by name. Each field's `name` is a `data-` attribute on every
 * tile, written at build from `src/lib/project-gallery.ts`, and a tile shows
 * when, for every field with a value, its attribute equals that value. An
 * empty value ("All", "Any") matches everything. So a new filter is a new
 * field and a new attribute, never a change here.
 *
 * It reads four hooks, written in markup, never in content:
 *
 * - `data-project-filter` on the form, holding the id of the list it filters.
 * - `data-project-filter-status` on the polite status line, with the page's
 *   `data-locale` and the `data-one` and `data-other` templates, each with a
 *   `{count}` slot. A browser script cannot see `Astro.currentLocale`, the
 *   reason `counters.ts` gives.
 * - `data-project-filter-empty` on the block shown in place of an emptied
 *   wall. Its button is a native `type="reset"` for the form.
 *
 * A tile is hidden with the `hidden` attribute, so the grid closes up behind
 * it. A tile the scroll reveal is still holding back (`reveal.ts`) reveals
 * as usual when the filter brings it into view. Nothing here animates, so
 * reduced motion needs no check of its own. The first row's load entrance is
 * motion's (`enter.ts`), a Web Animation, which a tile coming back from
 * `display: none` does not replay, so there is nothing to tidy after it.
 *
 * Writes go through `toggleAttribute` and `replaceChildren`,
 * never property assignment, for the `no-param-reassign` reason given in
 * `counters.ts`.
 */

type Hooks = Readonly<{
  form: HTMLFormElement;
  tiles: readonly HTMLElement[];
  status: HTMLElement | null;
  empty: HTMLElement | null;
}>;

/** The fields with a value: the visitor's active choices, by field name. */
const choicesOf = (
  form: HTMLFormElement,
): readonly (readonly [string, string])[] =>
  [...new FormData(form)].flatMap(([name, value]) =>
    typeof value === 'string' && value !== '' ? [[name, value] as const] : [],
  );

const matches = (
  tile: HTMLElement,
  choices: readonly (readonly [string, string])[],
): boolean => choices.every(([name, value]) => tile.dataset[name] === value);

/**
 * "4 projects shown": the template the page's plural rules pick, `one` or
 * `other` (any other category falls back to `other`), with the count
 * formatted for the page's locale.
 */
const countLine = (status: HTMLElement, count: number): string => {
  const { locale, one = '', other = '' } = status.dataset;
  const template =
    new Intl.PluralRules(locale).select(count) === 'one' ? one : other;
  return template.replace(
    '{count}',
    new Intl.NumberFormat(locale).format(count),
  );
};

/**
 * Shows the matching tiles and hides the rest. `announce` is off for the
 * first run, which only catches up with a form the browser restored (the
 * back button), so a visitor arriving on the page hears nothing extra.
 */
const apply = ({ form, tiles, status, empty }: Hooks, announce: boolean) => {
  const choices = choicesOf(form);
  const shown = tiles.filter((tile) => matches(tile, choices));

  tiles.forEach((tile) => {
    tile.toggleAttribute('hidden', !shown.includes(tile));
  });
  empty?.toggleAttribute('hidden', shown.length > 0);
  if (announce) status?.replaceChildren(countLine(status, shown.length));
};

const startFilter = (): void => {
  const form = document.querySelector<HTMLFormElement>(
    'form[data-project-filter]',
  );
  const list = form
    ? document.getElementById(form.dataset.projectFilter ?? '')
    : null;
  if (!form || !list) return;

  const hooks: Hooks = {
    form,
    tiles: [...list.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    ),
    status: document.querySelector<HTMLElement>('[data-project-filter-status]'),
    empty: document.querySelector<HTMLElement>('[data-project-filter-empty]'),
  };

  form.addEventListener('change', () => {
    apply(hooks, true);
  });

  // Enter in a field would submit the form and reload the page.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  /**
   * The `reset` event fires before the fields go back to their defaults, so
   * the wall is redrawn on the next task, once they have. The reset button
   * lives in the empty block, which the redraw hides, so focus would fall to
   * the page: it moves to the first tile's link instead, the wall the
   * visitor asked for.
   */
  form.addEventListener('reset', () => {
    const fromEmpty = hooks.empty?.contains(document.activeElement) ?? false;
    setTimeout(() => {
      apply(hooks, true);
      if (fromEmpty) list.querySelector<HTMLElement>('a')?.focus();
    });
  });

  apply(hooks, false);
};

startFilter();
