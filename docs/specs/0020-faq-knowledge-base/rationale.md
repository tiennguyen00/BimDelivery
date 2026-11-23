# 0020. FAQ knowledge base: decision record

## Context

BIM Delivery sells offshore BIM work to developers and city planners in five markets (the United States, Australia, the European Union, Canada, and Japan). Each market asks different questions before it trusts an offshore team: units and LOD specs in the US, ISO 19650 and council approvals in Australia, GDPR and OpenBIM in the EU, metric and imperial and French in Canada, MLIT rules and Japanese speaking coordinators in Japan. The engineer has 50 sample questions and answers, ten per market, and wants them on the site, styled like a software help center and marked up for search engines.

The forces:
- **Five audiences, one site.** A Japanese developer should not wade through US code questions, and a salesperson should be able to send one link per market.
- **The rules in `AGENTS.md`.** Every page prerenders, content comes from checked collections, and no JavaScript ships by default (plain scripts may enhance finished markup; React is for the contact form only). Nothing may hide content waiting for a script.
- **Content will change.** The answers are a first draft; the client will rewrite them, and later edit them in Sanity (spec 0019). Links to single questions must survive a reworded question.
- **Schema markup was asked for.** Google only accepts FAQ markup that matches answers visible on the same page, and since 2023 shows FAQ rich results only for well known government and health sites, so the markup's value here is in other engines and AI tools, not in Google's expandable result.
- **Small team, Skateboard approach.** One developer with AI help; the smallest usable whole first.

## Options considered

### Option 1: Hub plus one page per region (chosen)

`/faq` with search and region cards; `/faq/<country>` per region from one template.

**Pros**:
- A title, description, and schema per market; one shareable link per market.
- Each page stays short (ten questions), and the schema per page stays honest (only the answers that page shows).
- The help center pattern visitors already know.

**Cons**:
- Six routes instead of one; search must cross pages, so the hub needs its own index of every question.
- A visitor comparing markets clicks between pages.

### Option 2: One long page with a sticky region sidebar

All 50 questions on `/faq`, five sections, the sidebar jumping between them.

**Pros**:
- One route, one schema block, in page search with no cross page links.
- The fewest files.

**Cons**:
- One title and description for five markets; no per market page to send or rank.
- A very long page, and the schema lists 50 questions.

### Option 3: One page with region tabs

All 50 questions in the HTML, a script showing one region at a time.

**Pros**:
- Feels compact; one route.

**Cons**:
- Tabs are a script feature: without JavaScript every region shows at once, so the no script page is Option 2 anyway.
- Same single title problem as Option 2, plus a tab script to build and make accessible.

Sub decisions, each settled with the engineer:
- **Search**: a plain filter script (chosen) over no search (the knowledge base feel was asked for) and Pagefind (a static search index; real ranking, but a new dependency and build step for 50 entries).
- **Question look**: a quiet list where several can be open (chosen) over today's brass bars, one open at a time (ten stacked brass bars are loud, and readers compare answers), and every answer shown (easiest to read, but the longest page and no knowledge base feel).
- **Content source**: YAML now (chosen) over Sanity now (spec 0019's publish pipeline is unfinished, and spec 0019 AC-15 keeps every page outside projects in YAML until its own slice).

## Rationale

Five markets with different worries is the force that decides this: per market pages give each audience a short, relevant page, a title written for that market, and a link sales can send, and they keep each page's FAQ schema to the ten answers it actually shows. Option 2 is simpler, but it gives one title to five audiences and a 50 question page, and Option 3 collapses into Option 2 without JavaScript.

The cost of Option 1 is that search has to cross pages. With 50 questions, a prerendered hidden list on the hub and a 60 line plain script cover it with no dependency, in keeping with the zero JavaScript default: with the script gone, the cards and pages still work and only the search box is missing. Explicit question ids exist because the content is a draft; ids derived from question text would break every shared link the first time the client rewords a question.

The schema is worth adding even though Google limits the FAQ rich result: it costs a pure function and a `head` slot, other engines and AI tools read it, and the `BreadcrumbList` and the `site` setting are groundwork feature 11 needs anyway.
