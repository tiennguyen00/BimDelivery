# Sanity and GitHub Actions discovery (2026-10-25)

Read-only run. Nothing installed. CLI searches 6/6, web 3/4.

## Agent Skills: Sanity (sanity-io/agent-toolkit, official; `--list` confirmed 10 skills)
- Install all: `npx skills add sanity-io/agent-toolkit` (one skill: add `--skill <name>`)
- sanity-best-practices: schema, GROQ, TypeGen, Visual Editing, images, Portable Text, Astro integration. Most relevant (31.6K installs).
- portable-text-serialization: render Portable Text in Astro, HTML, or Markdown.
- content-modeling-best-practices: schema design, references vs embedded objects.
- seo-aeo-best-practices: metadata, sitemaps, JSON-LD.
- sanity-singletons: fixed-id documents (settings, nav, footer).
- sanity-migration, portable-text-conversion: moving content in from other CMSes, HTML, or Markdown.
- Lower relevance: sanity-studio-upgrade, content-experimentation-best-practices, sanity-form-component-suspense.
- Not recommended: mindrally/skills@sanity (723 installs, third party, not inspected).

## Agent Skills: GitHub Actions (CLI find only, unless marked)
- github/awesome-copilot@create-github-action-workflow-specification (`--list` confirmed): writes a spec for an existing workflow. Not a deploy skill.
- Unconfirmed, scope unverified: wshobson/agents@github-actions-templates (17.4K), callstackincubator/agent-skills@github-actions (10.9K), github/awesome-copilot@github-actions-hardening (2.2K) and -efficiency (2K). Check before install.
- Nothing verified for `wrangler deploy` specifically. The installed cloudflare and wrangler skills cover wrangler.

## MCP: Sanity official remote server (sanity.io docs, fetched)
- URL: `https://mcp.sanity.io`, HTTP transport, hosted by Sanity. Auth: OAuth by default, or an `Authorization: Bearer <token>` header, which turns OAuth off.
- Connect: `claude mcp add Sanity -t http https://mcp.sanity.io --scope user`, or `npx sanity@latest mcp configure`.
- Does: query_documents (GROQ), get/create/patch/publish documents, get_schema, deploy_schema, deploy_studio, releases, datasets, CORS, asset upload, search_docs.
- Writes production content. Prefer OAuth, and keep tokens out of the repo.
- The local @sanity/mcp-server is deprecated, per a search snippet of sanity-io/sanity-mcp-server (not fetched).
- Sanity Context MCP (api.sanity.io) is a separate, read-only server.

## Note
AGENTS.md says new layers need a spec first. Adopting a CMS is probably one, so run /architect before wiring Sanity in.
