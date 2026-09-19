# Content entries

Content collection entries (JSON or YAML) live here, validated by Zod schemas
at build time so a malformed entry fails the build instead of reaching a
visitor.

Two notes for whoever builds feature 3 (Content model):

- In current Astro the collection **config** file lives at `src/content.config.ts`
  (project root of `src/`), not inside this folder. This folder holds the data.
- Every entry carries a required language field from the first entry, even
  while English is the only locale (spec 0001).

Nothing is defined yet on purpose. Feature 3 designs the actual fields.
