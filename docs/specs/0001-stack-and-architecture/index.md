# 0001. Adopt a prerendered Astro site on Cloudflare

**Date**: 2026-09-19
**Status**: In Progress
**Scope feature**: 1, Stack and architecture (`docs/scope/scope.md`)

## Summary

The site will be built with Astro 7, which turns every page into a plain HTML file when you build, so search engines read the text immediately and visitors download almost no JavaScript. Tailwind CSS v4 handles styling, content lives in typed data files checked against a schema at build, and the whole thing is hosted on Cloudflare, whose network reaches Vietnam directly and which can also run the small piece of server code the contact form will need later. The nav and the mobile menu are written as plain scripts so the pages everyone loads stay light, and only the contact form becomes a React component.

The tradeoff worth knowing: Astro is new to you, so the first week will be slower than Next.js would have been. What you buy is that the Core Web Vitals target in feature 12 becomes mostly configuration instead of ongoing work.

## Decision

**Chosen option**: Option 1: Astro 7, fully prerendered, with React islands, on Cloudflare.

Build the site as a fully prerendered Astro 7 project in TypeScript, styled with Tailwind CSS v4, with content in Astro content collections validated by Zod, deployed to Cloudflare Workers and Pages from a private GitHub repository, with the contact form's future delivery endpoint running as an on demand route on the same platform.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.claude/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.claude/skills/tailwind-4-docs/`) · `cloudflare` (`cloudflare/skills`, `.claude/skills/cloudflare/`) · `wrangler` (`cloudflare/skills`, `.claude/skills/wrangler/`) · `workers-best-practices` (`cloudflare/skills`, `.claude/skills/workers-best-practices/`) · `zod` (`pproenca/dot-skills`, `.claude/skills/zod/`) · `pnpm` (`antfu/skills`, `.claude/skills/pnpm/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.claude/skills/vercel-react-best-practices/`) · `resend` (`resend/resend-skills`, `.claude/skills/resend/`)

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict mode | Already the maintainer's stack, and it catches mismatched content and component props before a page renders |
| Framework | Astro 7 | Prerenders to plain HTML and ships no JavaScript unless a component explicitly asks for it |
| Rendering | Every page route prerendered at build; only the contact form endpoint runs on demand. See the rendering invariant below, which is not optional | Content changes only when a developer changes it, so rendering per request would buy nothing and cost latency |
| Routing | File based. The three service pages are one dynamic route generating static pages from the service collection, not three route files | Adding a fourth service becomes a content entry alone, with no new route file, which is what feature 8 asks for |
| Service URLs | Descriptive slugs carried as a required `slug` field on each service entry, for example `/revit-modeling`, not `/service-1` | The path itself tells a search engine what the page is. Decided before any page exists, because changing an indexed URL costs the ranking it earned. The three actual slug values are set in feature 3 when the services are named |
| Interactive parts | Plain scripts for the nav dropdown, mobile menu, and stats counter; a React 19 island for the contact form | Keeps every page a visitor loads at the zero JavaScript floor, and spends React only where real state and validation live |
| Styling | Tailwind CSS v4 | Feature 4's type scale, colour, and spacing become tokens in one place, and unused CSS cannot accumulate |
| Content store | Astro content collections, JSON or YAML entries validated by Zod schemas | A malformed entry fails the build rather than reaching a visitor. Feature 3 designs the actual fields |
| Database | None | Nothing on the site is created by a visitor except a contact message, and that is emailed rather than stored |
| Images | In the repository under `src/assets/`, optimised by Astro at build | Correctly sized modern formats with dimensions baked in, at no runtime cost and no monthly bill. Placeholder files live in the same place so swapping in real photography is a file replacement |
| Internationalization | Astro's built in i18n: `defaultLocale: 'en'`, `locales: ['en']`, `prefixDefaultLocale: false` | Keeps today's URLs clean while making a second language a configuration and content change rather than a URL migration |
| Server code | Cloudflare Workers, through Astro's Cloudflare adapter, with the form endpoint opting out of prerendering | One project, one deploy, one repository, and the form endpoint runs near the audience |
| Email delivery | Resend, or an equivalent transactional email API, called from that endpoint | Settled here so the stack supports it. Building the delivery path itself stays deferred as the scope has it |
| Hosting | Cloudflare Workers serving static assets, which is the product Pages has been consolidating into. One Worker serves the prerendered files and runs the single on demand route | Network presence in Vietnam and Singapore, unlimited bandwidth and free custom domains on the free tier, and one platform rather than a static host plus a separate function |
| DNS | Moved to Cloudflare | One place manages domain and hosting, certificates are automatic, and the bare domain works without workarounds |
| Source control and deploy | Private GitHub repository, Cloudflare builds on push to `main` | Automatic deploys, plus branch preview URLs for showing a client a page before it is live |
| Package manager | pnpm | Fast, strict about undeclared dependencies, supported by every host |
| Build and development runtime | Node 24 LTS, pinned | Current LTS today. Node 26 becomes LTS in October 2026; adopting it in its first month adds risk for no gain. This is what runs `astro build` locally and in Cloudflare's build step |
| Deployed runtime | `workerd`, Cloudflare's own runtime, with the `nodejs_compat` compatibility flag enabled | The deployed Worker is not Node and only has the Node APIs that flag provides. Code written against full Node will pass locally and fail once deployed, so the flag is set from the first deploy rather than discovered later |
| Observability | None at launch | Error monitoring is deferred in the scope. Cloudflare's own request logs are the fallback until then |
| Tests | None by default | The project runs at the Alpha workflow tier, where `/check verify` on the real site is the gate |

