/**
 * A project detail page's rooms band (spec 0018): the photo arrows, and the
 * words kept in step with the photo on show.
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
 * Each arrow moves one photo and wraps at either end. The current photo is
 * read from the track's scroll position, never kept, so a swipe between
 * presses can never put the arrows out of step. A visitor who asks for less
 * motion gets an instant jump instead of a glide.
 *
 * Whenever the scroll reaches a photo of another room, that room's name and
 * work list take `data-active` and the others lose it; the `room-name` and
 * `room-work` utilities in `global.css` draw the change and its motion.
 *
 * Writes go through `toggleAttribute`, never property assignment, for the
 * `no-param-reassign` reason given in `counters.ts`.
 */

const wantsMotion = (): boolean =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The photo `step` away from `index`, wrapping at both ends. */
const wrapIndex = (index: number, step: number, count: number): number =>
  (((index + step) % count) + count) % count;

/** The photo nearest the track's start, the one on show. */
const currentIndex = (track: HTMLElement): number =>
  track.clientWidth === 0
    ? 0
    : Math.round(track.scrollLeft / track.clientWidth);

const setUp = (root: HTMLElement): void => {
  const track = root.querySelector<HTMLElement>('[data-room-track]');
  if (!track) return;
  const slides = [...track.querySelectorAll<HTMLElement>('[data-room]')];
  const marked = [
    ...root.querySelectorAll<HTMLElement>('[data-room-name], [data-room-work]'),
  ];
  if (slides.length < 2) return;

  /** The room index of the photo at `index`. */
  const roomOf = (index: number): string | undefined =>
    slides[index]?.dataset.room;

  // The room whose words are showing; the HTML starts on the first.
  let activeRoom = roomOf(0);

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

  const go = (step: number): void => {
    if (track.clientWidth === 0) return;
    track.scrollTo({
      left:
        wrapIndex(currentIndex(track), step, slides.length) * track.clientWidth,
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
