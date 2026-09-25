/**
 * Cloudflare Turnstile for the contact form (spec 0011): loads Cloudflare's
 * script once, renders one widget into a container, and reports what the
 * form needs to know, the token and whether the check is still possible.
 *
 * There is no npm package. The official script, in explicit render mode, is
 * the whole integration, and a wrapper library would only add weight.
 *
 * Two things keep it to exactly one widget. The script is found by its
 * `data-turnstile` attribute or by `window.turnstile`, never by a mutable
 * module variable (AGENTS.md: module level constants only), so a second
 * mount reuses it. And the widget id lives in a ref: the widget renders only
 * while that ref is empty, and the effect's cleanup removes the widget and
 * clears the ref, so a StrictMode double effect or a fast remount never draws
 * two into one container.
 *
 * The token proves nothing yet. Only the server can check it with Cloudflare,
 * and that arrives with the delivery feature (`TURNSTILE_SECRET_KEY`).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** How long the script may take before the check counts as unavailable. */
const LOAD_TIMEOUT_MS = 10_000;

/** The part of Turnstile's browser API this hook uses. */
type TurnstileApi = Readonly<{
  render: (
    container: HTMLElement,
    options: Readonly<{
      sitekey: string;
      action: string;
      theme: 'light' | 'dark' | 'auto';
      language: string;
      retry: 'auto' | 'never';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    }>,
  ) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}>;

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * `loading` until a token arrives, `ready` with one, `error` when the script
 * did not load in time or the widget reported a failure.
 */
export type TurnstileStatus = 'loading' | 'ready' | 'error';

export type TurnstileOptions = Readonly<{
  siteKey: string;
  action: string;
  theme: 'light' | 'dark';
  language: string;
}>;

/** Resolves with the API once Cloudflare's script has run, adding the script only if it is not already on the page. */
const loadTurnstile = (): Promise<TurnstileApi> =>
  new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile]',
    );
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error('Turnstile loaded without its API')),
    );
    script.addEventListener('error', () =>
      reject(new Error('Turnstile script failed to load')),
    );
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute('data-turnstile', '');
      document.head.append(script);
    }
  });

export const useTurnstile = ({
  siteKey,
  action,
  theme,
  language,
}: TurnstileOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileStatus>('loading');

  useEffect(() => {
    // Set by the cleanup, so a script that arrives after unmount draws nothing.
    let unmounted = false;

    const timeout = window.setTimeout(() => {
      if (!window.turnstile) setStatus('error');
    }, LOAD_TIMEOUT_MS);

    loadTurnstile()
      .then((turnstile) => {
        const container = containerRef.current;
        if (unmounted || !container || widgetIdRef.current !== null) return;
        const widgetId = turnstile.render(container, {
          sitekey: siteKey,
          action,
          theme,
          language,
          retry: 'auto',
          callback: (next) => {
            setToken(next);
            setStatus('ready');
          },
          // A token works for five minutes. Once it lapses, clear it and ask
          // for a fresh one, so a slow visitor never sends a dead token.
          'expired-callback': () => {
            setToken(null);
            setStatus('loading');
            if (widgetIdRef.current !== null) {
              turnstile.reset(widgetIdRef.current);
            }
          },
          // Turnstile keeps retrying on its own (`retry: 'auto'`); this only
          // tells the form to show its fallback message meanwhile.
          'error-callback': () => {
            setToken(null);
            setStatus('error');
          },
        });
        widgetIdRef.current = widgetId ?? null;
      })
      .catch(() => {
        if (!unmounted) setStatus('error');
      });

    return () => {
      unmounted = true;
      window.clearTimeout(timeout);
      if (widgetIdRef.current !== null) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, theme, language]);

  /**
   * Asks for a fresh challenge: after a token is spent (it works once), or
   * when the visitor presses Submit while the check is in `error`. With no
   * widget on the page (the script never came) there is nothing to reset.
   */
  const reset = useCallback(() => {
    const widgetId = widgetIdRef.current;
    if (widgetId === null || !window.turnstile) return;
    setToken(null);
    setStatus('loading');
    window.turnstile.reset(widgetId);
  }, []);

  return { containerRef, token, status, reset };
};
