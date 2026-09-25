# 0011. Compose the Contact page from content as two reference bands, with a React form island and Cloudflare Turnstile

**Date**: 2026-09-25
**Status**: In Progress
**Scope feature**: 10, Contact page (`docs/scope/scope.md`)

## Summary

The Contact page gets the layout of your reference screenshot, in two bands. The top band is white, with the ruled "Contact us" heading, a short intro paragraph, and a building photo beside it on desktop. The second band is dark: a greyscale construction photo under a deep see through black panel and a faint stripe. It holds the nine field enquiry form on the left and three white cards (phone, address, email) on the right.

The form is the site's one React island (a small piece of the page that runs its own JavaScript). It checks the fields when Submit is pressed, shows each error under its own field, asks Cloudflare Turnstile (a captcha that is usually invisible) for a token, and then shows a thank you panel. Nothing is actually sent yet. The code says so plainly, and real delivery (which also checks the Turnstile token on the server) is its own later feature. Every word, choice list, and photo comes from content, and the email, phone, and address come from the site settings.

## Requirements

**User stories**:

- As a prospective client, I want to describe my project (what I need, the building type, the level of detail) in one short form, so the company can reply with something useful.
- As a visitor who would rather not use a form, I want the phone, address, and email in plain sight, and tappable on my phone.
- As a keyboard or screen reader user, I want every field labelled, every error announced and tied to its field, and focus taken to the first problem and to the thank you message.
- As a visitor with JavaScript off, I want to be told plainly how to reach the company instead of a form that silently does nothing.
- As someone editing the site, I want to change any label, choice, message, or photo in a content file, never in a component.

**Acceptance criteria**:

