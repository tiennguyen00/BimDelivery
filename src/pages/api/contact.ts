/**
 * `POST /api/contact` (spec 0022): the contact form's delivery, the one route
 * the Worker renders on demand. Every page stays prerendered.
 *
 * A request passes these checks in order, each cheaper than the next:
 *
 * 1. Same origin: the `Origin` header must be this site's own (`403`).
 * 2. Rate limit: 5 requests a minute per visitor IP, through the
 *    `CONTACT_RATE_LIMIT` binding in wrangler.jsonc (`429`).
 * 3. Size: a body over 64 KB is refused unread (`413`).
 * 4. Validation: the same schema the form uses, with the dropdowns' keys read
 *    from content (`400` with field codes, never copy).
 * 5. The spam guard: a filled honeypot or a form sent faster than a person
 *    can fill it is answered `200` and sent nowhere, so a bot learns nothing.
 *
 * Then one plain text email goes to `CONTACT_TO_EMAIL` through Resend (`200`),
 * or the endpoint answers `502` and logs why. A log line never holds anything
 * a visitor typed.
 */
import type { APIRoute } from 'astro';
import {
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  RESEND_API_KEY,
} from 'astro:env/server';
import { env } from 'cloudflare:workers';
import { DEFAULT_LOCALE } from '../../i18n/locales';
import {
  OTHER_NEED,
  isLikelySpam,
  validateContactRequest,
  type AllowedChoices,
} from '../../lib/contact';
import {
  composeEnquiryEmail,
  enquiryIdempotencyKey,
  sendWithResend,
  type EnquiryLabels,
} from '../../lib/contact-email';
import { getContactPage, getServices } from '../../lib/content';

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;

/** The page the form lives on, named in each email's closing line. */
const CONTACT_PATH = '/contact-us';

const reply = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

/** One structured line for Workers logs. Never pass it anything typed. */
const log = (level: 'info' | 'error', event: string, detail?: string): void =>
  console[level]({ route: 'api/contact', event, detail });

/** The body as JSON, or `undefined` when it is not JSON (validation then fails). */
const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
};

const labelsByKey = (
  options: readonly Readonly<{ value: string; label: string }>[],
): Readonly<Record<string, string>> =>
  Object.fromEntries(options.map((option) => [option.value, option.label]));

/**
 * What the endpoint needs from content: the dropdowns' allowed keys, and the
 * labels the email prints. Read in the default language, the one the team
 * works in; a key means the same thing in every language.
 */
const loadContactContent = async (): Promise<
  Readonly<{ allowed: AllowedChoices; labels: EnquiryLabels }>
> => {
  const [page, services] = await Promise.all([
    getContactPage(DEFAULT_LOCALE),
    getServices(DEFAULT_LOCALE),
  ]);
  const needs = [
    ...services.map((service) => ({
      value: service.slug,
      label: service.title,
    })),
    { value: OTHER_NEED, label: page.form.needOtherLabel },
  ];
  return {
    allowed: {
      needs: services.map((service) => service.slug),
      projectTypes: page.form.projectTypes.map((option) => option.value),
      lods: page.form.lodOptions.map((option) => option.value),
    },
    labels: {
      fields: page.form.labels,
      choices: {
        need: labelsByKey(needs),
        projectType: labelsByKey(page.form.projectTypes),
        lod: labelsByKey(page.form.lodOptions),
      },
    },
  };
};

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('origin') !== url.origin) {
    return reply(403, { ok: false, error: 'origin' });
  }

  const visitor = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success } = await env.CONTACT_RATE_LIMIT.limit({ key: visitor });
  if (!success) {
    log('info', 'rate limited');
    return reply(429, { ok: false, error: 'rateLimited' });
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return reply(413, { ok: false, error: 'tooLarge' });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return reply(413, { ok: false, error: 'tooLarge' });
  }

  const { allowed, labels } = await loadContactContent();
  const result = validateContactRequest(parseJson(raw), allowed);
  if (!result.ok) return reply(400, { ok: false, errors: result.errors });

  if (isLikelySpam(result.value)) {
    log('info', 'dropped by the spam guard');
    return reply(200, { ok: true });
  }

  if (!RESEND_API_KEY) {
    log('error', 'not sent', 'RESEND_API_KEY is not set');
    return reply(502, { ok: false, error: 'delivery' });
  }

  const email = composeEnquiryEmail(
    result.value,
    labels,
    new URL(CONTACT_PATH, url).href,
  );
  const sent = await sendWithResend({
    apiKey: RESEND_API_KEY,
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    email,
    idempotencyKey: await enquiryIdempotencyKey(email),
  });
  if (!sent.ok) {
    log('error', 'not sent', sent.reason);
    return reply(502, { ok: false, error: 'delivery' });
  }

  log('info', 'sent');
  return reply(200, { ok: true });
};
