/**
 * A project detail page's rooms band (spec 0018): the photo arrows, the
 * endless loop, and the words kept in step with the photo on show.
 *
 * Like `counters.ts`, this module enhances markup that is already correct.
 * The band renders every room's photos side by side in a `carousel-track`, a
 * native sideways scroller that snaps one photo per view, so with no
 * JavaScript, or a failed script, a visitor still swipes or scrolls through
 * every photo, and every room's work list shows. The arrows ship hidden
 * (`no-js:hidden`) and only this script makes them do anything.
 *
 * Hooks, all inside the root `data-room-carousel`: `data-room-track` on the
 * scroller, whose photos each carry `data-room` (their room's index);
 * `data-room-prev` and `data-room-next` on the two buttons; and
 * `data-room-name` and `data-room-work` (a room's index) on each name and
 * work list.
 *
 * The loop (2026-10-29): the script puts a copy of the last photo before the
 * first and a copy of the first after the last, both `inert` and
 * `aria-hidden`, and starts on the real first. A press or a swipe past
 * either end lands on a copy, and once the scroll settles the track jumps to
 * the real photo it copies: the same picture in the same place, so the jump
 * never shows, and the photos run on round instead of gliding back across
 * them all. The HTML holds each photo once; the copies are the script's.
 *
 * Each arrow moves one photo. The current photo is read from the track's
 * scroll position, never kept, so a swipe between presses can never put the
 * arrows out of step. A visitor who asks for less motion gets an instant
 * jump instead of a glide.
 *
 * Whenever the scroll reaches a photo of another room, that room's name and
 * work list take `data-active` and the others lose it; the `room-name` and
 * `room-work` utilities in `global.css` draw the change and its motion. The
 * copies carry their photo's `data-room`, so the words hold across the jump.
 *
 * Writes go through `toggleAttribute`, `setAttribute`, and `scrollTo`, never
 * property assignment, for the `no-param-reassign` reason given in
 * `counters.ts`.
 */

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The photo nearest the track's start, the one on show. */
const currentIndex = (track: HTMLElement): number =>
  track.clientWidth === 0
    ? 0
    : Math.round(track.scrollLeft / track.clientWidth);

/** A copy of `slide` that shows, but is never read out, focused, or clicked. */
const copyOf = (slide: HTMLElement): HTMLElement => {
  const copy = slide.cloneNode(true) as HTMLElement;
  copy.setAttribute('aria-hidden', 'true');
  copy.toggleAttribute('inert', true);
  return copy;
};

const setUp = (root: HTMLElement): void => {
  const track = root.querySelector<HTMLElement>('[data-room-track]');
  if (!track) return;
  const photos = [...track.querySelectorAll<HTMLElement>('[data-room]')];
  const marked = [
    ...root.querySelectorAll<HTMLElement>('[data-room-name], [data-room-work]'),
  ];
  const first = photos[0];
  const last = photos.at(-1);
  if (photos.length < 2 || !first || !last) return;

  const jumpTo = (left: number): void => {
    track.scrollTo({ left, behavior: 'instant' });
  };

  // A visitor may have swiped before the script ran; keep their photo.
  const start = currentIndex(track);
  track.prepend(copyOf(last));
  track.append(copyOf(first));
  jumpTo((start + 1) * track.clientWidth);

  /** Every photo in the track, the two copies at its ends included. */
  const slides = [...track.querySelectorAll<HTMLElement>('[data-room]')];
  const count = photos.length;

  /** The room index of the photo at `index`. */
  const roomOf = (index: number): string | undefined =>
    slides[index]?.dataset.room;

  // The room whose words are showing; the HTML starts on the first.
  let activeRoom = first.dataset.room;

  const syncWords = (): void => {
    const room = roomOf(currentIndex(track));
    if (room === undefined || room === activeRoom) return;
    activeRoom = room;
    marked.forEach((element) => {
      const own = element.dataset.roomName ?? element.dataset.roomWork;
      element.toggleAttribute('data-active', own === room);
    });
  };

  // One check per frame at most, however fast the scroll events come.
  let frame = 0;
  track.addEventListener(
    'scroll',
    () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncWords);
    },
    { passive: true },
  );

  /** Off a copy and onto the real photo it copies, keeping any part step. */
  const leaveCopy = (): void => {
    const index = currentIndex(track);
    const span = count * track.clientWidth;
    if (index === 0) jumpTo(track.scrollLeft + span);
    else if (index === count + 1) jumpTo(track.scrollLeft - span);
  };

  // Once a scroll settles. `scrollend` where the browser has it, otherwise a
  // quiet spell after the last scroll event. It is heard on the window, in
  // the capture phase, because Lenis (`smooth-scroll.ts`) stops every native
  // `scrollend` there, an inner scroller's too, before it reaches the track;
  // stopping it never silences another listener on the window itself.
  if ('onscrollend' in window) {
    window.addEventListener(
      'scrollend',
      (event) => {
        if (event.target === track) leaveCopy();
      },
      { capture: true },
    );
  } else {
    let quiet = 0;
    track.addEventListener(
      'scroll',
      () => {
        window.clearTimeout(quiet);
        quiet = window.setTimeout(leaveCopy, 150);
      },
      { passive: true },
    );
  }

  const go = (step: number): void => {
    if (track.clientWidth === 0) return;
    // A press mid glide onto a copy carries on from the real photo instead.
    leaveCopy();
    track.scrollTo({
      left: (currentIndex(track) + step) * track.clientWidth,
      behavior: wantsMotion() ? 'smooth' : 'instant',
    });
  };

  root.querySelector('[data-room-prev]')?.addEventListener('click', () => {
    go(-1);
  });
  root.querySelector('[data-room-next]')?.addEventListener('click', () => {
    go(1);
  });
};

document.querySelectorAll<HTMLElement>('[data-room-carousel]').forEach(setUp);

// Makes this file a module, so its names stay private instead of sharing one
// global scope with the other scripts (`counters.ts` also has `wantsMotion`).
export {};
