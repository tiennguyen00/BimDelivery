# 0001. Stack and architecture: reasoning

Decision record for [index.md](index.md). `/develop` does not read this file.

## Context

> ⚠️ Premise note: the scope fixes the service URLs as `//revit-modeling, /scan-to-bim, /bim-coordination`, `/service-2`, and `/service-3`, and the scope itself already flags that those paths tell a search engine nothing. This is worth reopening now rather than later, because it is the one part of this foundation that cannot be changed cheaply afterwards. Once the site is live and indexed, renaming a URL costs the ranking that URL earned and needs a permanent redirect to keep old links alive. Everything else decided here (the framework, the host, the styling, the content format) can be swapped later with work but no external cost. The right framing is to pick descriptive paths such as `/revit-modeling` before the first page exists, and keep the numbered scheme only if a real constraint demands it. **Resolved on 2026-09-19: the engineer accepted this and chose descriptive slugs.** The service pages now take paths derived from what each service is, rather than a number. The slug becomes a required field on each service content entry and one dynamic route generates all three as static pages, which also means adding a fourth service is purely a content entry. The three actual slug values get set in feature 3 when the services are named. Features 5 and 8 of the scope still quote the old numbered paths and need reconciling.

A BIM and Revit modelling services company needs a public marketing website: seven routes at launch (home, about, three service pages, project, contact), all carrying placeholder copy until real content arrives. There is no application behind a login, no user accounts, and no data that visitors create beyond a contact message.

Four forces shape the choice.

**Search engines and previews have to read the text.** The site exists to be found. Every page's words must already be present in the HTML the server sends, which rules out anything that paints the page with JavaScript after it loads.

**Speed is a stated requirement, not a nice to have.** Release 2 sets a hard target: a production build of the home page must meet the Core Web Vitals thresholds on a mid range mobile. That target either falls out of the architecture or has to be fought for against it, and which of those it is gets decided here.

**The audience is in Vietnam and nearby, and the form must really send.** Visitors are mostly regional, so the physical distance between them and whatever serves the site matters. The contact form is fake in the first release but has to deliver to an inbox soon after launch, which means the foundation needs somewhere to run a small piece of server code near those visitors. Choosing a platform that cannot do that means changing platforms later.

**One developer maintains this, with AI help.** A frontend developer with two years of experience, fluent in React and TypeScript, owns the site after launch. Content stays as files in the repository; no browser based editing is planned. Capability is not the constraint, but time is, so a stack that demands constant vigilance to stay fast is a worse fit than one that is fast by default. A second language is expected eventually, with the pair undecided, so the shape has to accommodate one without a rebuild.

Not deciding means the scaffold gets built on whatever is familiar, and the performance target, the regional latency, and the form's server code each become a surprise partway through Release 2.

## Options considered

### Option 1: Astro 7, fully prerendered, with React islands, on Cloudflare

Astro builds every route to a plain HTML file and ships no JavaScript unless a component explicitly asks for it. Interactive pieces can be written as React components and mounted individually. Content lives in typed collections validated at build. Cloudflare serves the static files and runs the later form endpoint on the same platform.

**Pros**:
- The performance target is the default state rather than an achievement. Pages that carry no interactive component ship no framework code at all.
- Content collections validate every entry against a schema when you build, so a missing headline or a broken image path fails the build instead of the live page. That is close to exactly what feature 3 needs.
- i18n routing is built in, so a second language is configuration plus content rather than a restructure.
- Cloudflare has network presence in Vietnam and Singapore, the free tier carries unlimited bandwidth and free custom domains, and the same platform runs the form function with no second vendor.
- Image optimisation is built in, which turns most of feature 12 into configuration.

**Cons**:
- New to the maintainer. Expect a slower first week and some friction learning where Astro's boundaries sit.
- Two idioms in one codebase once plain scripts and React components coexist.
- Fewer developers know Astro than know Next.js, so a future handover has a smaller pool.
- Astro 7 is recent enough that some guidance found online will describe older versions.

### Option 2: Next.js 16 App Router, server rendered, on Vercel

The maintainer's home ground. React Server Components render the pages, server actions handle the form natively, and Vercel's integration with Next.js is the tightest in the industry.

**Pros**:
- Fastest path to a working site for this specific developer, with no learning cost.
- The form needs no separate thinking. A server action is part of the framework.
- Largest community and the easiest stack to hand to another developer.
- If the site ever grows into an application, nothing needs replacing.