- **AC-1**: `/contact-us` renders exactly two bands, in this order, then the footer: the intro band (AC-4) and the form band (AC-5). The footer is unchanged, including its certification panel.
- **AC-2**: Every heading, paragraph, label, hint, choice, error, success text, card heading, and photo on the page comes from content: the `contact` entry, `settings.contact` (email, phone, address), and the `services` collection (the "Your needs" choices). `src/pages/contact-us.astro`, every component it uses, the React island, and `src/lib/contact.ts` contain no visible copy of their own. The page title and description come from `contact.seo`.
- **AC-3**: The `contact` entry is one strict YAML file, `src/content/contact/en/contact.yaml`, with exactly the fields in *Data model sketch*. The old flat `form.nameLabel`, `emailLabel`, `companyLabel`, and `messageLabel` are gone. An unknown or leftover key fails the build naming the key. Every `projectTypes` and `lodOptions` `value` is a lowercase key (`^[a-z0-9]+(-[a-z0-9]+)*$`), unique within its list, or the build fails naming the value. A service whose `slug` is `other` fails the build, because `other` is the reserved "Your needs" value: `other` joins `RESERVED_PATHS` in `src/lib/content.ts`, so the existing services check refuses it with its existing message.
- **AC-4**: The intro band is a white `Section` labelled by its `h1`. The `h1` (`contact.heading`) is shown in capitals by CSS only, with the shared `heading-rule` under it. Under that, `contact.intro` as one left aligned paragraph (never justified), rendered through `Emphasis` on the `light` surface, so `**bold**` and `==gold==` work. At `lg` (1024px) and up the band has two columns inside the default band width: text on the left (about seven twelfths) and `contact.photo` on the right (about five twelfths), an optimised `Image` with its `alt`, `rounded-ui`, a fixed 4:3 box with `object-cover`, lazy loaded, vertically centred against the text. Below `lg` the photo is not displayed, and because it is lazy and not displayed, a phone never downloads it.
- **AC-5**: The form band is its own component (not a `Section` tone, like the home hero and intro band), labelled by its `h2` and carrying `focus-contrast`. Behind everything sits `contact.form.background`, an optimised decorative `Image` (`alt=""`) covering the band with `object-cover`, turned grey by a CSS `grayscale` filter, lazy loaded. Over it sits a full cover layer filled with the new `--color-scrim-strong` (`rgb(0 0 0 / 0.8)`) plus the new `bg-diagonal-dark` stripe (white at 6 percent, 1px in every 10, at 135 degrees). The `h2` (`contact.form.heading`) is white, bold, shown in capitals by CSS only. At `lg` and up the band has two columns: the form (about seven twelfths) and the cards (about five twelfths, AC-14). Below `lg` it is one column: heading, form, then the cards.
- **AC-6**: The form shows nine fields, in this order, two to a row at `md` (768px) and up and one per row below: name and company, email and phone, country and "Your needs", project type and level of development, then the project description across the full width. Each field has a visible label from `contact.form.labels`, placed above it in white. Name, email, and message are required (`aria-required="true"`). The other six carry `contact.form.optionalHint` as their hint. Name, company, and country are text inputs (`autoComplete` `name`, `organization`, `country-name`). Email is `type="email"` (`autoComplete="email"`) and phone is `type="tel"` (`autoComplete="tel"`). "Your needs", project type, and level of development are native selects whose first choice is an empty value labelled `contact.form.selectPrompt`. "Your needs" lists every service in the services collection's order (value `slug`, label `title`), then `other` labelled `contact.form.needOtherLabel`. Project type lists `contact.form.projectTypes` and level of development lists `contact.form.lodOptions`, each in order (value `value`, label `label`). The form has `noValidate`, so the browser's own bubbles never appear. Every control is at least 44px tall.
- **AC-7**: Validation follows the *ContactRequest* rules in *Data model sketch*. No error shows while a visitor is typing before their first submit. On submit, every failing field shows its message under it, linked through `aria-describedby` with `aria-invalid="true"` on the control, and focus moves to the first failing field in form order. From then on each field's error updates as its value changes, disappearing the moment it is fixed. Messages come from `contact.errors` by code: `required`, `email`, `phone`, `tooLong`. On the dark band error text is `--color-error-on-dark`, and the invalid control keeps its existing error border and inset ring on its white box.
- **AC-8**: A Cloudflare Turnstile widget sits in the row with the submit button, under the description: at `md` and up the two sit together on the right (widget, then button), below `md` they stack, widget first. The island loads Cloudflare's script once, in explicit render mode, and renders the widget with the site key from `PUBLIC_TURNSTILE_SITE_KEY` (`astro:env/client`), `theme: 'dark'`, `action: 'contact'`, and `language` set to the page's language. The token the widget hands back is kept in state and sent as `turnstileToken`. When a token expires, the widget is reset and the stored token cleared.
- **AC-9**: Submit with no token never submits. The widget renders with `retry: 'auto'`, so Turnstile retries a failed challenge by itself. The captcha message sits under the widget with `role="alert"`: `contact.errors.captcha`, followed by the email from `settings.contact` as a `mailto:` link. It appears in two cases. First, as soon as the widget's status becomes `error` (the script was blocked or did not load within 10 seconds, or the widget reported an error), with no Submit needed. Second, when Submit is pressed while the challenge is simply not finished. Pressing Submit while the status is `error` also calls `reset()` so the visitor can retry. The message clears as soon as a token arrives. Field validation (AC-7) still runs on Submit and moves focus as usual. The captcha message never moves focus.
- **AC-10**: A valid submit with a token builds one `ContactRequest`: every string trimmed, empty optional fields left out rather than sent as `""`. It passes the request to `submitContact` in `src/lib/contact.ts`. In this release `submitContact` makes **no network request**. It waits about 600ms and returns `{ ok: true }`, and a comment at the top of the function says plainly that nothing is sent until the delivery feature replaces its body with the `POST /api/contact` call. While a submit is pending, the button is disabled and shows `contact.form.sendingLabel`, the form has `aria-busy="true"`, and a second click submits nothing.
- **AC-11**: On `{ ok: true }` the form is replaced, in the same place, by a panel showing `contact.success.heading` as an `h3` and `contact.success.text`. The heading receives focus (`tabIndex={-1}`), so a screen reader announces it. Reloading the page shows an empty form again. Nothing is kept in storage.
- **AC-12**: The island already handles the two failure results `submitContact` can return once delivery lands. On `invalid`, each field message shows exactly as in AC-7, with focus on the first. On `failed`, `contact.errors.deliveryFailed` shows above the submit row with `role="alert"`. In both cases every value the visitor typed stays in the form and the Turnstile widget is reset (a token works only once).
- **AC-13**: The built HTML contains the whole form, with `method="post"` so typed details can never land in a URL. Every field and the submit button sit inside one `<fieldset disabled>` (no visible border or legend), so before hydration, and forever with JavaScript off, nothing in the form can be focused, typed into, or submitted. The island's first render also returns `disabled`, so it matches the server HTML, and a `useEffect` after mount enables it. There is no hydration mismatch. A `<noscript>` block placed above the form in the form band shows `contact.form.noScript`, then the email (`mailto:`) and phone (`tel:`) links from `settings.contact`.
- **AC-14**: The cards column holds three white cards, stacked, each centred, with a large decorative gold filled icon (`aria-hidden`) above an `h3`. The *talk* card has the `headset` icon, `contact.cards.talk.heading`, and the phone as a `tel:` link. The *visit* card has the `map-pin` icon, `contact.cards.visit.heading`, and the address as plain text. The *email* card has the `envelope` icon, and its `h3` is the email address itself, as a `mailto:` link. Card headings are bold `gold-ink` at `text-h3` (the gold rule). Values are `ink-strong`. Every link keeps the shared focus ring. The `tel:` href is the phone with everything except digits and a leading `+` removed.
- **AC-15**: On page load, with no script, the intro band's heading, paragraph, and photo fade and rise in through the existing `entrance` utility (`--entrance-step` 0, 1, 2). The intro band carries no `data-reveal`. In the form band, the heading, the form, and then each card in turn reveal on scroll through the existing `reveal.ts` (`data-reveal`, `data-reveal-stagger`), imported by the page. No new script (other than the island) and no new dependency. With JavaScript off, a failed script, or reduced motion asked for, everything is simply shown.
- **AC-16**: The page has one `h1` (the intro band), one `h2` (the form band), and `h3`s for the three cards and the success panel. Each band points at its heading with `aria-labelledby`.
- **AC-17**: At 375px, 768px, 1024px, and 1920px wide the page has no sideways scroll, no overlapping text, and the Turnstile widget fits its row. At 1920px the bands use the site's default band width (75 percent of the screen, 1440px).
- **AC-18**: Two new colour tokens exist in `global.css` and `docs/design.md`: `--color-error-on-dark` (`#ff9b8f`) and `--color-scrim-strong` (`rgb(0 0 0 / 0.8)`), plus the `bg-diagonal-dark` utility. On the form band the worst case background (a pure white photo pixel under the scrim and a stripe line) is `#3f3f3f`. There, white labels, hints, heading, and noscript text reach 10.5:1 and `error-on-dark` reaches 5.19:1. design.md lists both pairs. The gold rule holds: a search of `src/` for the forbidden classes design.md lists finds nothing.
- **AC-19**: `src/lib/contact.ts` holds the one `ContactRequest` Zod schema factory, its type, the `SubmitResult` union, and `submitContact`, with no visible copy (errors are codes). The island uses it now, and the delivery endpoint will use the same schema later. The `POST /api/contact` contract in spec 0001 points to this spec for its extended request.
- **AC-20**: `docs/design.md` and the dev `/styleguide` cover the two tokens, `bg-diagonal-dark`, the form band, `ContactCard`, the new `Select`, the fields' `surface` prop, and the three new icons. `pnpm check`, `pnpm lint`, and `pnpm build` pass. `dist/client/contact-us/index.html` exists, `dist/client/` still has one HTML file per route, and `/contact-us` is the only page that hydrates React or requests `challenges.cloudflare.com`.

