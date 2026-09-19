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
- A project points to its service by id: `service: en/revit-modeling`.
- A new service is one Markdown file in `services/<lang>/` with a unique `slug`
  and `order`. It appears in the nav and on the home page with no code change.
- A broken entry fails `pnpm build` with a message naming the file.