**Layers deliberately absent**: no authentication (there are no accounts), no cache layer (the pages are static files on a network that already caches them), no background jobs, no search, and no file storage. None of these should be added without a spec.

### Project conventions settled here

These are the finer setup calls. They are part of this decision so `/develop` does not have to invent them.

- **Adapter at scaffold time, not later.** Add the Cloudflare adapter when the project is created even though nothing needs server rendering yet. The cost is one dependency and a few config lines; the benefit is that the day the form endpoint lands it is a new file rather than a platform reconfiguration. The runner up, a pure static scaffold with the adapter added later, is cleaner today and more disruptive on the day it matters.
- **Folder shape**: `src/pages/` for routes, `src/layouts/`, `src/components/` for `.astro` components, `src/components/react/` for islands, `src/content/` with `content.config.ts` for collections, `src/assets/images/` for optimised images, `src/styles/`, and `public/` for files served untouched such as the favicon and `robots.txt`. Conventional Astro layout, so nothing here is invented.
- **Node version pinned twice**: `.nvmrc` and the `engines` field in `package.json`, with the same version set in Cloudflare's build configuration, so local and deployed builds cannot drift.
- **Secrets never in the repository.** The email API key and destination address are Cloudflare secrets set through Wrangler, mirrored locally in `.dev.vars`, which is git ignored. Read them through Astro's typed environment schema rather than raw environment access, so a missing key fails loudly at build rather than silently at runtime.
- **Every content entry carries a required language field** from the first entry, per the scope, even while English is the only locale.

### Rendering invariant

This is the load bearing claim of the whole decision, so it is written as a rule with a check rather than left to configuration.

**The rule**: every page route produces a real HTML file at build time. Exactly one route, the contact form endpoint, runs on demand. Nothing else may.

Astro reaches this by combining a default of prerendering with a per route opt out, but the exact configuration keys in version 7 must be read from the current documentation rather than assumed. The danger is specific and quiet: configure the project the other way round, with server rendering as the default and prerendering opted into per route, and every page starts rendering per request. The site still works, nothing errors, and the zero JavaScript performance floor that justified choosing Astro is silently gone. Nothing later in the build would visibly catch it.

**The check**, which does not depend on knowing the config keys: after the scaffold builds, look in `dist/` and confirm there is an HTML file for every page route. If the pages are not there as files, the configuration is wrong, whatever the config says. Re run this check after adding the Cloudflare adapter, since that is the change most likely to flip the default.

### Deploy configuration

Settled here so feature 14 can go straight to `/develop`, as the scope allows.

| Setting | Value |
|---|---|
| Product | Cloudflare Workers with static assets |
| Source | The private GitHub repository, building on push to `main` |
| Build command | `pnpm build` |
| Output directory | `dist/` |
| Node version | Pinned to the same Node 24 LTS as `.nvmrc`, set in the build configuration |
| `compatibility_date` | Set to the date the project is scaffolded, then left alone. Raising it later is a deliberate act, not a default |
| `compatibility_flags` | `nodejs_compat` |
| Preview deploys | On, so every branch gets a URL for showing a client a page before it is live |
| Custom domain | Attached once DNS moves to Cloudflare, per feature 14 |

### Contact form endpoint contract

Fixed now, although the delivery feature is deferred, so that feature 10 builds the form against the shape the real endpoint will have. Without this, Release 1's fake submit could be written as a native form post and then need rewriting when real delivery lands.

- **Path**: `POST /api/contact`
- **Request**: JSON. `name` (string, required), `email` (string, required, must be a valid address), `message` (string, required), `company` (string, optional).
- **Success response**: `200` with `{ "ok": true }`.
- **Validation failure**: `400` with `{ "ok": false, "errors": { "<field>": "<message>" } }`, so the form can attach each message to its own field and a screen reader announces it, which is what feature 10's criteria require.
- **Delivery failure**: `502` with `{ "ok": false, "error": "<message>" }`, kept distinct from a validation failure so the form can tell the visitor to try again rather than blaming their input.
- **In Release 1** the form submits through `fetch` to this path and the endpoint does not exist yet, so the form fakes the success response locally. The code says plainly that nothing is sent, per the scope. When delivery lands, only the endpoint's insides get written; the form does not change.
- The endpoint must not log message bodies. It is personal data and there is no reason to keep it.

