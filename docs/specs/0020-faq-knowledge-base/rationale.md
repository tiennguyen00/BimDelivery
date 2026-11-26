# 0020. FAQ, one page: decision record

## Context

BIM Delivery sells offshore BIM work to developers, architects, and studios abroad. Before they trust an offshore team they ask the same handful of things: will it cut rework, will the models hold up for takeoffs, will it follow our standards, can it scale, is our data safe, and can we try it first. The client wrote eight questions and answers on exactly these, and the engineer drew a mockup of the page they belong on.

The forces:
- **One audience, one short list.** Eight questions read in one scroll; nothing needs grouping.
- **The rules in `AGENTS.md`.** Every page prerenders, content comes from checked collections, and no JavaScript ships by default (plain scripts may enhance finished markup; React is for the contact form only). Nothing may hide content waiting for a script.
- **Content will change.** The client will reword answers, and later edit them in Sanity (spec 0019). Links to single questions must survive a reworded question.
- **The design system.** Brass words never sit on a photo (the accent role rule in `docs/design.md`), and the mockup puts the title's second line in brass.

## History

The first version of this spec (2026-11-23) chose a hub plus one page per market (United States, Australia, European Union, Canada, Japan), with 50 sample questions written per market, region cards, a region nav, a breadcrumb, and a search that crossed pages. It shipped on 2026-11-24. On 2026-11-26 the engineer replaced it: the client's own eight questions are not split by market, and the mockup is one simple page. The spec was rewritten in place at the engineer's request rather than superseded.

## Options considered

### Option 1: One page after the mockup (chosen)

Hero, search, the eight questions as boxes, a slim closing band.

**Pros**:
- Matches the mockup and the content: eight questions need no navigation.
- One title, one link, one honest schema listing every answer the page shows.
- Fewer files than before: one collection, two components, one route.

**Cons**:
- No per market pages; if the client later writes market specific answers, this decision reopens.

### Option 2: Keep the hub and put the eight questions on it

The 2026-11-23 structure with the new content.

**Pros**:
- Room to grow by market.

**Cons**:
- Region pages with nothing market specific to say; a hub, cards, and a region nav around eight questions; not what the mockup shows.

## Rationale

The content decides it: eight questions for every visitor do not need a hub, cards, or a sidebar, and the mockup asks for one page. The search and the linked question script carry over unchanged in spirit, now filtering in place, so a visitor with one worry still narrows the list as they type and a salesperson can still send `/faq#<id>`.

The hero keeps the brass second line legal by never putting words on the photo: beside it from `lg`, under it below `lg`. The questions became boxes because the mockup draws them that way; the `Accordion`'s `list` look had no other user, so it was restyled rather than joined by a third look. The closing band gained an `inline` layout instead of a FAQ only copy, so the accent band's rules (the `on-accent` words, the two colour ring) stay in one component.

The old region addresses had been live two days, long enough to be crawled, so they redirect to `/faq` with a 301 rather than ending on the 404 page.