## Decision

**Chosen option**: Option 1: content driven two band page, a React form island built on the shared design system fields, a shared Zod request schema with a local stand in for sending, and Cloudflare Turnstile rendered now and checked on the server later.

The page is `contact-us.astro` composing an intro band and a dark form band from a strict `contact` entry, `settings.contact`, and the services list. One `client:visible` React island owns the form, its validation, the Turnstile widget, and the success panel, and it talks to the outside world only through `submitContact`.

**Settled choices** (the engineer's picks and the calls made at write time, reasons in `rationale.md`):

- All nine reference fields. Name, email, and message required, the rest marked "Optional". Visible labels above white boxes (spec 0003 holds, no placeholder labels).
- "Your needs", project type, and level of development are dropdowns. "Your needs" is the services plus `other`. Project type is common building sectors. Level of development is LOD 100 to 500 plus "Not sure yet". Each choice sends a stable key, and its label comes from content. Country is free text.
- Cloudflare Turnstile as the captcha, loaded by a small hook around the official script (no npm package). No token means no send, with an email fallback in the message. The site key is a typed public env variable.
- Form band: a greyscale Pexels photo under a 0.8 scrim with a light stripe. A new light error colour keeps errors readable there. Intro band photo inside the band width, hidden on phones.
- Cards: one each for phone, address, and email. The email card's heading is the address. Phone and email are tappable.
- On submit, errors show, then update live. Success swaps the form for a thank you panel. With no JavaScript, a note shows the email and phone.
- Motion as on About: CSS load entrance for the intro band, the existing scroll reveal for the form band.
- Calls made at write time: `client:visible` hydration, a native `Select` added to the design system, a `surface` prop on the React fields, `submitContact` returning a result union with no network call, the scrim at 0.8 (not 0.75) because the stripe lightens it, and a `ContactCard` component.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `cloudflare` (`cloudflare/skills`, `.agents/skills/cloudflare/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Design source**: the engineer's reference screenshot of the contact page (taken at about 2480px wide). Tokens, type, spacing, and focus come from `docs/design.md`. Where the screenshot and an AC disagree, the AC wins. The reference's placeholder only fields, justified paragraph, bright gold headings on white, and sum captcha are deliberately replaced by visible labels, a left aligned paragraph, `gold-ink` headings, and Turnstile. Pixel spacing that no AC fixes follows the screenshot.

**Page composition**:

| Order | Band | Surface | Component | Motion |
|---|---|---|---|---|
| 1 | Intro: ruled `h1`, marked paragraph, building photo (`lg` and up) | `white` `Section` | `src/components/contact/IntroBand.astro` | CSS load entrance |
| 2 | Form: `h2`, form island, three cards | dark photo band: greyscale photo, `scrim-strong`, `bg-diagonal-dark` | `src/components/contact/FormBand.astro` (frame from `styles.ts`), `src/components/react/ContactForm.tsx`, `src/components/contact/ContactCard.astro` | scroll reveal |

**Component inventory**:

| Component | Status | Change |
|---|---|---|
| `Section`, `Emphasis`, `heading-rule`, `entrance`, `focus-contrast`, `reveal.ts`, band frame classes in `styles.ts` | existing | none |
| `Icon` | existing | three new filled glyphs on the 24 unit grid: `headset`, `map-pin` (the folded map with a pin, as in the reference), `envelope` |
| `TextField`, `TextArea` (`src/components/react/ui/`) | existing | `TextField`'s `type` widens to `'text' \| 'email' \| 'tel'` (the phone field). Both gain a `surface?: 'light' \| 'dark'` prop (default `light`). `dark` makes the label and hint white and the error `error-on-dark`. The control box itself is identical on both. The class maps in `styles.ts` gain the `dark` variants so no component names a colour of its own |
| `Select` (`src/components/react/ui/Select.tsx`) | new | the same shape and rules as `TextField` (label, hint, error, `id` or `useId`, `aria-describedby`, `aria-invalid`, 44px, `surface`), plus `options: readonly { value: string; label: string }[]` and `prompt: string` (the empty first choice). A native `<select>` using `fieldClass`, with a `chevron-down` drawn as a CSS background so the arrow matches the site |
| `IntroBand`, `FormBand`, `ContactCard` (`src/components/contact/`) | new | one per band plus the card, as the home and about pages do. `ContactCard` props: `icon: IconName`, `heading` (text or a link), optional `body` (text or a link) |
| `ContactForm` (`src/components/react/ContactForm.tsx`) | new | the island, hydrated `client:visible` with a 200px root margin. Props: `copy` (the whole `contact.form`, `contact.errors`, `contact.success`), `needs`, `projectTypes`, `lodOptions` (value and label lists), `email` (for the captcha fallback), `lang` |
| `useTurnstile` (`src/components/react/useTurnstile.ts`) | new | loads `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once, detected by an existing `script[data-turnstile]` or `window.turnstile` rather than a mutable module variable (AGENTS.md: module level constants only). It renders into a ref, exposes `token`, `status` (`loading`, `ready`, `error`), and `reset()`, and fails to `error` after 10 seconds without the script. The widget id returned by `turnstile.render` is kept in a ref: it renders only while that ref is empty, and the effect's cleanup calls `turnstile.remove(id)` and clears the ref. So a StrictMode double effect or a fast remount never draws two widgets into one container |

**Data model sketch** (content validated by Zod at build, and the request validated in the browser now and on the server later):

`contact` entry, `src/content/contact/en/contact.yaml`, a `z.strictObject`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `lang`, `seo` | shared | yes | unchanged |
| `heading` | `text` | yes | the `h1` |
| `intro` | `emphasisText` | yes | the intro paragraph |
| `photo` | `photoSchema` with `alt` | yes | the building. A Pexels photo of a modern glass office building, logged in `CREDITS.md` |
| `form` | `z.strictObject` | yes | |
| `form.heading` | `text` | yes | the `h2` |
| `form.background` | `photoSchema`, `decorative: true` | yes | a Pexels construction or blueprint photo, logged in `CREDITS.md` |
| `form.labels` | strict `{ name, company, email, phone, country, need, projectType, lod, message }`, each `text` | yes | |
| `form.optionalHint` | `text` | yes | "Optional" |
| `form.selectPrompt` | `text` | yes | "Choose one" |
| `form.needOtherLabel` | `text` | yes | "Other" |
| `form.projectTypes` | `{ value: key, label: text }[]`, min 1, unique `value` | yes | residential, commercial, industrial, healthcare, education, infrastructure, other |
| `form.lodOptions` | `{ value: key, label: text }[]`, min 1, unique `value` | yes | lod-100, lod-200, lod-300, lod-350, lod-400, lod-500, not-sure |
| `form.submitLabel`, `form.sendingLabel`, `form.noScript` | `text` | yes | |
| `errors` | strict `{ required, email, phone, tooLong, captcha, deliveryFailed }`, each `text` | yes | `captcha` is followed by the email link at render |
| `success` | strict `{ heading, text }` | yes | unchanged |
| `cards` | strict `{ talk: { heading }, visit: { heading } }` | yes | the email card's heading is the address |

Read, not copied: `settings.contact.email`, `.phone`, `.address`, and `services[].slug`, `.title` in collection order. `getContactPage` keeps merging `settings.contact` as `details` and is otherwise unchanged. `contact-us.astro` calls `getServices(lang)` for the needs list, and the `other` slug is refused by `RESERVED_PATHS` (AC-3).

`ContactRequest`, the JSON body of `POST /api/contact`, from `contactRequestSchema({ needs, projectTypes, lods })` in `src/lib/contact.ts` (the allowed keys are passed in, so the schema holds no copy and no list of its own):

| Field | Type | Required | Rule (error code) |
|---|---|---|---|
| `name` | string | yes | trimmed, 1 to 100 (`required`, `tooLong`) |
| `email` | string | yes | trimmed, valid address, at most 254 (`required`, `email`, `tooLong`) |
| `message` | string | yes | trimmed, 1 to 5000 (`required`, `tooLong`) |
| `company` | string | no | at most 120 (`tooLong`) |
| `phone` | string | no | only digits, spaces, and `+ ( ) - .`, at least 6 digits, at most 40 (`phone`, `tooLong`) |
| `country` | string | no | at most 80 (`tooLong`) |
| `need` | one of the service slugs or `other` | no | out of list is a bug, not a visitor error: it maps to `required` on that field |
| `projectType` | one of `projectTypes[].value` | no | as `need` |
| `lod` | one of `lodOptions[].value` | no | as `need` |
| `turnstileToken` | string, non empty | yes | its absence is handled by AC-9, never shown as a field error |

`validateContactRequest(input, allowed)` returns `{ ok: true; value: ContactRequest } | { ok: false; errors: Partial<Record<ContactField, ErrorCode>> }`, where `ErrorCode` is `'required' | 'email' | 'phone' | 'tooLong'`. It never throws.

`SubmitResult` = `{ ok: true } | { ok: false; kind: 'invalid'; errors: Partial<Record<ContactField, ErrorCode>> } | { ok: false; kind: 'failed' }`.

Nothing is persisted. There are no relationships. A submission is a message, not a record.

**State transitions** (the island):

- `form` is `idle` or `submitting`, then ends in `success`, or goes back to `idle`.
- `idle`, Submit, and validation fails or there is no token: stay `idle`, show errors (AC-7, AC-9), and set `showLive = true`.
- `idle`, Submit, and everything is valid with a token: go to `submitting`, which calls `submitContact`.
- `submitting` with `{ ok: true }`: go to `success` (final, AC-11).
- `submitting` with `invalid` or `failed`: go back to `idle` with errors or the delivery message, and reset the widget (AC-12).
- The Turnstile widget is `loading`, `ready`, or `error`, with `token` either present or absent. `expired` clears the token and resets the widget. `error` (script missing after 10 seconds, or the widget's error callback) clears the token and shows the captcha message at once. Turnstile's own `retry: 'auto'` keeps trying. Submit while in `error` calls `reset()`, which goes back to `loading`. A token arriving moves it to `ready` and clears the message.

**API surface**: no endpoint is added in this release. The contract below extends spec 0001's and is what `submitContact` already speaks. The delivery feature implements it.

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/contact` (not built yet) | POST | `ContactRequest` JSON: `name`, `email`, `message`, `turnstileToken` (req), `company`, `phone`, `country`, `need`, `projectType`, `lod` (opt) | `200 { ok: true }` | public, gated by a Turnstile token checked on the server | `400 { ok: false, errors: { <field>: <code> } }` (codes, not copy, so the island shows the content message), `403 { ok: false, error: 'captcha' }` (token rejected, shown like AC-9), `502 { ok: false, error }` (delivery failed) |

Spec 0001 had `400` carry a message. This spec changes it to carry a code, so the language stays in content. That is an update to 0001's contract, and 0001 now points here.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Build `/contact-us` | page title, description | `contact.seo` |
| | `h1`, intro and its marks | `contact.heading`, `contact.intro` |
| | building photo, alt | `contact.photo` |
| | `h2`, band background | `contact.form.heading`, `contact.form.background` |
| | nine labels, "Optional" hints, select prompt | `contact.form.labels`, `.optionalHint`, `.selectPrompt` |
| | which fields are required | fixed by this spec: name, email, message (in the schema) |
| | "Your needs" choices | `getServices(lang)` slug and title, in collection order, then `other` with `contact.form.needOtherLabel` |
| | project type, level of development choices | `contact.form.projectTypes`, `contact.form.lodOptions` |
| | submit, sending labels, noscript note | `contact.form.submitLabel`, `.sendingLabel`, `.noScript` |
| | card headings | `contact.cards.talk.heading`, `.visit.heading`, and `settings.contact.email` for the email card |
| | phone, address, email, `tel:` and `mailto:` hrefs | `settings.contact.phone`, `.address`, `.email` (the `tel:` href derived by stripping everything but digits and a leading `+`) |
| | the island's `lang`, Turnstile `language` | `resolveLocale(Astro.currentLocale)` |
| | entrance order | position in the intro band: heading 0, paragraph 1, photo 2 |
| | reveal order | `data-reveal` and `data-reveal-stagger` in the form band markup |
| Render Turnstile | site key | `PUBLIC_TURNSTILE_SITE_KEY` through `astro:env/client` |
| | theme, action | constants in `ContactForm`: `'dark'`, `'contact'` |
| | token | the widget's success callback |
| Submit | field values | the visitor's input, trimmed |
| | allowed keys for `need`, `projectType`, `lod` | the same lists passed to the island as props |
| | error message shown | `contact.errors[code]`, where the code comes from `validateContactRequest` or `SubmitResult.errors` |
| | captcha message and fallback email | `contact.errors.captcha`, `settings.contact.email` |
| | pending delay (stand in only) | a named constant in `submitContact`, 600ms |
| | success heading and text | `contact.success.heading`, `.text` |
| | delivery failure message | `contact.errors.deliveryFailed` |

**Key invariants**:

- No visible copy outside content (AC-2). `src/lib/contact.ts` returns codes, never words.
- `submitContact` is the only place the form touches the outside world. In this release it makes no network request, and says so.
- The request schema is one factory in `src/lib/contact.ts`, used by the island now and the endpoint later. There is never a second copy of the rules.
- A dropdown answer is always a key from the list the page was built with. Labels never travel.
- Typed details never enter a URL, storage, a cookie, or a log.
- `/contact-us` is the only page that hydrates React and the only page that loads the Turnstile script.
- Nothing on the form band uses a text colour other than white, `error-on-dark`, or the black label on the gold button. The cards are white surfaces and use the light rules.
- No CSS hides content waiting for a script. The only hiding is the `entrance` keyframes and the scroll reveal.

**Security model**: a public page. The form collects personal data (name, email, phone, company, country, project description) but, in this release, sends and stores none of it: `submitContact` returns locally, and nothing is written to storage or logged. Turnstile runs a third party script from Cloudflare on this page only. It is the site's host, so there is no new vendor, but feature 13's privacy page must mention both the form and the Turnstile check. The site key is public by design. The secret key does not exist in this release, and when delivery lands it is a Cloudflare secret (`TURNSTILE_SECRET_KEY`), never committed. The browser side check is for the visitor's convenience only. The endpoint must validate the request again and verify the token with Cloudflare before sending anything. No authentication, no roles, no compliance scope beyond ordinary personal data handling.

**Configuration required**:

- `PUBLIC_TURNSTILE_SITE_KEY`: the Turnstile widget's public site key, declared in `astro.config.mjs` `env.schema` as `envField.string({ context: 'client', access: 'public' })` with no default, so a build without it fails. `.env.development` (committed, since a site key is public) holds Cloudflare's always passing test key `1x00000000000000000000AA` for `pnpm dev`. `.env.example` documents it, and a local `.env` (git ignored) holds it for `pnpm build`. The real key comes from one Turnstile widget you create in the Cloudflare dashboard, listing both the live Worker's hostname and the dev Worker's (`bim-delivery-site-dev.bimdelivery.workers.dev`), so both builds use the same key. The value is inlined into the page's JavaScript at build, so it has to exist wherever the build runs. For the live site (built by Cloudflare on push to `main`), add `PUBLIC_TURNSTILE_SITE_KEY` under the Worker's Settings, Build, Variables and secrets. For the dev link (built on your machine with `CLOUDFLARE_ENV=dev`), put the real key in your local `.env` instead of the test key.
- Later, not now: `TURNSTILE_SECRET_KEY` (a Cloudflare secret) arrives with the delivery feature, next to `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: fill name, email, and message, pick a need and an LOD, wait for the test key widget to pass, submit. The button shows the sending label, then the thank you panel replaces the form with focus on its heading, and the network panel shows no request to `/api/contact`. Verifies **AC-6**, **AC-8**, **AC-10**, **AC-11**.
- Validation: submit empty. Name, email, and message show the required message, focus lands on name, and nothing else shows an error. Type a bad email and a phone of `12`, then fix each: every error clears as it is fixed. Paste 5001 characters into the description: `tooLong`. A screen reader reads each error with its field. Verifies **AC-7**.
- No captcha: block `challenges.cloudflare.com` in devtools and load the page. Without pressing anything, the captcha message with the email link shows under the widget within 10 seconds. Fill the form and submit: nothing is submitted. Verifies **AC-9**.
- Failure results: temporarily make `submitContact` return `{ ok: false, kind: 'failed' }`, then `invalid` with an email error (reverted after). The typed values stay, the right message shows, and the widget resets. Verifies **AC-12**.
- JavaScript off: the noscript note with the email and phone shows above the form, and Tab skips every field and the button (the fieldset is disabled). With JavaScript on, the console shows no hydration warning. Verifies **AC-13**.
- Content rules: add an unknown key to `contact.yaml`, duplicate an `lodOptions` value, give a value capitals, set a service slug to `other`. Each fails the build naming the problem (reverted after). Verifies **AC-3**.
- Layout and contrast: 375, 768, 1024, 1920. No sideways scroll, the photo is gone below 1024, the cards come after the form, and the colours match AC-18. "A phone never downloads the photo" rests on how browsers treat a lazy image that is not displayed, not on a guarantee in the HTML standard, so confirm it in a real browser: the building photo is absent from the network panel on a fresh 375px load. Verifies **AC-4**, **AC-5**, **AC-14**, **AC-17**, **AC-18**.
- Build: `dist/client/contact-us/index.html` exists, other pages ship no React and no Turnstile request, and `pnpm check`, `pnpm lint`, and `pnpm build` pass. Verifies **AC-19**, **AC-20**.
- Auth and permission: none. The page and the future endpoint are public, and the endpoint's gate is the Turnstile token (delivery feature).

## Build plan

Skateboard: the first four steps produce a whole, usable contact page (details, a working form, and the thank you panel). Turnstile and motion then grow it.

0. Prerequisite (you, in the Cloudflare dashboard, can run in parallel): create a Turnstile widget (managed mode) for the live Worker's hostname and `bim-delivery-site-dev.bimdelivery.workers.dev`, and keep its site key for step 6. The secret key is not needed until delivery.
1. Content: replace the `contact` schema in `content.config.ts` with the strict shape above (key format, unique values). Rewrite `contact.yaml` with placeholder copy written for BIM Delivery in the reference's shape, the project types and LOD lists, and two Pexels photos logged in `CREDITS.md`. Add `other` to `RESERVED_PATHS`. Update the style guide's use of the old fields. Satisfies **AC-2**, **AC-3**.
2. `src/lib/contact.ts`: `contactRequestSchema`, `ContactRequest`, `ContactField`, `ErrorCode`, `validateContactRequest`, `SubmitResult`, and the stand in `submitContact` with its "nothing is sent" comment. Satisfies **AC-7**, **AC-10**, **AC-12**, **AC-19**.
3. Design system: the `--color-error-on-dark` and `--color-scrim-strong` tokens, the `bg-diagonal-dark` utility, the `dark` field class variants and the `surface` prop on `TextField` and `TextArea`, `tel` in `TextField`'s `type`, the new `Select`, and the `headset`, `map-pin`, and `envelope` glyphs. Satisfies **AC-6**, **AC-7**, **AC-14**, **AC-18**.
4. The page, without Turnstile yet: `IntroBand`, `FormBand`, `ContactCard`, and `ContactForm` (fields, submit time then live validation, focus on the first error, pending state, success panel, failure handling, `method="post"`, the `<fieldset disabled>` enabled after mount, and the noscript note above the form), composed in `contact-us.astro` with `client:visible`. The page is usable end to end after this step. Satisfies **AC-1**, **AC-2**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-10**, **AC-11**, **AC-12**, **AC-13**, **AC-14**, **AC-16**, **AC-17**.
5. Config: the `env.schema` entry, `.env.development` with the test key, and `.env.example`. Update `.dev.vars.example`'s note to name the future `TURNSTILE_SECRET_KEY`. Satisfies **AC-8**.
6. Turnstile: `useTurnstile` (widget id in a ref, `remove` on cleanup), the widget in the submit row with `retry: 'auto'`, the token in the request, expiry reset, the 10 second load timeout, the captcha message shown on `error` or on Submit without a token, and `reset()` on Submit while in `error`. Set the real site key as the live Worker's build variable and in your local `.env` for the dev link. Satisfies **AC-8**, **AC-9**, **AC-12**.
7. Motion: `entrance` steps on the intro band, and `data-reveal` on the form band's heading, form, and cards, with `reveal.ts` imported by the page. Satisfies **AC-15**.
8. Docs and gates: `docs/design.md` (tokens, contrast pairs, the form band, `Select`, the `surface` prop, `ContactCard`, icons) and the `/styleguide` entries. Run `pnpm check`, `pnpm lint`, and `pnpm build`. Confirm one HTML file per route and that React and Turnstile appear only on `/contact-us`. Walk the critical test scenarios. Satisfies **AC-18**, **AC-20**.

## Consequences

**Positive**:

- The page looks like the reference and is usable today. Visitors see real contact details, and the form behaves exactly as it will once sending is real.
- Delivery becomes a small, contained feature: write the endpoint's insides (validate with the same schema, verify the token, send the email) and swap one function body. The island does not change.
- Dropdown keys give clean, comparable enquiries that survive a second language.
- The dark band pattern (strong scrim, light stripe, light error colour, `surface` on fields) is now defined once and reusable.

**Negative / tradeoffs**:

- Until delivery lands the form sends nothing, so a real visitor who fills it in is lost. The page must not go live on a public domain before delivery (or before the form is swapped for the plain details). This is the scope's explicit choice, restated here because it now has a thank you panel that looks final.
- Turnstile shows a widget and makes a third party request now, for protection that only starts working when the server checks the token. It is weight paid in advance, chosen for the finished look.
- Nine fields are a longer form than the four modelled before. Optional marking softens it, but some visitors will still stop.
- `/contact-us` ships React (roughly 60 KB compressed) plus the Turnstile script, the heaviest page on the site. `client:visible` delays both until the form is near the screen.
- A second, stronger scrim token and a second error colour add to the palette design.md has to keep consistent.
- Local `pnpm build` now needs a `.env` with the site key, a small setup step.

**Neutral**:

- Spec 0001's endpoint contract is extended (more fields, a token, error codes instead of messages, a `403`). Spec 0002's `contact` row is replaced by this data model. Spec 0003's open question about "Optional" versus a required marker is settled (an "Optional" hint from content).
- `Select` becomes the fourth React field component, and the service pages or a future search could reuse it.

## Follow-up

- [ ] Delivery feature ("Working contact form delivery", needs a decision): implement `POST /api/contact` with `validateContactRequest`, Turnstile `siteverify` with `TURNSTILE_SECRET_KEY` (and a check that `action` is `contact`), Resend, and rate limiting. Replace `submitContact`'s body with the `fetch`. Do not log bodies.
- [ ] Feature 13 (privacy page): name what the form collects and that Cloudflare Turnstile runs on the contact page.
- [ ] Feature 14 (launch): add the real domain to the Turnstile widget's hostnames and set the build variable. Do not launch the form without delivery.
- [ ] `/sync`: `AGENTS.md` should record the new `PUBLIC_TURNSTILE_SITE_KEY` config and the `.env` step for local builds. `docs/design.md`'s dark band paragraph (the "no dark tone" note) should point at the form band's rules.
- [ ] Spec 0006 is still `Assumed` and this page adds two more Pexels photos. Ratifying it (`/architect remote photos`) covers them too.
- [ ] Real copy and real photos replace the placeholders before launch.
