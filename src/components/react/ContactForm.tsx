/**
 * The contact form, the site's one React island (spec 0011).
 *
 * It owns the nine fields, their checks, the Turnstile widget, and the thank
 * you panel, and it reaches the outside world only through `submitContact`
 * in `src/lib/contact.ts`, which sends nothing yet. Every word it shows
 * arrives in `copy`, from the page's content entry.
 *
 * How it behaves, in order:
 *
 * - The server HTML is the whole form inside one `<fieldset disabled>`, so
 *   before hydration, and for good with JavaScript off, nothing can be typed
 *   or submitted. The first render here is disabled too, so it matches the
 *   HTML, and an effect enables it after mount.
 * - No error shows while a visitor types before their first Submit. Submit
 *   shows every failing field's message under it and moves focus to the
 *   first; from then on each message follows its field's value.
 * - Submit with no Turnstile token never submits, and shows the captcha
 *   message with the email to write to instead. The same message appears on
 *   its own once the check fails. It never moves focus.
 * - A valid request with a token goes to `submitContact`; while it is
 *   pending the button says so and a second click does nothing. Success
 *   swaps the form for the thank you panel and focuses its heading. A failed
 *   result keeps every typed value and resets the widget, since a token works
 *   only once.
 *
 * Nothing typed is ever put in a URL, storage, a cookie, or a log.
 */
import { PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import {
  CONTACT_FIELDS,
  submitContact,
  toContactRequest,
  validateContactRequest,
  type AllowedChoices,
  type ContactField,
  type ContactValues,
  type ErrorCode,
  type FieldErrors,
} from '../../lib/contact';
import { Button } from './ui/Button';
import { Select, type SelectOption } from './ui/Select';
import { TextArea } from './ui/TextArea';
import { TextField } from './ui/TextField';
import { useTurnstile } from './useTurnstile';

export type ContactFormCopy = Readonly<{
  labels: Readonly<Record<ContactField, string>>;
  optionalHint: string;
  selectPrompt: string;
  needOtherLabel: string;
  submitLabel: string;
  sendingLabel: string;
  errors: Readonly<Record<ErrorCode | 'captcha' | 'deliveryFailed', string>>;
  success: Readonly<{ heading: string; text: string }>;
}>;

type Props = Readonly<{
  copy: ContactFormCopy;
  /** The services, in collection order: `slug` as value, `title` as label. */
  needs: readonly SelectOption[];
  projectTypes: readonly SelectOption[];
  lodOptions: readonly SelectOption[];
  /** Where to write instead when the captcha cannot be passed. */
  email: string;
  /** The page's language, for the Turnstile widget. */
  lang: string;
}>;

type FormState = 'idle' | 'submitting' | 'success';

/** The `other` "Your needs" answer, reserved from service slugs (spec 0011). */
const OTHER_NEED = 'other';

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

const firstFailing = (errors: FieldErrors): ContactField | undefined =>
  CONTACT_FIELDS.find((field) => errors[field] !== undefined);

export const ContactForm = ({
  copy,
  needs,
  projectTypes,
  lodOptions,
  email,
  lang,
}: Props) => {
  const baseId = useId();
  const fieldId = (field: ContactField): string => `${baseId}-${field}`;

  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [showLive, setShowLive] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [deliveryFailed, setDeliveryFailed] = useState(false);
  const [captchaAsked, setCaptchaAsked] = useState(false);

  // Guards against a second submit landing before the disabled button renders.
  const pendingRef = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  // The field to focus once the render that shows its error has landed, so a
  // screen reader reads the field together with its message.
  const focusRef = useRef<ContactField | null>(null);

  const turnstile = useTurnstile({
    siteKey: PUBLIC_TURNSTILE_SITE_KEY,
    action: 'contact',
    theme: 'dark',
    language: lang,
  });

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

  // A token arriving answers the captcha message.
  useEffect(() => {
    if (turnstile.token !== null) setCaptchaAsked(false);
  }, [turnstile.token]);

  /** The field errors alone; the token is the captcha message's business. */
  const checkFields = (next: ContactValues): FieldErrors => {
    const result = validateContactRequest(toContactRequest(next, ''), allowed);
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

  const submit = async (): Promise<void> => {
    if (pendingRef.current) return;

    const token = turnstile.token;
    const result = validateContactRequest(
      toContactRequest(values, token ?? ''),
      allowed,
    );
    const fieldErrors = result.ok ? NO_ERRORS : result.errors;

    setShowLive(true);
    setErrors(fieldErrors);
    setDeliveryFailed(false);
    focusField(firstFailing(fieldErrors));

    if (token === null) {
      setCaptchaAsked(true);
      if (turnstile.status === 'error') turnstile.reset();
      return;
    }
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
    turnstile.reset();
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
      <div className="rounded-ui bg-white px-6 py-10 text-center shadow-lg md:px-10">
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="font-bold text-gold-ink"
        >
          {copy.success.heading}
        </h3>
        <p className="mt-4 text-lead text-ink-strong">{copy.success.text}</p>
      </div>
    );
  }

  const submitting = formState === 'submitting';
  const showCaptcha = turnstile.status === 'error' || captchaAsked;

  /** What every field shares: its id, name, value, handler, error, and the dark surface. */
  const common = (field: ContactField) => {
    const code = errors[field];
    return {
      id: fieldId(field),
      name: field,
      label: copy.labels[field],
      value: values[field],
      onChange: update(field),
      error: code === undefined ? undefined : copy.errors[code],
      surface: 'dark' as const,
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

        <div role="alert" className="mt-6 empty:mt-0">
          {deliveryFailed && (
            <p className="text-error-on-dark">{copy.errors.deliveryFailed}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-end">
          <div className="flex flex-col gap-2">
            <div ref={turnstile.containerRef} className="min-h-16.25 w-75" />
            <div
              role="alert"
              className="max-w-75 text-small text-error-on-dark"
            >
              {showCaptcha && (
                <p>
                  {copy.errors.captcha}{' '}
                  <a
                    href={`mailto:${email}`}
                    className="font-semibold wrap-anywhere text-white underline"
                  >
                    {email}
                  </a>
                </p>
              )}
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="md:min-w-40">
            {submitting ? copy.sendingLabel : copy.submitLabel}
          </Button>
        </div>
      </fieldset>
    </form>
  );
};
