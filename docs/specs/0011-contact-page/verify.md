# Verify: Contact page · spec 0011 · updated 2026-09-25

_Steps derived from spec 0011 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones._

Serve the real build as the `verify` skill describes (`pnpm build`, then `pnpm exec wrangler dev --port 8799 --ip 127.0.0.1`), and open `/contact-us/`. Stop the server before building again: on Windows it locks `dist/client`.

## UI / manual

- [ ] Load `/contact-us/` → two bands (white intro, dark form band), then the unchanged footer with its certification panel → AC-1
- [ ] Read the intro band → `h1` "Contact us" in capitals with the gold rule, one left aligned paragraph with bold and `gold-ink` phrases, and at 1024px and up a 4:3 building photo on the right → AC-4
- [ ] At 375px, fresh load, network panel → no request for `pexels-photo-323705` (the building photo) → AC-4
- [ ] Look at the form band → greyscale construction photo under a dark layer and a faint stripe, white `h2` in capitals, form on the left and cards on the right at 1024px and up; below that, heading, form, then cards → AC-5
- [ ] Count the fields → nine, in the order name, company, email, phone, country, your needs, project type, level of development, description (full width); two per row from 768px. Name, email, and description carry `aria-required="true"`; the other six show "Optional" on the label line → AC-6
- [ ] Open "Your needs" → "Choose one", the three services in collection order, then "Other". Project type and level of development list their content choices in order → AC-6
- [ ] Type into a field before submitting → no error shows → AC-7
- [ ] Press Send message with everything empty → name, email, and description show "Please fill in this field."; focus lands on name, clear of the sticky header; nothing else shows an error → AC-7
- [ ] Type `not-an-email` in email and `12` in phone → their messages appear as you type; fix each → the message clears at once → AC-7
- [ ] Paste 5001 characters into the description → "This is longer than we can take…" → AC-7
- [ ] With a screen reader, move to a failing field → it reads the label, the hint if any, then the error → AC-7
- [ ] Wait for the Turnstile widget (dark theme) beside the button at 768px and up, above it on a phone → a token arrives (the test key says "Success!") → AC-8
- [ ] Block `challenges.cloudflare.com` in devtools and reload → within 10 seconds, without pressing anything, the message "We could not confirm you are not a robot…" appears under the widget with a `mailto:` link to the settings email → AC-9
- [ ] With it still blocked, fill the form and submit → nothing is submitted, the form stays, focus does not jump to the message → AC-9
- [ ] Unblock, fill name, email, and description, wait for the token, submit → the button shows "Sending…" and is disabled, the form has `aria-busy="true"`, and a second click does nothing → AC-10
- [ ] In the network panel during that submit → no request to `/api/contact`, and no request carrying the typed details → AC-10
- [ ] After the pause → the form is replaced by the "Thank you" panel with focus on its heading; reload → an empty form again → AC-11
- [ ] Temporarily make `submitContact` return `{ ok: false, kind: 'failed' }`, rebuild, submit → the delivery message shows above the submit row, typed values stay, the widget resets. Then return `invalid` with `{ email: 'email' }` → the email error shows and takes focus. Revert → AC-12
- [ ] Disable JavaScript and reload → the note and the email and phone links show above the form; Tab skips every field and the button → AC-13
- [ ] With JavaScript on, the console shows no hydration warning → AC-13
- [ ] Read the cards → headset "Talk to us" with the phone as a `tel:` link (only digits and a leading `+` in the href), map pin "Visit us" with the address, envelope with the email as the heading and a `mailto:` link → AC-14
- [ ] Reload at the top → the intro heading, paragraph, and photo fade and rise in order. Scroll down → the form band's heading, then the form, then each card reveal. With reduced motion asked for → everything is simply there → AC-15
- [ ] Check the heading outline → one `h1`, one `h2`, and `h3`s for the three cards and the thank you panel; each band points at its heading → AC-16
- [ ] At 375, 768, 1024, and 1920px → no sideways scroll, no overlapping text, the widget fits its row; at 1920 the bands use the default band width → AC-17
- [ ] Tab through the form band → every field, link, and the button show the two colour focus ring → AC-5, AC-18

## Value sources (vary the source, check the output)

- [ ] Change `contact.seo.title` → the tab title changes → AC-2
- [ ] Change `contact.heading`, `contact.intro` (add a `==phrase==`), `contact.photo.alt` → the page follows → AC-2, AC-4
- [ ] Change `contact.form.heading` and swap `contact.form.background` for another Pexels link → the band follows → AC-2, AC-5
- [ ] Change a label in `contact.form.labels`, `optionalHint`, and `selectPrompt` → every field follows → AC-2, AC-6
- [ ] Rename a service title → its "Your needs" choice follows, and the value sent is still the slug → AC-6
- [ ] Change `needOtherLabel`, reorder `projectTypes`, add an `lodOptions` entry → the dropdowns follow in order → AC-6
- [ ] Change `submitLabel`, `sendingLabel`, and `noScript` → the button, pending state, and noscript note follow → AC-10, AC-13
- [ ] Change the card headings, then `settings.contact` phone, address, and email → the cards, the `tel:` and `mailto:` hrefs, the noscript links, and the captcha fallback link all follow → AC-9, AC-14
- [ ] Change each of `contact.errors` → the shown message follows its code → AC-7, AC-9, AC-12
- [ ] Change `contact.success` → the thank you panel follows → AC-11
- [ ] Set `PUBLIC_TURNSTILE_SITE_KEY` to the always failing test key `2x00000000000000000000AB` in `.env` and build → the widget fails and the captcha message shows → AC-8, AC-9

## Commands

- [ ] `pnpm check` → 0 errors, 0 warnings → AC-20
- [ ] `pnpm lint` → clean → AC-20
- [ ] `pnpm build` with a `.env` holding the site key → completes, and `dist/client/` holds 8 HTML files including `contact-us/index.html` → AC-20
- [ ] `pnpm build` with no `PUBLIC_TURNSTILE_SITE_KEY` anywhere → fails naming the variable → AC-8
- [ ] Only `dist/client/contact-us/index.html` contains `astro-island`, and only the `ContactForm` bundle mentions `challenges.cloudflare.com` → AC-20
- [ ] Add an unknown key to `contact.yaml` → the build fails naming it → AC-3
- [ ] Duplicate an `lodOptions` value → fails with "repeats the value …" → AC-3
- [ ] Give a value a capital (`LOD-200`) → fails with "must be a lowercase key" → AC-3
- [ ] Set a service's slug to `other` → fails with the reserved path message → AC-3
- [ ] Search `src/` for the forbidden gold classes in `docs/design.md` → no hit in the contact page's files → AC-18
- [ ] Grep `src/pages/contact-us.astro`, `src/components/contact/`, `src/components/react/ContactForm.tsx`, and `src/lib/contact.ts` for visible English → none; every word arrives from content → AC-2, AC-19

## Acceptance-criteria coverage

- AC-1 load step · AC-2 value source steps and the copy grep · AC-3 the four content rule commands · AC-4 intro band and 375px network steps · AC-5 form band look and focus ring · AC-6 field and dropdown steps · AC-7 validation steps · AC-8 widget step, failing key, missing key build · AC-9 blocked script steps · AC-10 pending and no network steps · AC-11 thank you step · AC-12 failure results step · AC-13 JavaScript off and hydration steps · AC-14 cards step · AC-15 motion step · AC-16 heading outline step · AC-17 four widths step · AC-18 focus ring and gold search · AC-19 copy grep · AC-20 check, lint, build, and island commands
