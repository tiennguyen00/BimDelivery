/**
 * The FAQ's instant search and linked questions (spec 0020), on the hub and
 * every region page.
 *
 * Like the other scripts, it enhances markup that is already complete. The
 * build writes every searchable item with its `data-faq-text`, its question
 * and plain answer already lower case and without accents, and ships the
 * search box `no-js:hidden`. So with JavaScript off the box is simply absent
 * and the page shows everything it was built with.
 *
 * Search. A question matches when every word typed appears in its text,
 * ignoring case and accents: the typed words run through `normaliseSearch`
 * from `src/lib/faq.ts`, the same function the build used. Matching only
 * toggles `hidden` on items, never builds or removes markup, and never
 * touches a question's `open` state, so clearing the box brings every
 * question back exactly as the visitor left it. On the hub the results list
 * is wrapped in `data-faq-results`, shown only while the box holds words
 * that match something.
 *
 * Linked questions. On load and on every `hashchange`, the `details` whose
 * `id` is the hash, when it is a `data-faq-item`, gets `open` and is
 * scrolled into view; `scroll-padding-top` (in `PageLayout.astro`) keeps it
 * below the header. It is found with `getElementById` on the decoded hash,
 * never a `#` selector, so no hash can break a query. A linked question the
 * search is hiding clears the search first.
 *
 * Hooks, written in `FaqSearch.astro` and the two FAQ routes:
 *
 * - `form[data-faq-search]`, with `data-faq-target` (the id of the list it
 *   filters), `data-faq-one` and `data-faq-other` (the status templates,
 *   each with `{count}`), and `data-faq-locale`.
 * - `[data-faq-status]`, the polite status line; `[data-faq-empty]`, the no
 *   results message; `[data-faq-results]`, the hub's results wrapper.
 * - `[data-faq-text]` on each item in the target list, and
 *   `details[data-faq-item]` on each question of a region page.
 *
 * Nothing here animates, so reduced motion needs no check of its own (the
 * scroll follows the page's `scroll-behavior`, which reduced motion turns
 * off). Writes go through `toggleAttribute`, `setAttribute`, and
 * `replaceChildren`, never property assignment (`counters.ts` says why).
 */
import { countLine, matchesSearch, normaliseSearch } from '../lib/faq';

type Hooks = Readonly<{
  form: HTMLFormElement;
  input: HTMLInputElement;
  items: readonly HTMLElement[];
  status: HTMLElement | null;
  empty: HTMLElement | null;
  results: HTMLElement | null;
}>;

/** Shows the items that match the box and hides the rest. */
const apply = ({ form, input, items, status, empty, results }: Hooks) => {
  const query = normaliseSearch(input.value);
  const searching = query !== '';
  const shown = new Set(
    items.filter((item) => matchesSearch(item.dataset.faqText ?? '', query)),
  );

  items.forEach((item) => {
    item.toggleAttribute('hidden', !shown.has(item));
  });
  results?.toggleAttribute('hidden', !searching || shown.size === 0);
  empty?.toggleAttribute('hidden', !searching || shown.size > 0);

  const { faqOne = '', faqOther = '', faqLocale } = form.dataset;
  status?.replaceChildren(
    searching
      ? countLine(
          { one: faqOne, other: faqOther },
          shown.size,
          faqLocale ?? document.documentElement.lang,
        )
      : '',
  );
};

const startSearch = (): Hooks | undefined => {
  const form = document.querySelector<HTMLFormElement>('form[data-faq-search]');
  const input = form?.querySelector<HTMLInputElement>('input[type="search"]');
  const list = form
    ? document.getElementById(form.dataset.faqTarget ?? '')
    : null;
  if (!form || !input || !list) return undefined;

  const hooks: Hooks = {
    form,
    input,
    items: [...list.querySelectorAll<HTMLElement>('[data-faq-text]')],
    status: document.querySelector<HTMLElement>('[data-faq-status]'),
    empty: document.querySelector<HTMLElement>('[data-faq-empty]'),
    results: document.querySelector<HTMLElement>('[data-faq-results]'),
  };

  input.addEventListener('input', () => {
    apply(hooks);
  });

  // Enter in the box would submit the form and reload the page.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  // The browser may restore the box's words on back or reload.
  if (input.value !== '') apply(hooks);

  return hooks;
};

/** The id in the address's hash, or nothing for an empty or broken one. */
const hashId = (): string => {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return '';
  }
};

/** Opens the question the hash names and brings it into view. */
const openLinked = (search: Hooks | undefined) => {
  const id = hashId();
  const target = id === '' ? null : document.getElementById(id);
  if (
    !(target instanceof HTMLDetailsElement) ||
    !target.hasAttribute('data-faq-item')
  ) {
    return;
  }
  if (target.hidden && search) {
    // The box has no `value` attribute, so a reset empties it.
    search.form.reset();
    apply(search);
  }
  target.setAttribute('open', '');
  target.scrollIntoView({ block: 'start' });
};

const search = startSearch();
openLinked(search);
window.addEventListener('hashchange', () => {
  openLinked(search);
});