### Configuration required

Not needed for the scaffold. Required when the contact form's delivery lands.

- `RESEND_API_KEY`: authenticates the transactional email call. A Cloudflare secret, never committed.
- `CONTACT_TO_EMAIL`: the inbox a submitted message is delivered to.

## Consequences

**Positive**:
- The Core Web Vitals target in feature 12 starts from the best possible baseline. Pages with no interactive component ship no framework code, so that feature becomes mostly configuration rather than an optimisation project.
- Feature 14, launch to a live URL, no longer needs its own spec. Hosting, DNS, and the deploy trigger are all settled here, so it can go straight to `/develop`.
- A broken content entry fails the build, so a missing headline or a wrong image path is caught in seconds rather than discovered by a client.
- Adding the second language later moves no existing URL, which protects whatever search ranking the site earns in the meantime.
- Hosting, bandwidth, custom domain, and the form's server code all sit inside one free tier on one platform, so there is no second vendor and no bill at this traffic level.
- Feature 15's analytics has an easy answer available: Cloudflare Web Analytics is free and sets no cookies, which also keeps the deferred cookie consent banner unnecessary. Feature 15 still owns that decision.

**Negative and tradeoffs**:
- Astro is new to the maintainer, whose stated comfort is Next.js. Expect a slower first week and some time learning where Astro's boundaries sit. This cost was accepted deliberately; see the Rationale.
- The codebase carries two idioms: plain scripts for most interactivity and React for the contact form. That is a real inconsistency, chosen so the pages every visitor loads stay light.
- The nav dropdown's keyboard behaviour, Escape handling, and touch support are now hand written rather than supplied by a component library. Feature 5 must carry those requirements explicitly, and they need real testing rather than assumption.
- **The rendering configuration is a sitewide risk, not just a form route detail.** Adding the Cloudflare adapter is the change most likely to flip the whole site from prerendered to rendered per request, and that failure is silent: no error, no broken page, just the loss of the performance floor this entire decision was made for. The rendering invariant above exists because of this, and its check has to actually be run, not assumed.
- Mild platform coupling to Cloudflare. The static site would move anywhere, but the adapter and the form endpoint are Cloudflare shaped, so changing host means reworking that endpoint.
- Content edits require a rebuild and a deploy. There is no way for a non technical person to change a word, which is fine today and becomes a limitation if the client ever wants that.
- Tailwind v4 is modern CSS only and needs Safari 16.4 or newer. Very old browsers degrade rather than render correctly.
- Fewer developers know Astro than Next.js, so handing this to someone else later draws from a smaller pool.

**Neutral**:
- Nine community skills were installed as part of this decision. They improve build guidance and cost a little context on every task. Prune any that prove noisy.
- This folder is not yet a git repository, so version control and the GitHub remote are the first setup step rather than an assumed starting point.
- The contact form will collect a name, an email address, and a message, which is personal data even at this small scale. Feature 13's privacy page needs to say what happens to it, and the delivery endpoint should not log message bodies.

## Follow-up

- [ ] **The scope still names the old service URLs.** Features 5 and 8 in `docs/scope/scope.md` hard code `/service-1`, `/service-2`, and `/service-3` in their done criteria, and this spec now specifies descriptive slugs instead. Run `/scope` to reconcile those two rows before building either of them. This spec owns the decision; `/architect` does not edit other features' contents.
- [ ] Verify Astro 7's current adapter configuration, i18n options, and content collection API against the real documentation at scaffold time, using the installed `astro` skill or the Astro documentation MCP server. My knowledge predates version 7, so treat every specific config key in this spec as a strong default to confirm, not as verified fact. The rendering invariant above is the one place where getting this wrong is expensive and silent, so check it there rather than trusting the configuration.
- [ ] Run `git init` and create the private GitHub repository. Nothing here is under version control yet.
- [ ] Connect the Astro documentation MCP server at `https://mcp.docs.astro.build/`, which closes the version gap above. Cloudflare's official server at `github.com/cloudflare/mcp-server-cloudflare` is worth connecting when you reach feature 14.
- [ ] No `AGENTS.md` exists yet, so none of the nine installed skills are recorded anywhere. Feature 2's `/audit` should capture them, together with the conventions from the real scaffold. Every one of them is project wide, so they belong in the root file.
- [ ] Verify Vercel's and Netlify's current free tier terms before ever reconsidering the host. The landscape check could not confirm them, and this spec's claim that Vercel's free tier excludes commercial use rests on memory alone.
- [ ] Feature 14 can skip `/architect` and go straight to `/develop launch`, per the scope's own note, since hosting and DNS are settled above.

## Rationale

Reasoning, the four full stacks weighed, the premise note on service URLs, the references, and the landscape scan evidence: see [rationale.md](rationale.md).
