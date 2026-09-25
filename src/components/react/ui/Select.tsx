/**
 * A dropdown field (spec 0011): the same shape and rules as TextField, around
 * a native `<select>`.
 *
 * Native on purpose. The browser's own control already works with a
 * keyboard, a screen reader, and a phone's picker, and a custom listbox would
 * have to rebuild all three. Only the box is styled, with the site's own
 * `chevron-down` as the arrow.
 *
 * The first choice is always an empty value labelled `prompt`, so nothing is
 * chosen for the visitor and an optional dropdown can be left alone. Every
 * `value` is a stable key and every `label` comes from content: the key is
 * what gets sent, never the label.
 *
 * See TextField for `surface`, and for why `id` is sometimes passed
 * explicitly.
 */
import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import {
  cx,
  fieldErrorClass,
  fieldHeadClass,
  fieldHintClass,
  fieldLabelClass,
  fieldWrapperClass,
  selectClass,
  type FieldSurface,
} from '../../ui/styles';
import { describeField } from './field';

export type SelectOption = Readonly<{ value: string; label: string }>;

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple'> & {
  name: string;
  label: string;
  options: readonly SelectOption[];
  /** The empty first choice, such as "Choose one". */
  prompt: string;
  id?: string;
  hint?: string;
  error?: string;
  surface?: FieldSurface;
};

export const Select = ({
  name,
  label,
  options,
  prompt,
  id,
  hint,
  error,
  surface = 'light',
  className,
  ...rest
}: Props) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const { hintId, errorId, describedBy } = describeField(
    controlId,
    hint,
    error,
  );

  return (
    <div className={fieldWrapperClass}>
      <div className={fieldHeadClass}>
        <label htmlFor={controlId} className={fieldLabelClass[surface]}>
          {label}
        </label>
        {hint && (
          <p id={hintId} className={fieldHintClass[surface]}>
            {hint}
          </p>
        )}
      </div>
      <select
        {...rest}
        id={controlId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(selectClass(Boolean(error)), className)}
      >
        <option value="">{prompt}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={fieldErrorClass[surface]}>
          {error}
        </p>
      )}
    </div>
  );
};
