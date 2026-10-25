import type { BlockDecoratorProps } from 'sanity';

/**
 * How an Accent phrase looks while editing: the site's accent (`--color-accent`), so an editor
 * sees which words will stand out. On the site it is `==accent==` (spec
 * 0019), drawn by `Emphasis.astro`.
 */
export const AccentDecorator = (props: BlockDecoratorProps) => (
  <span style={{ color: '#cf9d7b', fontWeight: 600 }}>{props.children}</span>
);

/** The Accent button's icon: a letter A in the accent. */
export const AccentIcon = () => (
  <span style={{ color: '#cf9d7b', fontWeight: 700 }}>A</span>
);