**Cons**:
- Even a page with no interactivity ships a React runtime, so the Core Web Vitals target in feature 12 becomes deliberate work rather than the default.
- Vercel's free tier is, to the best of my knowledge, restricted to non commercial projects, and a company's marketing site is commercial. This could not be confirmed during the landscape check, so it is a cost risk rather than a certainty.
- Free tier functions typically run in one fixed region, which for a Vietnamese audience is likely to be the wrong side of the planet.
- The heaviest tool on this list for seven static pages, with a correspondingly larger dependency surface to keep patched.

### Option 3: Next.js 16 static export, on Cloudflare

Next.js in static export mode, producing plain HTML files, hosted on Cloudflare alongside a separate Worker for the form.

**Pros**:
- Keeps the maintainer on familiar ground while getting Cloudflare's regional reach and free tier.
- Avoids the Vercel commercial licensing question entirely.

**Cons**:
- Static export disables a meaningful slice of what makes Next.js worth using, including the image optimisation component in its normal form, so feature 12 loses its easiest answer.
- Still ships the React runtime on every page, so the performance cost of option 2 remains without option 2's compensating conveniences.
- The form Worker lives outside the Next.js project, so there are two things to build and deploy instead of one.
- The worst of both worlds: the weight of a full application framework with the capability of a static generator.

### Option 4: A non React static generator such as Eleventy or Hugo, on Cloudflare

Templates compile to HTML with no client framework anywhere. The lightest possible result.

**Pros**:
- Genuinely the fastest and smallest output, with the smallest dependency surface to maintain.
- Extremely stable. A site built this way needs almost no upkeep.

**Cons**:
- Throws away the maintainer's React fluency entirely, so the contact form's validation and error states get written by hand in an unfamiliar template language.
- No typed content validation without building it, which weakens feature 3.
- Astro delivers most of the same output weight while keeping React available where it actually helps, so the tradeoff buys little.

## Rationale

Speed and regional reach are the two forces from Context that the maintainer cannot fix later by working harder, and they select option 1 together.

The Core Web Vitals target in feature 12 is the sharper of the two. Under option 2 or 3 that target is a project: you audit what React ships, you prune it, and you keep pruning as the site grows, because the framework's floor sits above zero on every page. Under option 1 the floor is zero and you only pay for the components you deliberately make interactive. For a site whose entire purpose is to be found and read quickly, buying the floor is worth more than buying the familiarity, and the gap is largest on exactly the mid range mobile the target names.

Cloudflare follows from the audience. Visitors in Vietnam and nearby are served from a network with presence in the region, which the landscape check confirmed carries unlimited bandwidth and free custom domains. Vercel's free tier could not be confirmed as permitting commercial use and its free functions are typically pinned to one region, both of which cut against a commercial site aimed at Southeast Asia. Netlify's reduction to 100 free build minutes a month is a real constraint on a site rebuilt on every content edit. GitHub Pages cannot host the form function at all.

**The engineer's stated comfort is React, Next.js, and TypeScript, and option 1 moves away from Next.js.** That preference is real and the cost is real: a slower first week, and unfamiliar boundaries to learn. It is worth paying here because the React knowledge transfers almost completely (Astro mounts React components directly, and the contact form is written as one), while the performance floor does not transfer in the other direction. If the first week proves more painful than expected, option 2 remains a defensible fallback, and the tradeoff to accept consciously is that feature 12 then becomes real engineering work rather than configuration.

Splitting the interactive work is the one place this design deliberately accepts inconsistency. The nav dropdown, mobile menu, and stats counter appear on pages every visitor loads; writing them as plain scripts keeps those pages at the zero floor that justified choosing Astro at all. The contact form has genuine state and inline validation, appears on one page, and is where React earns its weight. Making everything React would quietly undo the reason for the framework choice; making everything plain scripts would make the form tedious to maintain by hand.

Content collections with schema validation, rather than plain TypeScript files, buy one specific thing worth having: a broken content entry fails the build instead of reaching a visitor. On a site where the whole point is that content lives in data rather than in components, that guarantee is the difference between a typo being caught in seconds and a client seeing an empty heading.

The language routing is configured now with a single locale and no prefix on the default. This costs nothing today, keeps the clean URLs the scope specifies, and means the eventual second language adds a prefix to itself rather than moving every existing URL. Given that URL churn is the one genuinely expensive mistake available here, as the premise note argues, paying zero now to avoid it is obviously right.

