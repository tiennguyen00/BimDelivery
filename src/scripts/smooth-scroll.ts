/**
 * Smooth wheel scrolling on every page (prototype, 2026-10-09), on Lenis.
 *
 * Lenis eases the page toward where the wheel asked it to go, so a scroll
 * glides to a stop instead of halting on the last notch. It still moves the
 * real window scroll, so motion's `scroll()` timelines, the sticky header, and
 * `scroll-padding-top` see an ordinary scroll and need nothing from here.
 *
 * Touch keeps the device's own momentum (`syncTouch` stays off): phones and
 * tablets already decelerate, and smoothing them twice feels like lag. Anchor
 * jumps are left to the browser's `scroll-behavior: smooth` in `global.css`,
 * which already honours `scroll-padding-top`.
 *
 * Reduced motion is a full stop: no instance, plain native scrolling.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * How far the page closes on its target each frame. 0.1 is Lenis's default;
 * a touch higher keeps the glide subtle, since trackpads already add inertia.
 */
const LERP = 0.12;

/**
 * The mobile menu locks the page by setting `overflow: hidden` on `body`
 * (`nav.ts`), which stops the wheel but not Lenis's own `scrollTo` calls. So
 * Lenis pauses whenever the body is locked, read from the style itself rather
 * than a call from `nav.ts`, so neither module has to know about the other.
 */
const followBodyLock = (lenis: Lenis): void => {
  const sync = () => {
    if (document.body.style.overflow === 'hidden') lenis.stop();
    else lenis.start();
  };
  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
  });
};

const start = (): void => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: LERP, autoRaf: true });
  followBodyLock(lenis);
};

start();
