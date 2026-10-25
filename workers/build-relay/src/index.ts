/**
 * The build relay (spec 0019): the one place that holds the GitHub token able
 * to start a build. Sanity's `site-build` webhook calls it, never GitHub,
 * because every editor on Sanity's free plan is an Administrator and can read
 * a webhook's headers. Sanity holds only the signing secret, which can do
 * nothing but start the two builds below.
 *
 * `POST /` with Sanity's signed body `{ "event_type": ... }`:
 *
 * - 401 when the signature is missing or wrong;
 * - 400 when the event is not one of the two;
 * - 502 when GitHub refuses the dispatch;
 * - 204 once GitHub has accepted it.
 *
 * Any other method or path is 404. Pure functions in, one `fetch` out.
 */

/** The relay's two secrets (`wrangler secret put`). */
type RelayEnv = Readonly<{
  GITHUB_DISPATCH_TOKEN: string;
  SANITY_WEBHOOK_SECRET: string;
}>;

/** The two builds Sanity may start, the `repository_dispatch` types `deploy.yml` listens for. */
const EVENTS = ['sanity-publish', 'sanity-preview'] as const;

type BuildEvent = (typeof EVENTS)[number];

const DISPATCH_URL =
  'https://api.github.com/repos/tiennguyen00/BimDelivery/dispatches';

const SIGNATURE_HEADER = 'sanity-webhook-signature';

const isBuildEvent = (value: unknown): value is BuildEvent =>
  typeof value === 'string' && (EVENTS as readonly string[]).includes(value);

const empty = (status: number): Response => new Response(null, { status });

/**
 * Sanity's signature header, `t=<ms timestamp>,v1=<base64url HMAC>`, split
 * into its parts, or `undefined` when it is not in that shape.
 */
const parseSignature = (
  header: string | null,
): Readonly<{ timestamp: string; signature: string }> | undefined => {
  const parts = new Map(
    (header ?? '').split(',').map((part) => {
      const [key = '', ...rest] = part.trim().split('=');
      return [key, rest.join('=')] as const;
    }),
  );
  const timestamp = parts.get('t');
  const signature = parts.get('v1');
  return timestamp && signature ? { timestamp, signature } : undefined;
};

/** Base64url, as Sanity writes it (no padding), to bytes; `undefined` when malformed. */
const fromBase64Url = (text: string): Uint8Array | undefined => {
  try {
    const base64 = text.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  } catch {
    return undefined;
  }
};

/**
 * True when Sanity signed this body with the shared secret: an HMAC SHA-256
 * over `<timestamp>.<body>`. `crypto.subtle.verify` compares in constant
 * time.
 */
const isSignedBySanity = async (
  header: string | null,
  body: string,
  secret: string,
): Promise<boolean> => {
  const parsed = parseSignature(header);
  const signature = parsed && fromBase64Url(parsed.signature);
  if (!parsed || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(`${parsed.timestamp}.${body}`),
  );
};

/** The event in the body, or `undefined` when the body is not `{ event_type: <one of the two> }`. */
const eventOf = (body: string): BuildEvent | undefined => {
  try {
    const parsed: unknown = JSON.parse(body);
    const event =
      typeof parsed === 'object' && parsed !== null && 'event_type' in parsed
        ? parsed.event_type
        : undefined;
    return isBuildEvent(event) ? event : undefined;
  } catch {
    return undefined;
  }
};

/** Asks GitHub to run the workflow for `event`. */
const dispatch = (event: BuildEvent, token: string): Promise<Response> =>
  fetch(DISPATCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'bim-delivery-build-relay',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ event_type: event }),
  });

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method !== 'POST' || pathname !== '/') return empty(404);

    const body = await request.text();
    const signed = await isSignedBySanity(
      request.headers.get(SIGNATURE_HEADER),
      body,
      env.SANITY_WEBHOOK_SECRET,
    );
    if (!signed) return empty(401);

    const event = eventOf(body);
    if (event === undefined) return empty(400);

    const response = await dispatch(event, env.GITHUB_DISPATCH_TOKEN);
    if (!response.ok) {
      console.error(
        `GitHub refused ${event}: ${response.status} ${await response.text()}`,
      );
      return empty(502);
    }
    console.log(`Started ${event}`);
    return empty(204);
  },
} satisfies ExportedHandler<RelayEnv>;
