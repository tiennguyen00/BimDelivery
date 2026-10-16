/**
 * The Project filter's dropdowns (2026-10-16): brings `FilterSelect`'s
 * button and list to life as a "select only combobox" (WAI-ARIA practices),
 * writing every choice back to the hidden native `<select>` that is the
 * form's real field.
 *
 * It reads hooks written in markup, never in content:
 *
 * - `data-select-menu` on each control's root, which gets `data-open` while
 *   its list is showing (the chevron turns, the border goes `accent`).
 * - `data-select-button`, the `combobox`, which keeps focus throughout.
 * - `data-select-list`, the `listbox`, shown and hidden with `hidden`.
 * - `data-select-value`, the words in the button.
 * - Each `option`'s `data-value` (its `<select>` value) and its
 *   `data-select-label` (its words).
 *
 * State lives in the DOM, not in variables: the open state is the button's
 * `aria-expanded`, the active option its `aria-activedescendant`, and the
 * choice the `<select>`'s value. A choice dispatches a bubbling `change`, so
 * `project-filter.ts` redraws the wall as it would for the native control.
 * A form `reset` puts the `<select>`s back first, so the buttons catch up on
 * the next task, as the filter does.
 *
 * Keys follow the practices: Enter, Space, and the arrows open; inside, the
 * arrows, Home, and End move, Enter and Space choose, Escape closes, Tab
 * chooses and moves on, and a letter jumps to the next option starting with
 * it.
 *
 * Opening and closing are motion's (`animate` from `motion/mini`), since
 * every animation on the Project page is: the list fades in, drops 8px, and
 * unfolds from its top over 200ms, its options following 25ms apart; it
 * fades and lifts away over 120ms when it closes. The state changes at once
 * either way, so a screen reader and the keyboard never wait on the motion.
 * Under reduced motion nothing moves. The chevron's turn stays a CSS
 * transition, a small one like a hover.
 *
 * `select.value` is the one property assignment: the `selected` attribute
 * would change the field's default and break the form's reset. It is a local,
 * not a parameter, so `no-param-reassign` (see `counters.ts`) holds.
 */
import { animate } from 'motion/mini';

/** How far the list drops into place as it opens. */
const DROP_PX = 8;

const OPEN_S = 0.2;

const CLOSE_S = 0.12;

/** The wait between options, capped so a long list is not slow to settle. */
const STAGGER_S = 0.025;
const STAGGER_MAX = 8;

type Parts = Readonly<{
  root: HTMLElement;
  select: HTMLSelectElement;
  button: HTMLButtonElement;
  list: HTMLElement;
  value: HTMLElement;
  options: readonly HTMLElement[];
}>;

const partsOf = (root: HTMLElement): Parts | null => {
  const select = root.querySelector('select');
  const button = root.querySelector<HTMLButtonElement>('[data-select-button]');
  const list = root.querySelector<HTMLElement>('[data-select-list]');
  const value = root.querySelector<HTMLElement>('[data-select-value]');
  if (!select || !button || !list || !value) return null;
  return {
    root,
    select,
    button,
    list,
    value,
    options: [...list.querySelectorAll<HTMLElement>('[role="option"]')],
  };
};

const labelOf = (option: HTMLElement): string =>
  option.querySelector('[data-select-label]')?.textContent?.trim() ?? '';

const isOpen = ({ button }: Parts): boolean =>
  button.getAttribute('aria-expanded') === 'true';

const selectedIndex = ({ select, options }: Parts): number =>
  Math.max(
    0,
    options.findIndex((option) => option.dataset.value === select.value),
  );

const activeIndex = ({ button, options }: Parts): number =>
  options.findIndex(
    (option) => option.id === button.getAttribute('aria-activedescendant'),
  );

/** Draws the `<select>`'s value: the button's words and the checked option. */
const sync = (parts: Parts): void => {
  const chosen = selectedIndex(parts);
  parts.options.forEach((option, index) => {
    option.setAttribute('aria-selected', String(index === chosen));
  });
  const option = parts.options[chosen];
  if (option) parts.value.replaceChildren(labelOf(option));
};

/** Scrolls the list, never the page, just far enough to show `option`. */
const keepInView = (list: HTMLElement, option: HTMLElement): void => {
  const top = option.offsetTop;
  const bottom = top + option.offsetHeight;
  if (top < list.scrollTop) list.scrollTo({ top });
  else if (bottom > list.scrollTop + list.clientHeight)
    list.scrollTo({ top: bottom - list.clientHeight });
};

const setActive = (parts: Parts, index: number): void => {
  const target = parts.options[index];
  if (!target) return;
  parts.options.forEach((option) => {
    option.toggleAttribute('data-active', option === target);
  });
  parts.button.setAttribute('aria-activedescendant', target.id);
  keepInView(parts.list, target);
};

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Hands an element back to its classes once motion has finished with it. */
const clearInline = (element: HTMLElement): void => {
  element.style.removeProperty('opacity');
  element.style.removeProperty('transform');
};

/**
 * Stops whatever the list and its options are still playing, so a list
 * reopened mid close (or closed mid open) starts from where it is drawn.
 * motion/mini plays through Web Animations, so the DOM holds them.
 */
const stopMotion = ({ list, options }: Parts): void => {
  [list, ...options].forEach((element) => {
    element.getAnimations().forEach((animation) => {
      animation.cancel();
    });
    clearInline(element);
  });
};

