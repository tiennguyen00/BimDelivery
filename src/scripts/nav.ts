/**
 * The navigation behaviour (spec 0004).
 *
 * This module enhances markup that already works. `Header.astro` ships both
 * panels open, so every link is reachable with no JavaScript at all; everything
 * here is about closing them and making them behave. If this file fails to load
 * or throws, the site stays usable and the loss is cosmetic.
 *
 * Two independent machines live here, the desktop services dropdown and the
 * mobile menu, plus one `matchMedia` listener that closes whichever one belongs
 * to the breakpoint being left. Without that listener, a dropdown opened on a
 * wide window and then narrowed would leave `aria-expanded="true"` on a control
 * nobody can see.
 *
 * A note on one unavoidable gap: the panels ship open and the CSS closes them
 * the moment the flag script in the document head runs, which is before the
 * first paint. This module runs after paint, so between those two points a
 * button says `aria-expanded="true"` about a panel already hidden. The window
 * is a few milliseconds and it is the price of a nav that works without
 * scripting. Closing the panels in the markup instead would trade it for a
 * permanent lie in the no script case, which is the worse deal.
 */

/**
 * The one place the desktop boundary is written down at runtime. It mirrors
 * Tailwind's `lg` token, which is also the `--header-h` media query in
 * `PageLayout.astro`. Nothing enforces that the three agree, so a token change
 * needs a deliberate look at all of them.
 */
export const DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * The ids are fixed in spec 0004 rather than generated, because `aria-controls`
 * needs a stable target and SERVICES exists twice in the DOM.
 */
const ID = {
  desktopButton: 'nav-services-desktop-btn',
  desktopPanel: 'nav-services-desktop',
  menuButton: 'nav-menu-btn',
  menuPanel: 'nav-menu-panel',
  mobileButton: 'nav-services-mobile-btn',
  mobilePanel: 'nav-services-mobile',
} as const;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Only the elements a visitor could actually reach. A hidden element has no
 * offset parent, which is how a collapsed SERVICES list inside the panel drops
 * out of the cycle and reappears the moment it is expanded.
 */
const focusableWithin = (root: HTMLElement): readonly HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null,
  );

const element = (id: string): HTMLElement | null => document.getElementById(id);

type Disclosure = Readonly<{
  button: HTMLElement;
  panel: HTMLElement;
  isOpen: () => boolean;
  setOpen: (open: boolean) => void;
  links: () => readonly HTMLAnchorElement[];
}>;

/**
 * One button controlling one panel. `aria-expanded` and the `data-open`
 * attribute the CSS reads are set together and never apart, which is what keeps
 * the announced state and the visible state the same thing.
 */
const disclosure = (button: HTMLElement, panel: HTMLElement): Disclosure => ({
  button,
  panel,
  isOpen: () => button.getAttribute('aria-expanded') === 'true',
  setOpen: (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.setAttribute('data-open', '');
    else panel.removeAttribute('data-open');
  },
  links: () => Array.from(panel.querySelectorAll('a')),
});

/** Moves focus around a list, wrapping at both ends. */
const focusAt = (items: readonly HTMLElement[], index: number): void => {
  if (items.length === 0) return;
  const wrapped = (index + items.length) % items.length;
  items[wrapped]?.focus();
};

/**
 * The services dropdown in the desktop bar.
 *
 * It opens on hover because that is what a pointer user expects of a menu bar,
 * and on click, Enter, Space or ArrowDown because a hover is not available to
 * everyone. Escape and a second click return focus to the button; the other
 * ways of closing it leave focus alone, since they all happen because focus has
 * gone somewhere else already.
 */
const wireDropdown = (menu: Disclosure): (() => void) => {
  const item = menu.button.closest('li');
  const header = menu.button.closest('header');
  const close = (restoreFocus: boolean) => {
    if (!menu.isOpen()) return;
    menu.setOpen(false);
    if (restoreFocus) menu.button.focus();
  };

  menu.button.addEventListener('click', () => {
    if (menu.isOpen()) close(true);
    else menu.setOpen(true);
  });

  menu.button.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      // Opening with ArrowDown should land the visitor on the first item.
      event.preventDefault();
      menu.setOpen(true);
      focusAt(menu.links(), 0);
    } else if (event.key === 'Escape') {
      close(true);
    }
  });

  menu.panel.addEventListener('keydown', (event: KeyboardEvent) => {
    const links = menu.links();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusAt(links, index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusAt(links, index - 1);
    } else if (event.key === 'Escape') {
      close(true);
    }
  });

  if (item) {
    /**
     * Mouse only. A tap fires `pointerenter` and then `click`, so without this
     * guard a touch user would open the panel with the enter and immediately
     * close it again with the click, and SERVICES would look broken on every
     * touch screen wide enough to show the desktop bar.
     */
    item.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType === 'mouse') menu.setOpen(true);
    });
    item.addEventListener('pointerleave', (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      /**
       * Keyboard focus inside the panel outranks a mouse wandering off it.
       * Closing here would hide the element that currently has focus, and focus
       * would be lost to the top of the document.
       */
      if (item.contains(document.activeElement)) return;
      close(false);
    });

    /**
     * Focus leaving the SERVICES item closes it, which covers focus leaving the
     * header as well and also the nearer case: tabbing out of the last panel
     * link onto the next nav item, where an open panel left behind just looks
     * broken.
     */
    item.addEventListener('focusout', (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (!(next instanceof Node) || !item.contains(next)) close(false);
    });
  }

  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target;
    if (header && target instanceof Node && !header.contains(target)) {
      close(false);
    }
  });

  return () => close(false);
};

