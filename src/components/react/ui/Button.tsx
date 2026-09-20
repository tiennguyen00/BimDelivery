/**
 * The button, in its React form (spec 0003).
 *
 * It shares `buttonClass` with the Astro button, so the two are the same
 * design in two idioms and cannot drift apart visually. It renders a
 * `<button>` only: the contact island has no reason to need a link button,
 * and the Astro one is there when a page does.
 *
 * Nothing here is hydrated by default. It renders to static HTML unless
 * feature 10's island asks for it.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClass, cx, type ButtonVariant } from '../../ui/styles';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  children: ReactNode;
};

export const Button = ({
  variant = 'primary',
  type = 'button',
  className,
  children,
  ...rest
}: Props) => (
  <button {...rest} type={type} className={cx(buttonClass(variant), className)}>
    {children}
  </button>
);
