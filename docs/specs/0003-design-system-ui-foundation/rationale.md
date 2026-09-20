# 0003. Design system & UI foundation: rationale

The decision record behind [index.md](index.md). `/develop` builds from `index.md` and can skip this file.

## Context

Features 5 to 10 build six pages and a site shell for a BIM and Revit modeling firm. Each of them needs the same things: colours, a type scale, spacing, three screen sizes (phone, tablet, desktop), and a handful of repeated pieces (bands of content, buttons, cards, form fields). If those are not settled first, every page feature invents its own, and the site drifts: slightly different blues, three button styles, headings that jump in size between pages. The scope makes this explicit: a page must be composable from the base pieces "without writing new one off CSS".

There is no brand of this company's own yet. What there is instead is a reference: the engineer pointed at paviliusbim.com, a WordPress and Divi site in the same trade, and extracted its palette. Gold `#e09900` carries the primary calls to action, links, borders, and heading accents; bright yellow `#ffcc00` carries the logo, icons, and highlights; `#ff9900` appears as a minor accent; the neutrals are white, black, `#333333` for sub headings, and `#666666` for body text, which is the most used text colour on the page. A Divi default link blue (`#2ea3f2`) shows up in a few places and is not an intentional brand colour.

That changes the task from inventing a direction to adopting one, and it brings a problem with it. Gold `#e09900` on white measures 2.41:1. The reference site uses it for links and heading accents directly on white, which fails WCAG AA at every text size, and the scope asks for readable contrast. So the palette cannot simply be copied; it has to be adopted in a way that keeps the look and passes. The system still has to survive a real brand arriving before launch, which argues for tokens named by role and for keeping every value in one place.

The stack is fixed by spec 0001: Astro 7 prerendering every page, Tailwind CSS v4, zero JavaScript by default, React only for the contact form island. Tailwind is chosen but not yet installed, and neither is the React integration. The performance feature (12) will later hold the site to Core Web Vitals on a mid range phone, so font loading and image sizing choices made here either help or fight it. The site is public, and the scope asks for keyboard access, visible focus, and readable contrast, which in practice means WCAG 2.2 AA.

One force that shaped an earlier draft of this spec has since gone away. That draft assumed several dark bands, which made "how does a component learn which background it sits on" the main structural question beyond the tokens. The engineer settled the palette on white and a warm tint only, with no dark tone, so every background is light, every component looks the same everywhere, and that question disappears along with the machinery that answered it. What replaces it as the one thing the system has to get right is the gold rule: which gold may be read, and which may only be filled.

The team is one frontend developer with about two years of React and Next.js experience, new to Astro, working with AI help. Whatever is chosen has to be easy to read in a year and hard to misuse by a later AI suggestion.

## Options considered

### Option 1: Tailwind v4 tokens, four small base components, colours named directly

Put every token in one `@theme` block, clear Tailwind's default palette and unused breakpoints, build `Section`, `Button`, and `Card` in Astro and the form fields in React, and share classes through a plain TypeScript class map. As first written this option also let a dark `Section` set CSS custom properties that every child reads; with the palette settled on two light tones, that part is dropped and components name their colours directly.

**Pros**:
- Uses exactly what spec 0001 chose, with no new runtime dependency (the Prettier plugin is a dev tool).
- The build enforces the palette: a colour that is not a token produces no CSS.
- With both tones light, a component names its colours directly and looks the same wherever a page puts it.
- Zero client JavaScript; everything renders at build.

**Cons**:
- The gold rule (fill gold versus text gold) is a convention, not something the build can check, so it rests on the style guide, `design.md`, and review.
- Two `Button` implementations (Astro and React) to keep in step.
- Every component is hand built, so accessibility details (focus, labels, error linking) are this project's to get right.

### Option 2: A Tailwind component plugin (daisyUI or Flowbite)

Install a Tailwind v4 compatible component library that ships ready made classes such as `btn`, `card`, and `input`, with themes configured in CSS.

**Pros**:
- Fastest start: buttons, cards, and inputs look finished on day one.
- Themes, including a dark variant for sections, come built in.
- Well documented, large community, works in Astro without React.

**Cons**:
- The result looks like every other site on the same library unless heavily themed, which is the work Option 1 does anyway.
- Ships and maintains a class vocabulary on top of Tailwind's, so there are two ways to style everything.
- Its accessibility and markup choices are its own; overriding them fights the library.
- Its defaults (rounded corners, colours, spacing) keep leaking in wherever a token was forgotten.

### Option 3: shadcn/ui style React components everywhere

Copy shadcn/ui style React components into the project and render sections, buttons, and cards as React components across the site.

