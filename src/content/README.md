# Content entries

Every word and image on the site lives here (spec 0002). One folder per
collection, one folder per language inside it:
`src/content/<collection>/<lang>/<file>`. The schemas are in
`src/content.config.ts`; pages read content only through `src/lib/content.ts`.

- Every entry has a `lang` field equal to its language folder.
- Image paths are relative to the entry file, for example
  `../../../assets/images/services/scan-to-bim.jpg`. Record every new stock
  photo in `src/assets/images/CREDITS.md`.
- Every image needs a non empty `alt`, or `decorative: true`.
- A project points to its service by id: `service: en/architectural-bim`.
- A service is one YAML file built from ordered sections. See the recipes
  under Services below.
- A broken entry fails `pnpm build` with a message naming the file.

## Services

Each service is one YAML file, `services/<lang>/<slug>.yaml` (spec 0013).
Its `sections` list is the page, top to bottom. Every section is a block with
a `type`, what it holds, and a `layout`, the design that draws it. The build
checks every file and names the file and the field when something is wrong.

### Edit a service's words or photos

1. Open its file and change the text. `**phrase**` makes a phrase bold and
   `==phrase==` makes it the brass accent. A block's `surface` is `stripe` or
   `dots`, the pattern it sits on.
2. The photos are the intro's `images`: one to three Pexels links, the first
   shown first. Add each new photo to `src/assets/images/CREDITS.md`.

### Reorder, add, remove, or repeat a section

1. Move a block within `sections` to move its band, delete it to remove the
   band, or copy it to repeat the band.
2. Keep the two rules: exactly one `intro`, and it stays first; at most one
   `presence`.
3. Only that service's page changes.

### Give one service its own presence

1. Add `content` to its `presence` block, with every field `home.presence`
   has in `home/<lang>/home.yaml`: `heading`, `paragraphs`, `locations`, `legend`, and
   `whyChoose`. It is all or nothing.
2. Only that page shows it. Delete `content` to go back to the shared copy.
3. Remember that a company wide region change then needs this file edited
   too.

### Give one service a new look

A look only one service wants is a new layout, never an edit to a shared band
component, so the other services stay exactly as they are.

1. Record the layout in spec 0013's block table (`/architect service pages`).
2. Add its strict schema in `src/content.config.ts`. When a type gains its
   second layout, that type becomes a union on `layout`, as `features` is.
3. Add a component in `src/components/service/`, named for its key, for
   example `AudiencesList.astro` for `audiences/list`.
4. Add the key to `bands` in `src/pages/[service].astro` and to
   `BAND_BACKGROUND` in `src/lib/service-page.ts`. `pnpm check` names
   whichever is still missing.
5. Set `layout` on the block in that one service's file.

### Add a new kind of section

Follow the steps for a new look, with a new `type` instead of a new layout:
record it, add its schema to the `block` union, then its component and its
two map entries. Its heading id (`<type>-heading`) comes from its type.

### Add a service

1. Copy a file in `services/<lang>/` to `<new-slug>.yaml`.
2. Give it a unique `slug` and `order`, then its own `title`, `summary`,
   `seo`, `subServices`, and sections.
3. Build. Its page exists at `/<slug>`, and it appears in the nav and in the
   contact form's choices, in `order`.
4. It is not on the home page until you add its id (`<lang>/<slug>`) to
   `services.featured` in `home/<lang>/home.yaml`, which lists one to three
   services.

### Remove a service

1. Delete its file.
2. Build. The build fails and names every file that still points at the
   service: each project whose `service` is its id, and `home.yaml` when
   `services.featured` lists it.
3. Point each of those projects at another service, and take the id out of
   `services.featured`. The build passes.
4. The removed page's old URL now serves the 404 page. Redirects are a follow
   up.

### Check copy that counts the services

No code counts the services, but some copy does: the home services intro in
`home/<lang>/home.yaml` says "Three core services". Update it whenever the
number of services changes.
