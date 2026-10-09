/**
 * A multi line text field (spec 0003).
 *
 * The same shape as TextField, minus `type` and plus `rows`, so the two
 * behave identically for a label, a hint, and an error. See TextField for
 * why `id` is sometimes passed explicitly.
 */
import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
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

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  error?: string;
};

export const TextArea = ({
  name,
  label,
  id,
  hint,
  error,
  rows = 5,
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
      <textarea
        {...rest}
        id={controlId}
        name={name}
        rows={rows}
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