**Pros**:
- Familiar to the engineer from React and Next.js work.
- Strong accessibility baseline from Radix primitives.
- `cva` and `tailwind-merge` make variants tidy.

**Cons**:
- Breaks the zero JavaScript rule from spec 0001 the moment any component needs interactivity, and pulls React into every page's mental model even when rendered static.
- Radix primitives are built for app UIs (dialogs, menus), most of which this marketing site does not need.
- Adds `cva`, `tailwind-merge`, and Radix dependencies for four simple components.

### Option 4: Hand written CSS with custom properties and BEM classes

Write a design token file of CSS variables and component classes (`.button--primary`, `.card__title`) with no utility framework.

**Pros**:
- No framework to learn; plain CSS every browser and every developer understands.
- Markup stays short and readable.

**Cons**:
- Reverses spec 0001's Tailwind choice and its main benefit: unused CSS never accumulates.
- Page layouts need their own CSS files again, exactly the "one off CSS" the scope wants to prevent.
- No build time guard against off palette values.

## Rationale

Option 1 wins because the forces point at it from three sides. The stack is already fixed on Tailwind v4 and zero JavaScript, which rules out Option 3 and makes Option 4 a reversal of a recent decision. The palette is borrowed from a reference site and will be replaced by a real brand before launch, so the system needs its values in one place and its names by role, which Option 1 gives directly and Option 2 only gives after enough theming to erase its own look. The palette swap on 2026-09-20 was the first live test of that, and it touched token values and five acceptance criteria while leaving the components untouched. And the scope's "no one off CSS" is only a wish unless something enforces it; clearing Tailwind's default palette and breakpoints turns it into a build fact for colours and screen sizes, and the class maps plus AC-14 cover the rest.

The palette decided the one piece of structure that is not plain Tailwind, and it decided it by removing it. An earlier draft carried inherited `--tone-*` custom properties so that components on a dark navy band would switch to light text without a prop being threaded through every card and button. With the engineer settling on white and a warm tint only, both light, there is nothing for those variables to express: every text, border, and focus colour is the same on both tones. Keeping the mechanism would have been abstraction with no case behind it, so it is gone, `Card` loses its tone reset, and there is one focus colour sitewide. The cost is that a dark band later is a change to this spec rather than a new prop value, which the Follow up records.

What replaced it is the gold rule. The engineer asked for gold on important keywords and highlights but not as the main text colour, and the contrast numbers turn that preference into a hard line: `#e09900` reads at 2.41:1 on white, so it cannot be a word at all, at any size. Three ways out were weighed. Reserving gold for fills and making every gold word black or gray is safest but loses the gold link colour the reference site is known for. Copying the reference exactly keeps the look and makes AC-11 unmeetable. Splitting gold into a fill token and a darker text token at the same hue (41 degrees, `#946600`, 5.05:1 on white) keeps both: buttons, highlights, and rules stay the brand gold with black on them, and gold words, links, and the focus ring use the deeper shade. Chosen, because it satisfies the engineer's request literally, passes AA with headroom on both tones, and costs one extra token plus a rule to remember.