/**
 * The mobile menu: a full height panel under the sticky header.
 *
 * While it is open it behaves as a dialog, because that is what it is: the page
 * behind it cannot be scrolled or tabbed into. The focusable set is recomputed
 * on every Tab so that expanding SERVICES inside the panel adds its three links
 * to the cycle straight away, rather than after the next open.
 */
const wireMobileMenu = (
  menu: Disclosure,
  services: Disclosure | null,
): (() => void) => {
  const openLabel = menu.button.dataset.openLabel ?? '';
  const closeLabel = menu.button.dataset.closeLabel ?? '';

  const lockScroll = (locked: boolean) => {
    // `scrollbar-gutter` keeps the space the scrollbar occupied, so the page
    // behind does not jump sideways the moment it stops scrolling.
    document.body.style.overflow = locked ? 'hidden' : '';
    document.body.style.scrollbarGutter = locked ? 'stable' : '';
  };

  const setOpen = (open: boolean) => {
    menu.setOpen(open);
    menu.button.setAttribute('aria-label', open ? closeLabel : openLabel);
    lockScroll(open);
  };

  const close = (restoreFocus: boolean) => {
    if (!menu.isOpen()) return;
    setOpen(false);
    if (restoreFocus) menu.button.focus();
  };

  menu.button.addEventListener('click', () => {
    if (menu.isOpen()) {
      close(true);
      return;
    }
    setOpen(true);
    focusAt(focusableWithin(menu.panel), 0);
  });

  /**
   * The trap listens on the document rather than the panel, because the
   * hamburger is one of the stops and it sits outside the panel. On the panel,
   * a Shift Tab from the hamburger would never reach this handler and focus
   * would escape backwards to the logo, out of a menu that is supposed to hold
   * it.
   *
   * The hamburger is in the cycle on purpose: it is the panel's close control,
   * it stays visible above it, and leaving it out would make Escape the only
   * way out for a keyboard user.
   *
   * Between the ends the browser's own order already matches, so only the two
   * boundaries are intercepted. The focusable set is rebuilt on every Tab, so
   * expanding SERVICES inside the panel adds its links to the cycle at once.
   */
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!menu.isOpen()) return;

    if (event.key === 'Escape') {
      close(true);
      return;
    }
    if (event.key !== 'Tab') return;

    const stops = [menu.button, ...focusableWithin(menu.panel)];
    const index = stops.indexOf(document.activeElement as HTMLElement);

    // Focus is somewhere it should not be; bring it back rather than guess.
    if (index === -1) {
      event.preventDefault();
      focusAt(stops, 0);
      return;
    }

    const next = event.shiftKey ? index - 1 : index + 1;
    if (next < 0 || next >= stops.length) {
      event.preventDefault();
      focusAt(stops, next);
    }
  });

  // Following a link closes the menu, so coming back with the back button does
  // not land on a page with the menu still over it.
  menu.panel.addEventListener('click', (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      close(false);
    }
  });

  if (services) {
    services.button.addEventListener('click', () => {
      services.setOpen(!services.isOpen());
    });
    // Escape is handled once, on the document, for the whole menu.
  }

  return () => close(false);
};

const init = (): void => {
  /**
   * The `js` flag is the single switch for "the nav is script managed". The
   * flag script in the document head sets it, and the CSS that hides the panels
   * is gated on the same flag, so without it this module must stay inert: it
   * would otherwise report panels closed that nothing has hidden. That is the
   * state the dev only style guide is in, since it renders `BaseLayout`
   * directly and never gets the flag.
   */
  if (!document.documentElement.classList.contains('js')) return;

  const desktopButton = element(ID.desktopButton);
  const desktopPanel = element(ID.desktopPanel);
  const menuButton = element(ID.menuButton);
  const menuPanel = element(ID.menuPanel);
  const mobileButton = element(ID.mobileButton);
  const mobilePanel = element(ID.mobilePanel);

  /**
   * The SERVICES controls are absent when the services collection is empty, so
   * every lookup is allowed to come back null and the rest still wires up.
   */
  const dropdown =
    desktopButton && desktopPanel
      ? disclosure(desktopButton, desktopPanel)
      : null;
  const mobileServices =
    mobileButton && mobilePanel ? disclosure(mobileButton, mobilePanel) : null;
  const mobileMenu =
    menuButton && menuPanel ? disclosure(menuButton, menuPanel) : null;

  // The markup ships open. Closing it here is the first thing that happens, so
  // the announced state catches up with what the CSS already did.
  dropdown?.setOpen(false);
  mobileServices?.setOpen(false);
  if (mobileMenu) {
    mobileMenu.setOpen(false);
    mobileMenu.button.setAttribute(
      'aria-label',
      mobileMenu.button.dataset.openLabel ?? '',
    );
  }

  const closeDropdown = dropdown ? wireDropdown(dropdown) : () => {};
  const closeMobileMenu = mobileMenu
    ? wireMobileMenu(mobileMenu, mobileServices)
    : () => {};

  /**
   * One listener for both boundary crossings. Whichever machine belongs to the
   * breakpoint being left is closed, in both directions.
   */
  const desktop = window.matchMedia(DESKTOP_QUERY);
  desktop.addEventListener('change', (event: MediaQueryListEvent) => {
    if (event.matches) {
      closeMobileMenu();
      mobileServices?.setOpen(false);
    } else {
      closeDropdown();
    }
  });
};

init();
