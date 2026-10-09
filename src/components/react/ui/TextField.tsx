/**
 * A single line text, email, or phone field (spec 0003; `tel` from spec
 * 0011).
 *
 * The label is always visible, so there is no placeholder standing in for one.
 * An error is never colour alone: the control gets `aria-invalid`, the message
 * is linked through `aria-describedby`, and the outline thickens through an
 * inset ring so nothing on the page shifts when the error appears.
 *
 * There is one look everywhere: every surface a field sits on is dark, so the
 * box, label, hint, and error never adapt to it (spec 0003, 2026-10-09).
 *
 * About `id`: inside one React island `useId` is enough. A field placed
 * directly in an .astro file renders as its own React root, and ids can repeat
 * across roots, so those placements pass an explicit `id`.
 */
import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import {
  cx,
  fieldClass,
  fieldErrorClass,
  fieldHeadClass,
  fieldHintClass,
  fieldLabelClass,
  fieldWrapperClass,
} from '../../ui/styles';
import { describeField } from './field';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  id?: string;
  hint?: string;
  error?: string;
};

export const TextField = ({
  name,
  label,
  type = 'text',
  id,
  hint,
  error,
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
        <label htmlFor={controlId} className={fieldLabelClass}>
          {label}
        </label>
        {hint && (
          <p id={hintId} className={fieldHintClass}>
            {hint}
          </p>
        )}
      </div>
      <input
        {...rest}
        id={controlId}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(fieldClass(Boolean(error)), className)}
      />
      {error && (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
};
