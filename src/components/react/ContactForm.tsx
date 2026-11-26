/**
 * The contact form, the site's one React island (specs 0011 and 0022).
 *
 * It owns the nine fields, their checks, the hidden spam guard, and the thank
 * you panel, and it reaches the outside world only through `submitContact`
 * in `src/lib/contact.ts`, which posts to `/api/contact`. Every word it shows
 * arrives in `copy`, from the page's content entry.
 *
 * How it behaves, in order:
 *
 * - The server HTML is the whole form inside one `<fieldset disabled>`, so
 *   before hydration, and for good with JavaScript off, nothing can be typed
 *   or submitted. The first render here is disabled too, so it matches the
 *   HTML, and an effect enables it after mount and starts the fill timer.
 * - No error shows while a visitor types before their first Submit. Submit
 *   shows every failing field's message under it and moves focus to the
 *   first; from then on each message follows its field's value.
 * - A valid request goes to `submitContact` with the spam guard's two values:
 *   the hidden `website` field (empty for every person) and how long the form
 *   has been usable. While it is pending the button says so and a second
 *   click does nothing. Success swaps the form for the thank you panel and
 *   focuses its heading. A failed result keeps every typed value, and shows
 *   the field errors or the delivery message with the email to write to.
 *
 * There is no captcha: the endpoint's checks are invisible (spec 0022).
 * Nothing typed is ever put in a URL, storage, a cookie, or a log.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import {
  CONTACT_FIELDS,
  OTHER_NEED,
  submitContact,
  toContactRequest,
  validateContactRequest,
  type AllowedChoices,
  type ContactField,
  type ContactValues,
  type ErrorCode,
  type FieldErrors,
  type SpamGuard,
} from '../../lib/contact';
import { Button } from './ui/Button';
import { Select, type SelectOption } from './ui/Select';
import { TextArea } from './ui/TextArea';
import { TextField } from './ui/TextField';

export type ContactFormCopy = Readonly<{
  labels: Readonly<Record<ContactField, string>>;
  optionalHint: string;
  selectPrompt: string;
  needOtherLabel: string;
  submitLabel: string;
  sendingLabel: string;
  errors: Readonly<Record<ErrorCode | 'deliveryFailed', string>>;
  success: Readonly<{ heading: string; text: string }>;
}>;

type Props = Readonly<{
  copy: ContactFormCopy;
  /** The services, in collection order: `slug` as value, `title` as label. */
  needs: readonly SelectOption[];
  projectTypes: readonly SelectOption[];
  lodOptions: readonly SelectOption[];
  /** Where to write instead when a message could not be sent. */
  email: string;
}>;

type FormState = 'idle' | 'submitting' | 'success';

const EMPTY_VALUES: ContactValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  need: '',
  projectType: '',
  lod: '',
  message: '',
};

const NO_ERRORS: FieldErrors = {};

/** A guard that passes, for checking the fields alone while a visitor types. */
const FIELDS_ONLY: SpamGuard = { website: '', elapsedMs: 0 };

const firstFailing = (errors: FieldErrors): ContactField | undefined =>
  CONTACT_FIELDS.find((field) => errors[field] !== undefined);