## References

**Project sources** (verifiable, in this repo):
- `docs/scope/scope.md`: the seven routes, the Core Web Vitals target in feature 12, the language key requirement in feature 3, the Skateboard build approach, and the note that this spec may settle hosting for feature 14
- No `AGENTS.md` exists yet; feature 2 creates it from the real scaffold

**Practices and standards**:
- Prerendering content at build time rather than rendering per request, the default for sites whose content changes only when a developer changes it
- Islands architecture: ship framework code only for the components that need it, not for the page that contains them
- Schema validation of content at build time, so malformed data fails the build rather than the page
- Avoiding URL churn on indexed pages: a path change costs the ranking it earned and needs a permanent redirect

**Links** (web verified during the landscape check on 2026-09-19):
- Astro: https://astro.build/
- Astro internationalization guide: https://docs.astro.build/en/guides/internationalization/
- Next.js docs: https://nextjs.org/docs
- Next.js internationalization guide: https://nextjs.org/docs/pages/guides/internationalization
- Tailwind CSS v4.1 release notes: https://tailwindcss.com/blog/tailwindcss-v4-1
- Cloudflare Pages: https://www.cloudflare.com/products/pages/
- React Router v8, absorbing Remix: https://remix.run/blog/react-router-v8
- Node.js downloads and release schedule: https://nodejs.org/en/download/current

## Evidence: landscape scan, 2026-09-19

A read only web check run during the design conversation, before any option was presented. Recorded here so a future reader knows what was true when this was decided, and what was not confirmed.

**Confirmed:**

| Item | State on 2026-09-19 |
|---|---|
| Next.js | 16.3.5. Server Components are the default, App Router is production ready |
| Astro | 7.3. Zero JavaScript by default, positioned as the default for content driven sites |
| React Router | 8.0, released June 2026. Remix merged into it. Positioned for applications, not content routing |
| Tailwind CSS | 4.1, April 2025. The v4 major brought much faster builds, cascade layers, and modern CSS only, requiring Safari 16.4 or newer |
| CSS in JS | Materially diminished in relevance. CSS Modules and plain CSS remain active |
| Cloudflare Pages | Free tier: unlimited sites, unlimited bandwidth, free custom domains |
| Netlify | Free tier cut to 100 build minutes a month, down from 300 in 2025. Free custom domains |
| Astro i18n | Built in since v4.0: browser detection, localised URLs, fallback strategies |
| Next.js i18n | Built in routing since v10.0, plus next-intl, next-translate, lingui, react-i18next |
| Node.js | 24.21.0 is the current LTS as of September 2026. Node 26 enters LTS in October 2026 under a new schedule of one release a year, all becoming LTS |

**Not confirmed within the check's budget**, so anything this spec says about these rests on memory and should be verified before it costs money:

- Vercel's current free tier terms, including the commercial use restriction this spec cites as a risk, and its bandwidth allowance
- Netlify's custom domain and bandwidth terms beyond the build minute figure
- GitHub Pages free tier terms
- TanStack Start's current version and maturity
- Exact release dates for Next.js 16.3.5 and Astro 7.3

## Evidence: Agent Skill and MCP discovery, 2026-09-19

A read only registry and web check for the tools this decision chose. Install counts and publishers as reported by the check; treat them as indicative, not audited.

| Technology | Agent Skill candidates | Official MCP server |
|---|---|---|
| Astro | `astrolicious/agent-skills@astro` | `https://mcp.docs.astro.build/` (docs access) |
| Tailwind CSS v4 | `lombiq/tailwind-agent-skills@tailwind-4-docs`, `heygen-com/hyperframes@tailwind` | none found |
| React | `vercel-labs/agent-skills@vercel-react-best-practices` | none found |
| Zod | `pproenca/dot-skills@zod` | none found |
| Cloudflare and Wrangler | `cloudflare/skills@cloudflare`, `cloudflare/skills@wrangler`, `cloudflare/skills@workers-best-practices` | `github.com/cloudflare/mcp-server-cloudflare` |
| Resend | `resend/resend-skills@resend` | `github.com/resend/resend-mcp`, remote at `https://mcp.resend.com/mcp` |
| pnpm | `antfu/skills@pnpm` | `@jixo/mcp-pnpm` (community) |
