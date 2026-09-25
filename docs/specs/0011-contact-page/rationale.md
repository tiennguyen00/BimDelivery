# 0011. Rationale: the Contact page

The decision record behind [index.md](index.md). `/develop` builds from `index.md` and can skip this file.

## Context

The contact page is where the site turns a reader into an enquiry, and today `/contact-us` is a stub: a heading and one line. Scope feature 10 asks for contact details plus a form that "looks and behaves real" while sending nothing, because real delivery (email, spam protection) is its own later feature. The engineer supplied a reference screenshot and wants the page to match it: a white intro band with a building photo, then a dark photo band holding a nine field form, a sum captcha, and three contact cards.

The foundations already decided most of the machinery. Spec 0001 fixed the contact form as the site's single React island and fixed the shape of the future `POST /api/contact` endpoint, with Release 1 faking success locally. Spec 0002 modelled a `contact` entry with four fields. Spec 0003 built `TextField`, `TextArea`, and a React `Button` with always visible labels and no placeholder text. The reference departs from all three: it has nine fields (three of which read like choice lists), placeholder only boxes, a captcha, and a dark band the design system does not have. design.md states outright that there is no dark tone, and that a dark surface would need a light error colour and computed contrast pairs.

The forces: the page must look like the reference; it must keep the site's accessibility bar (visible labels, errors tied to fields, focus management); it must not tie the future endpoint to a shape it will regret; it must stay inside the zero JavaScript floor everywhere except this page; every word must live in content; and the whole thing has to run on the static Cloudflare build, with no server code in this release.

Not deciding leaves `/develop` to invent the field list, the choice lists, which fields are required, what a captcha means with no server, and how red error text survives on black. Those are exactly the choices that decide whether the enquiries are useful and whether the form is accessible.

## Options considered

### Option 1: Content driven two band page, React island on the shared fields, shared request schema, Turnstile now

The layout of the reference. All nine fields, three of them dropdowns whose keys come from content and the services list. One React island owns the form and calls a single `submitContact` function, which returns success locally for now. One Zod schema in `src/lib/contact.ts` holds the rules for both the island and the future endpoint. Cloudflare Turnstile renders now and hands the form a token that the endpoint will verify later. The dark band gets its own strong scrim, a light stripe, and a light error colour.

**Pros**:
- Matches the reference and the engineer's picks, with the accessibility rules of spec 0003 intact.
- The delivery feature swaps one function body. The form, its schema, and its captcha are already the final ones.
- Stable keys for the dropdowns keep enquiries comparable across languages.

**Cons**:
- The heaviest page on the site (React plus the Turnstile script).
- A captcha that protects nothing until the server checks it.
- More content fields and two new design tokens to maintain.

### Option 2: The four modelled fields, no captcha, light tone

Build exactly what spec 0002 and 0003 already describe: name, email, company, message on a white or tint band, details beside it, no captcha until delivery.

**Pros**:
- Smallest change. No content model rewrite, no new tokens, no third party script.
- Least friction for visitors.

**Cons**:
- Does not look like the reference, which is the engineer's explicit ask.
- Loses the lead qualifying questions (need, project type, level of development) the business wants.

### Option 3: A plain HTML form with a small plain script, no React

Render the form in Astro, validate with a plain script, as the nav and counters are done, and drop React from the site entirely.

**Pros**:
- Keeps one interactivity idiom sitewide and ships far less JavaScript.
- Works as a real form post the day the endpoint exists.

**Cons**:
- Reverses spec 0001 and 0003, which chose React for this island and already built its field components.
- Hand managing error state, focus, live revalidation, a captcha lifecycle, and a success swap in DOM code is where plain scripts get fragile.

## Rationale

Option 1, because the engineer asked for the reference and chose each of its pieces, and because it is the option that makes the later delivery feature smallest. The foundations already paid for React and the field components, so reusing them is the boring path. Option 3 would be a better choice for a site with no React at all, but here it would undo two accepted specs to save a few kilobytes on one page. Option 2 is honest about the missing server, but it ignores the ask.

The engineer's picks, briefly: all nine fields for better leads, with only name, email, and message required so the form stays easy. Dropdowns for the three project questions, with keys, so answers are comparable and survive translation. Visible labels, keeping spec 0003. Turnstile as the captcha, because it comes from the site's own host, is usually invisible, and is the one captcha whose server check is a single call from the Worker the endpoint will run on. A sum checked in the browser stops no bot. Loading the official script through a small hook avoids a dependency for about thirty lines of code. Blocking the send when there is no token, with the email as a way out, keeps the rule simple and never strands a real person.

Calls made at write time, each with its runner up:

- **`client:visible` hydration** (runner up `client:load`). React and Turnstile load only when the form nears the screen. The submit button ships disabled until hydration, so nothing can post before the island is ready. On a desktop the form is usually in view at load anyway.
- **No network call in the stand in** (runner up: `fetch` to the missing path). Spec 0001 said the form fakes success locally. A real `fetch` to a path that does not exist would return a 404 on the static build and read as a delivery failure. One function, whose body the delivery feature replaces, keeps the island unchanged.
- **Error codes, not messages, from the schema and the endpoint** (runner up: messages, as 0001 first wrote). Copy lives in content, and the server should not need to know the page's language. The island maps codes to `contact.errors`.
- **A `surface` prop on the fields** (runner up: separate dark field components). The box is identical on both surfaces; only the label, hint, and error colours change. One prop keeps one component.
- **A native `Select` in the design system** (runner up: a custom listbox). A native select is keyboard and screen reader correct for free, and good on phones.
- **Scrim 0.8, not 0.75.** The engineer approved a darker scrim to carry a light error colour. The light stripe on top lightens the worst case pixel. At 0.75 plus the stripe, `#ff9b8f` would drop below 4.5:1, while at 0.8 it measures 5.19:1 and white measures 10.5:1.
- **`#ff9b8f` for errors on dark.** It is a light coral that reads as an error, reaches 10.3:1 on black and 5.19:1 on the worst case band pixel, and is never used on a light surface.
- **`ContactCard` as a page component** (runner up: extend `Card`). `Card` is an image card with a title and summary. The contact card is an icon, a heading that may be a link, and one value. Bending `Card` would cost more than the small new component.
- **Intro photo hidden below `lg`.** The engineer chose it. Lazy loading plus not being displayed means phones never fetch it.
- **The site key in a typed public env variable.** The engineer chose it. A missing key fails the build. Cloudflare's test key in `.env.development` makes `pnpm dev` work with no setup. A production build that wrongly used the test key would, once delivery lands, fail every server check loudly rather than let bots through silently.

The premise worth stating: a form that shows "thank you" while sending nothing is safe only while the site is not public. The scope already accepts this for Release 1, and the index's Consequences and Follow-up tie launch to delivery.