/** The list drops 8px into place and unfolds; its options follow, staggered. */
const playOpen = (parts: Parts): void => {
  animate(
    parts.list,
    {
      opacity: [0, 1],
      transform: [
        `translateY(-${DROP_PX}px) scaleY(0.96)`,
        'translateY(0) scaleY(1)',
      ],
    },
    { duration: OPEN_S, ease: 'easeOut' },
  ).then(() => {
    clearInline(parts.list);
  });
  parts.options.forEach((option, index) => {
    animate(
      option,
      { opacity: [0, 1], transform: ['translateY(-4px)', 'none'] },
      {
        duration: OPEN_S,
        delay: Math.min(index, STAGGER_MAX) * STAGGER_S,
        ease: 'easeOut',
      },
    ).then(() => {
      clearInline(option);
    });
  });
};

const openList = (parts: Parts, index = selectedIndex(parts)): void => {
  stopMotion(parts);
  parts.list.removeAttribute('hidden');
  parts.button.setAttribute('aria-expanded', 'true');
  parts.root.setAttribute('data-open', '');
  setActive(parts, index);
  if (wantsMotion()) playOpen(parts);
};

/**
 * Closed at once for assistive tech and the chevron; the list itself fades
 * and lifts away first, and is hidden only if nothing reopened it meanwhile.
 */
const closeList = (parts: Parts): void => {
  if (!isOpen(parts)) return;
  stopMotion(parts);
  parts.button.setAttribute('aria-expanded', 'false');
  parts.button.removeAttribute('aria-activedescendant');
  parts.root.removeAttribute('data-open');
  parts.options.forEach((option) => {
    option.removeAttribute('data-active');
  });
  const hide = (): void => {
    if (isOpen(parts)) return;
    parts.list.setAttribute('hidden', '');
    clearInline(parts.list);
  };
  if (!wantsMotion()) {
    hide();
    return;
  }
  animate(
    parts.list,
    {
      opacity: [1, 0],
      transform: ['translateY(0)', `translateY(-${DROP_PX / 2}px)`],
    },
    { duration: CLOSE_S, ease: 'easeIn' },
  ).then(hide);
};

const choose = (parts: Parts, index: number): void => {
  const value = parts.options[index]?.dataset.value;
  const { select } = parts;
  if (value !== undefined && value !== select.value) {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  sync(parts);
  closeList(parts);
};

/** The next option after the active one whose words start with `key`. */
const matchIndex = (parts: Parts, key: string): number => {
  const from = activeIndex(parts);
  const count = parts.options.length;
  const order = parts.options.map(
    (_, step) => (from + 1 + step + count) % count,
  );
  const found = order.find((index) =>
    labelOf(parts.options[index] as HTMLElement)
      .toLocaleLowerCase()
      .startsWith(key.toLocaleLowerCase()),
  );
  return found ?? -1;
};

const isPrintable = (event: KeyboardEvent): boolean =>
  event.key.length === 1 &&
  event.key !== ' ' &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

const onKeyClosed = (parts: Parts, event: KeyboardEvent): void => {
  const last = parts.options.length - 1;
  const opens: Readonly<Record<string, () => void>> = {
    ArrowDown: () => openList(parts),
    ArrowUp: () => openList(parts),
    Enter: () => openList(parts),
    ' ': () => openList(parts),
    Home: () => openList(parts, 0),
    End: () => openList(parts, last),
  };
  const action = opens[event.key];
  if (action) {
    event.preventDefault();
    action();
  } else if (isPrintable(event)) {
    const index = matchIndex(parts, event.key);
    if (index !== -1) openList(parts, index);
  }
};

const onKeyOpen = (parts: Parts, event: KeyboardEvent): void => {
  const active = activeIndex(parts);
  const last = parts.options.length - 1;
  if (event.key === 'Tab') {
    choose(parts, active);
    return;
  }
  if (event.key === 'ArrowUp' && event.altKey) {
    event.preventDefault();
    choose(parts, active);
    return;
  }
  const moves: Readonly<Record<string, () => void>> = {
    ArrowDown: () => setActive(parts, Math.min(active + 1, last)),
    ArrowUp: () => setActive(parts, Math.max(active - 1, 0)),
    Home: () => setActive(parts, 0),
    End: () => setActive(parts, last),
    PageDown: () => setActive(parts, Math.min(active + 10, last)),
    PageUp: () => setActive(parts, Math.max(active - 10, 0)),
    Enter: () => choose(parts, active),
    ' ': () => choose(parts, active),
    Escape: () => closeList(parts),
  };
  const action = moves[event.key];
  if (action) {
    event.preventDefault();
    action();
  } else if (isPrintable(event)) {
    const index = matchIndex(parts, event.key);
    if (index !== -1) setActive(parts, index);
  }
};

const startMenu = (parts: Parts): void => {
  const { root, button, list, options } = parts;

  button.addEventListener('click', () => {
    if (isOpen(parts)) closeList(parts);
    else openList(parts);
  });

  button.addEventListener('keydown', (event) => {
    if (isOpen(parts)) onKeyOpen(parts, event);
    else onKeyClosed(parts, event);
  });

  // Keeps focus on the button while the pointer picks an option.
  list.addEventListener('pointerdown', (event) => {
    event.preventDefault();
  });

  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      choose(parts, index);
      button.focus();
    });
    option.addEventListener('pointermove', () => {
      if (activeIndex(parts) !== index) setActive(parts, index);
    });
  });

  root.addEventListener('focusout', (event) => {
    if (!(
      event.relatedTarget instanceof Node && root.contains(event.relatedTarget)
    ))
      closeList(parts);
  });

  document.addEventListener('pointerdown', (event) => {
    if (
      isOpen(parts) &&
      !(event.target instanceof Node && root.contains(event.target))
    )
      closeList(parts);
  });

  button.form?.addEventListener('reset', () => {
    setTimeout(() => {
      sync(parts);
    });
  });

  sync(parts);
};

document.querySelectorAll<HTMLElement>('[data-select-menu]').forEach((root) => {
  const parts = partsOf(root);
  if (parts) startMenu(parts);
});