The engineer made the direction calls (the reference site's palette, gold for keywords and highlights but not body text, a light background, no dark tone, yellow kept as a reserved accent, Inter, 4px corners, 768 and 1024 breakpoints, fluid headings, WCAG 2.2 AA, dev only style guide, React fields, plain variant maps). The smaller calls below were mine to make with the full design in view:

- **`#946600` as the text gold.** Same hue as the brand gold, dark enough to clear 4.5:1 on both the white and the tint background (5.05 and 4.79). Runner up: `#9a6a00`, a touch brighter and closer to the brand gold, which passes on white at 4.73 but lands at 4.47 on the tint and so fails on a band the site will use often.
- **`#fff9e6` as the tint band**, a warm cream mixed toward the gold rather than a neutral gray, so the second tone belongs to the palette instead of sitting beside it. Every pair on it was computed, and the tightest, ink-muted at 4.70:1, still clears 4.5. Runner up: a neutral `#f7f7f7`, safer on contrast and duller against a gold and white site.
- **Black on the gold button, not white.** White on `#e09900` is 2.41:1 and fails; black is 8.73:1. The reference site uses white, so this is the most visible departure from it. Runner up: a gold button dark enough for white text, around `#946600`, which keeps the reference's light on dark button but turns the brand gold brown.
- **The secondary button fills with brand gold on hover**, not with its own darker shade, so the brand colour appears on the interaction and the label flips to black at 8.73:1. Runner up: filling with `gold-ink` and white text (5.05:1), which passes but makes the hover look like a different, muddier colour.
- **`#ff9900` and `#2ea3f2` left out.** The orange sits between the gold and the yellow and earns nothing the gold does not already do; the blue is Divi's default link colour, not a brand choice, as the extraction itself notes.
- **Shared class maps in `src/components/ui/styles.ts`**, so the Astro and React buttons cannot drift. Runner up: duplicate the class strings in each component, simpler until the first change misses one copy.
- **Fontsource provider in Astro's fonts API.** Downloads Inter at build, self hosts it, and generates a metric matched fallback. Runner up: the `local` provider with a committed `.woff2`, which removes the build time network need but leaves updating the font to hand work.
- **Latin subset only.** English is the only language today; a Vietnamese subset (if that is the second language) is one entry in `subsets` later. Runner up: include it now, adding download weight nobody reads yet.
- **Card link as a stretched link on the title**, not the whole card wrapped in `<a>`. A wrapping link makes a screen reader read every word of the card as the link name. Runner up: whole card `<a>`, simpler markup and worse to listen to.
- **Card images at 3:2.** Suits both building photos and the service images, and a fixed ratio means no layout shift while images load (feature 12). Runner up: 4:3, a little taller and more cramped in a three column row.
- **Field ids from React `useId()` when none is passed**, so labels and errors link correctly even when feature 10 forgets an id. Runner up: a required `id` prop, which pushes the bookkeeping onto every caller.
- **No required marker drawn by the fields.** Any marker text would be copy inside a component, which the content rule forbids; the form passes a hint from content instead. Runner up: an asterisk, which is not copy but is poorly announced by screen readers.
- **Dev only style guide through a local integration's `injectRoute`**, gated on `command === 'dev'`. The page never enters the build, so the "one HTML file per route" rule is untouched. Runner up: a prerendered page with `noindex`, which ships a URL a client could find.
- **React integration installed now, not in feature 10.** The fields are part of the design system per the scope, and they cannot be written without it. Runner up: CSS classes only now and React components in feature 10, which splits one component's design across two features.
- **No `Container` component.** The engineer declined extras, and `Section` already owns width and gutters, so a separate container would be a second way to do the same thing.

## What changed on 2026-09-20

The spec was first written on 2026-09-19 around an invented direction: deep navy from the placeholder logo, an amber accent, and three section tones including a dark navy band. The engineer then supplied the palette extracted from paviliusbim.com and asked for it instead, chose a light only background with no dark tone, asked that gold carry keywords and highlights rather than body text, and kept yellow as a reserved accent.

What changed: every colour token; the tone count from three to two; the removal of the `--tone-*` mechanism, the `Card` tone reset, and the second focus colour; the primary button from amber with navy text to gold with black text; the focus ring to a single deep gold; and the addition of the gold role rule with its own guard scenario. AC-6, AC-7, AC-10, AC-11, and AC-13 were reworded to match.

What did not change: the option comparison and its outcome, the four components and their props, the type scale, the breakpoints, the spacing and rhythm, Inter through the fonts API, the dev only style guide, the class map approach, and the build plan's five steps. The structural decision survived the palette change intact, which is the main thing a role named token set is supposed to buy.

## Evidence: contrast calculation

Ratios in the `index.md` tables were computed on 2026-09-20 from the token hex values with the WCAG 2 relative luminance formula (linearise each sRGB channel, weight 0.2126 R + 0.7152 G + 0.0722 B, ratio = (lighter + 0.05) / (darker + 0.05)).

The tightest pairs, and so the ones to recheck first if a value ever moves:

| Pair | Ratio | Requirement | Headroom |
|---|---|---|---|
| ink-muted `#707070` on tint `#fff9e6` | 4.70 | 4.5 | 0.20 |
| gold-ink `#946600` on tint | 4.79 | 4.5 | 0.29 |
| ink-muted on white | 4.95 | 4.5 | 0.45 |
| gold-ink on white | 5.05 | 4.5 | 0.55 |
| ink `#666666` on tint | 5.45 | 4.5 | 0.95 |
| field border `#767676` on tint | 4.31 | 3.0 | 1.31 |

The warm tint is what makes these tight: it is lighter than white in no channel and darker in blue, so every pair loses a little against it compared with white. Two consequences follow. Darkening the tint much below `#fff9e6` pushes ink-muted under 4.5, and lightening `gold-ink` above roughly `#966700` does the same to it. Either change means computing the whole table again.

Three values are excluded by role rather than by measurement: gold `#e09900` on white (2.41), yellow `#ffcc00` on white (1.51), and line `#e5e5e5` on white (1.26). None renders as text or as a control boundary, so no threshold applies; the gold role table in `index.md` is what keeps that true, and the gold guard scenario is what checks it.

If any token value changes, compute the pairs again and update both `index.md` and `docs/design.md` in the same commit.
