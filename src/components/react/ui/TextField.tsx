/**
 * A single line text, email, or phone field (spec 0003; `tel` and `surface`
 * from spec 0011).
 *
 * The label is always visible, so there is no placeholder standing in for one.
 * An error is never colour alone: the control gets `aria-invalid`, the message
 * is linked through `aria-describedby`, and the outline thickens through an
 * inset ring so nothing on the page shifts when the error appears.
 *
 * `surface` is what the field sits on. `dark` makes the label and hint white
 * and the error `error-on-dark`, for the contact page's form band; the white
 * control box is the same on both.
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
  type Surface,
} from '../../ui/styles';
import { describeField } from './field';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  id?: string;
  hint?: string;
  error?: string;
  surface?: Surface;
};

export const TextField = ({
  name,
  label,
  type = 'text',
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
        <p id={errorId} className={fieldErrorClass[surface]}>
          {error}
        </p>
      )}
    </div>
  );
};
