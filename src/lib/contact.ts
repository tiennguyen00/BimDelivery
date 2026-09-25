/**
 * The contact form's rules and its one door to the outside world (spec 0011).
 *
 * The same module serves both ends of a submission: the form island checks a
 * request with it in the browser now, and the `POST /api/contact` endpoint
 * checks it again with the same schema when delivery is built. So there is
 * one copy of the rules, never two that can drift.
 *
 * Nothing here holds a word a visitor reads. A failed field returns a code
 * (`required`, `email`, `phone`, `tooLong`), and the page shows the message
 * its content entry gives that code, so the language stays in content.
 */
import { z } from 'astro/zod';

/** The nine fields, in the order the form shows them. */
export const CONTACT_FIELDS = [
  'name',
  'company',
  'email',
  'phone',
  'country',
  'need',
  'projectType',
  'lod',
  'message',
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

/** What can be wrong with one field. Each is a key of the content's `errors`. */
export type ErrorCode = 'required' | 'email' | 'phone' | 'tooLong';

export type FieldErrors = Readonly<Partial<Record<ContactField, ErrorCode>>>;

/**
 * The keys a dropdown may send, from the lists the page was built with. They
 * are passed in rather than written here, so the schema holds no list of its
 * own and a new service or project type is a content change only.
 */
export type AllowedChoices = Readonly<{
  needs: readonly string[];
  projectTypes: readonly string[];
  lods: readonly string[];
}>;

/** The fields as typed, before trimming or dropping the empty ones. */
export type ContactValues = Readonly<Record<ContactField, string>>;

const ERROR_CODES: readonly ErrorCode[] = [
  'required',
  'email',
  'phone',
  'tooLong',
];

const isErrorCode = (value: string): value is ErrorCode =>
  (ERROR_CODES as readonly string[]).includes(value);

const isContactField = (value: unknown): value is ContactField =>
  (CONTACT_FIELDS as readonly unknown[]).includes(value);

/** Digits, spaces, and `+ ( ) - .`, the characters a phone number is written with. */
const PHONE_CHARACTERS = /^[0-9 +().-]+$/;
const PHONE_MIN_DIGITS = 6;

const countDigits = (value: string): number =>
  value.replaceAll(/\D/g, '').length;

/** A required line of text: missing or blank is `required`. */
const requiredText = (max: number) =>
  z
    .string({ error: 'required' })
    .trim()
    .min(1, { error: 'required' })
    .max(max, { error: 'tooLong' });

/** An optional line of text. Left out entirely when empty (see `toContactRequest`). */
const optionalText = (max: number) =>
  z.string().trim().max(max, { error: 'tooLong' }).optional();

/**
 * An optional dropdown answer. A key outside the list can only come from a
 * tampered request or a stale page, never from choosing, so it is a bug
 * rather than a visitor mistake; it still needs a code, and `required` is the
 * one that tells the visitor to choose again.
 */
const optionalChoice = (allowed: readonly string[]) =>
  z
    .string()
    .refine((value) => allowed.includes(value), { error: 'required' })
    .optional();

/**
 * The `ContactRequest` schema, the JSON body of `POST /api/contact`. A
 * factory, because the dropdowns' allowed keys come from content.
 *
 * `turnstileToken` is checked here so the endpoint rejects a request without
 * one, but it is never a field error: the form handles a missing token with
 * its own message (spec 0011, AC-9).
 */
export const contactRequestSchema = (allowed: AllowedChoices) =>
  z.strictObject({
    name: requiredText(100),
    email: z
      .string({ error: 'required' })
      .trim()
      .min(1, { error: 'required' })
      .max(254, { error: 'tooLong' })
      .pipe(z.email({ error: 'email' })),
    message: requiredText(5000),
    company: optionalText(120),
    phone: z
      .string()
      .trim()
      .max(40, { error: 'tooLong' })
      .regex(PHONE_CHARACTERS, { error: 'phone' })
      .refine((value) => countDigits(value) >= PHONE_MIN_DIGITS, {
        error: 'phone',
      })
      .optional(),
    country: optionalText(80),
    need: optionalChoice([...allowed.needs, 'other']),
    projectType: optionalChoice(allowed.projectTypes),
    lod: optionalChoice(allowed.lods),
    turnstileToken: z.string().min(1),
  });

export type ContactRequest = z.infer<ReturnType<typeof contactRequestSchema>>;

export type ValidationResult =
  | Readonly<{ ok: true; value: ContactRequest }>
  | Readonly<{ ok: false; errors: FieldErrors }>;

/**
 * Checks a request and returns its first problem per field, as a code. It
 * never throws. A request whose only problem is a missing token comes back
 * `ok: false` with no field errors, which the caller reads as "no token".
 */
export const validateContactRequest = (
  input: unknown,
  allowed: AllowedChoices,
): ValidationResult => {
  const result = contactRequestSchema(allowed).safeParse(input);
  if (result.success) return { ok: true, value: result.data };

  const errors = result.error.issues.reduce<FieldErrors>((found, issue) => {
    const [field] = issue.path;
    if (!isContactField(field) || found[field] !== undefined) return found;
    const code = isErrorCode(issue.message) ? issue.message : 'required';
    return { ...found, [field]: code };
  }, {});

  return { ok: false, errors };
};

const OPTIONAL_FIELDS: readonly ContactField[] = [
  'company',
  'phone',
  'country',
  'need',
  'projectType',
  'lod',
];

/**
 * The request the form sends: every value trimmed, and each optional field
 * left out when empty rather than sent as `""` (spec 0011, AC-10). Required
 * fields stay in even when empty, so validation names them.
 */
export const toContactRequest = (
  values: ContactValues,
  turnstileToken: string,
): Readonly<Record<string, string>> => {
  const fields = CONTACT_FIELDS.flatMap((field) => {
    const value = values[field].trim();
    return value === '' && OPTIONAL_FIELDS.includes(field)
      ? []
      : [[field, value] as const];
  });
  return { ...Object.fromEntries(fields), turnstileToken };
};

/**
 * A `tel:` link for a phone number as written for people: everything but the
 * digits goes, and a leading `+` stays (spec 0011, AC-14).
 */
export const telHref = (phone: string): string => {
  const written = phone.trim();
  const digits = written.replaceAll(/\D/g, '');
  return `tel:${written.startsWith('+') ? '+' : ''}${digits}`;
};

/**
 * What a submission can come back as. `invalid` carries codes, like
 * validation; `failed` means the message did not go out.
 */
export type SubmitResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; kind: 'invalid'; errors: FieldErrors }>
  | Readonly<{ ok: false; kind: 'failed' }>;

/** How long the stand in waits, so the sending state is seen. */
const STAND_IN_DELAY_MS = 600;

/**
 * Sends a checked request. The only place the form touches the outside
 * world.
 */
export const submitContact = async (
  request: ContactRequest,
): Promise<SubmitResult> => {
  // NOTHING IS SENT YET. This is a stand in: it makes no network request,
  // waits a moment, and reports success, so the form behaves exactly as it
  // will once sending is real. The typed details go nowhere and are not kept.
  // The delivery feature replaces this body with the `POST /api/contact`
  // call (spec 0011), mapping `400` to `invalid` and anything else that is
  // not `200` to `failed`. The island does not change.
  void request;
  await new Promise((resolve) => setTimeout(resolve, STAND_IN_DELAY_MS));
  return { ok: true };
};