export const ContactForm = ({
  copy,
  needs,
  projectTypes,
  lodOptions,
  email,
}: Props) => {
  const baseId = useId();
  const fieldId = (field: ContactField): string => `${baseId}-${field}`;

  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [showLive, setShowLive] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [deliveryFailed, setDeliveryFailed] = useState(false);

  // Guards against a second submit landing before the disabled button renders.
  const pendingRef = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  // The field to focus once the render that shows its error has landed, so a
  // screen reader reads the field together with its message.
  const focusRef = useRef<ContactField | null>(null);
  // The honeypot, read once at Submit. Uncontrolled: nothing a person does
  // ever changes it.
  const trapRef = useRef<HTMLInputElement>(null);
  // When the form became usable, for the guard's minimum fill time.
  const readyAtRef = useRef<number | null>(null);

  const allowed: AllowedChoices = useMemo(
    () => ({
      needs: needs.map((option) => option.value),
      projectTypes: projectTypes.map((option) => option.value),
      lods: lodOptions.map((option) => option.value),
    }),
    [needs, projectTypes, lodOptions],
  );

  const needOptions: readonly SelectOption[] = useMemo(
    () => [...needs, { value: OTHER_NEED, label: copy.needOtherLabel }],
    [needs, copy.needOtherLabel],
  );

  useEffect(() => {
    readyAtRef.current = performance.now();
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (formState === 'success') successHeadingRef.current?.focus();
  }, [formState]);

  // Runs after every render on purpose: it acts only when a submit asked for
  // focus, and by then the error it points at is in the DOM.
  useEffect(() => {
    const field = focusRef.current;
    if (field === null) return;
    focusRef.current = null;
    document.getElementById(fieldId(field))?.focus();
  });

  const checkFields = (next: ContactValues): FieldErrors => {
    const result = validateContactRequest(
      toContactRequest(next, FIELDS_ONLY),
      allowed,
    );
    return result.ok ? NO_ERRORS : result.errors;
  };

  const focusField = (field: ContactField | undefined): void => {
    if (field) focusRef.current = field;
  };

  const update =
    (field: ContactField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ): void => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      if (showLive) setErrors(checkFields(next));
    };

  const spamGuard = (): SpamGuard => {
    const now = performance.now();
    return {
      website: trapRef.current?.value ?? '',
      elapsedMs: Math.round(now - (readyAtRef.current ?? now)),
    };
  };

  const submit = async (): Promise<void> => {
    if (pendingRef.current) return;

    const result = validateContactRequest(
      toContactRequest(values, spamGuard()),
      allowed,
    );
    const fieldErrors = result.ok ? NO_ERRORS : result.errors;

    setShowLive(true);
    setErrors(fieldErrors);
    setDeliveryFailed(false);
    focusField(firstFailing(fieldErrors));

    if (!result.ok) return;

    pendingRef.current = true;
    setFormState('submitting');
    const outcome = await submitContact(result.value);
    pendingRef.current = false;

    if (outcome.ok) {
      setFormState('success');
      return;
    }
    setFormState('idle');
    if (outcome.kind === 'invalid') {
      setErrors(outcome.errors);
      focusField(firstFailing(outcome.errors));
    } else {
      setDeliveryFailed(true);
    }
  };

  const onSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void submit();
  };

  if (formState === 'success') {
    return (
      <div className="rounded-ui bg-panel px-6 py-10 text-center md:px-10">
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="font-bold text-accent"
        >
          {copy.success.heading}
        </h3>
        <p className="mt-4 text-lead text-ink-strong">{copy.success.text}</p>
      </div>
    );
  }

  const submitting = formState === 'submitting';

  /** What every field shares: its id, name, value, handler, and error. */
  const common = (field: ContactField) => {
    const code = errors[field];
    return {
      id: fieldId(field),
      name: field,
      label: copy.labels[field],
      value: values[field],
      onChange: update(field),
      error: code === undefined ? undefined : copy.errors[code],
    };
  };

  const optional = { hint: copy.optionalHint };

  return (
    <form method="post" noValidate aria-busy={submitting} onSubmit={onSubmit}>
      <fieldset disabled={!enabled} className="m-0 min-w-0 border-0 p-0">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextField
            {...common('name')}
            autoComplete="name"
            aria-required="true"
          />
          <TextField
            {...common('company')}
            {...optional}
            autoComplete="organization"
          />
          <TextField
            {...common('email')}
            type="email"
            autoComplete="email"
            aria-required="true"
          />
          <TextField
            {...common('phone')}
            {...optional}
            type="tel"
            autoComplete="tel"
          />
          <TextField
            {...common('country')}
            {...optional}
            autoComplete="country-name"
          />
          <Select
            {...common('need')}
            {...optional}
            options={needOptions}
            prompt={copy.selectPrompt}
          />
          <Select
            {...common('projectType')}
            {...optional}
            options={projectTypes}
            prompt={copy.selectPrompt}
          />
          <Select
            {...common('lod')}
            {...optional}
            options={lodOptions}
            prompt={copy.selectPrompt}
          />
          <div className="md:col-span-2">
            <TextArea {...common('message')} rows={6} aria-required="true" />
          </div>
        </div>

        {/* The honeypot (spec 0022): out of sight, out of the tab order, and
            hidden from screen readers, so no person ever fills it. A bot that
            fills every field does, and its request is quietly dropped. */}
        <div aria-hidden="true" className="sr-only">
          <input
            ref={trapRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div role="alert" className="mt-6 empty:mt-0">
          {deliveryFailed && (
            <p className="text-error">
              {copy.errors.deliveryFailed}{' '}
              <a
                href={`mailto:${email}`}
                className="font-semibold wrap-anywhere text-heading underline"
              >
                {email}
              </a>
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:justify-end">
          <Button type="submit" disabled={submitting} className="md:min-w-40">
            {submitting ? copy.sendingLabel : copy.submitLabel}
          </Button>
        </div>
      </fieldset>
    </form>
  );
};
