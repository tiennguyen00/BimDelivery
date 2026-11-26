/**
 * The enquiry email (spec 0022): what the team at `CONTACT_TO_EMAIL` receives
 * for each enquiry, and the one call that sends it through Resend.
 *
 * Composing is pure: a checked request and the labels in, a subject and a
 * plain text body out. The body is plain text on purpose, so nothing a visitor
 * typed is ever read as HTML. Field names and dropdown choices print with
 * their labels from the `contact` content entry; the few fixed words left
 * (the subject's "New enquiry from", the closing "Sent from") are an internal
 * notification for the team, not copy a visitor reads.
 *
 * Sending is the side effect, kept to `sendWithResend` alone. It calls
 * Resend's REST API with plain `fetch` (no SDK), never throws, and reports a
 * failure as a short reason that names no enquiry content, so it is safe to
 * log.
 */
import type { ContactField, ContactRequest } from './contact';

/** The dropdown fields, whose values are keys and print as their labels. */
type ChoiceField = 'need' | 'projectType' | 'lod';

export type EnquiryLabels = Readonly<{
  /** The form's field labels, by field. */
  fields: Readonly<Record<ContactField, string>>;
  /** Each dropdown's labels, by key. */
  choices: Readonly<Record<ChoiceField, Readonly<Record<string, string>>>>;
}>;

export type EnquiryEmail = Readonly<{
  subject: string;
  text: string;
  /** The visitor's address, so Reply answers them. */
  replyTo: string;
}>;

/** Collapses every run of whitespace, line breaks included, to one space. */
const oneLine = (value: string): string => value.replaceAll(/\s+/g, ' ').trim();

/**
 * The email for one checked enquiry. Empty optional fields are left out, the
 * description comes last under its own label, and the closing line names the
 * page it was sent from.
 */
export const composeEnquiryEmail = (
  request: ContactRequest,
  labels: EnquiryLabels,
  pageUrl: string,
): EnquiryEmail => {
  const name = oneLine(request.name);
  const company = request.company ? oneLine(request.company) : undefined;

  const choice = (field: ChoiceField): string | undefined => {
    const key = request[field];
    return key === undefined ? undefined : (labels.choices[field][key] ?? key);
  };

  const line = (field: ContactField, value: string | undefined) =>
    value === undefined ? [] : [`${labels.fields[field]}: ${value}`];

  const details = [
    ...line('name', name),
    ...line('company', company),
    ...line('email', request.email),
    ...line('phone', request.phone),
    ...line('country', request.country),
    ...line('need', choice('need')),
    ...line('projectType', choice('projectType')),
    ...line('lod', choice('lod')),
  ];

  return {
    subject: `New enquiry from ${name}${company ? ` (${company})` : ''}`,
    text: [
      ...details,
      '',
      `${labels.fields.message}:`,
      request.message,
      '',
      '--',
      `Sent from ${pageUrl}`,
    ].join('\n'),
    replyTo: request.email,
  };
};

const toHex = (buffer: ArrayBuffer): string =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

/**
 * Resend's idempotency key for an email: a hash of exactly what is sent. A
 * double submit or a retry of the same enquiry within 24 hours sends one
 * email, and an edited enquiry hashes differently, so it is never refused as
 * a reused key.
 */
export const enquiryIdempotencyKey = async (
  email: EnquiryEmail,
): Promise<string> => {
  const bytes = new TextEncoder().encode(JSON.stringify(email));
  return `contact-enquiry/${toHex(await crypto.subtle.digest('SHA-256', bytes))}`;
};

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

/** How long Resend may take before the send counts as failed. */
const SEND_TIMEOUT_MS = 10_000;

export type SendResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; reason: string }>;

export type SendOptions = Readonly<{
  apiKey: string;
  from: string;
  to: string;
  email: EnquiryEmail;
  idempotencyKey: string;
}>;

/** Resend's error body carries a stable `name`, such as `validation_error`. */
const errorName = async (response: Response): Promise<string> => {
  const body: unknown = await response.json().catch(() => null);
  return typeof body === 'object' &&
    body !== null &&
    'name' in body &&
    typeof body.name === 'string'
    ? body.name
    : 'unknown';
};

/** Sends one email through Resend. Never throws; a failure says why, without content. */
export const sendWithResend = async ({
  apiKey,
  from,
  to,
  email,
  idempotencyKey,
}: SendOptions): Promise<SendResult> => {
  try {
    const response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: email.subject,
        text: email.text,
        reply_to: email.replyTo,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (response.ok) return { ok: true };
    return {
      ok: false,
      reason: `resend ${response.status} ${await errorName(response)}`,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return {
      ok: false,
      reason: timedOut ? 'resend timeout' : 'resend unreachable',
    };
  }
};
