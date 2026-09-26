# Image credits

Every image the site uses, with its source and licence. Add a line here
whenever you add one.

## Photos (internet links, spec 0006)

No photo lives in this folder. Each one is an `https` link on
`images.pexels.com`, written in its content entry. Astro downloads it at build,
optimises it, and serves the copies from this site's own domain.

All photos come from Pexels and are covered by the
[Pexels License](https://www.pexels.com/license/): free for commercial use, no
permission needed, and no attribution required on the site. They are
placeholders until real project photography arrives.

| Used for                   | Pexels photo                                                                                                               | Licence        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Home hero                  | <https://www.pexels.com/photo/brown-and-black-house-miniature-3961750/>                                                    | Pexels License |
| Home hero, photo 2         | <https://www.pexels.com/photo/31405835/>                                                                                   | Pexels License |
| Home overview              | <https://www.pexels.com/photo/three-people-collaborating-on-a-project-6615107/>                                            | Pexels License |
| About                      | <https://www.pexels.com/photo/professional-individuals-working-together-5582590/>                                          | Pexels License |
| Service: Revit Modeling    | <https://www.pexels.com/photo/men-sitting-at-a-table-and-looking-at-a-laptop-displaying-a-3d-project-of-a-house-15764095/> | Pexels License |
| Revit Modeling, photo 2    | <https://www.pexels.com/photo/architect-working-on-a-computer-15764116/>                                                   | Pexels License |
| Revit Modeling, photo 3    | <https://www.pexels.com/photo/top-view-of-an-architect-sitting-at-a-desk-and-creating-a-project-9618456/>                  | Pexels License |
| Service: Scan to BIM       | <https://www.pexels.com/photo/a-man-surveying-the-area-5802822/>                                                           | Pexels License |
| Scan to BIM, photo 2       | <https://www.pexels.com/photo/gray-concrete-building-interior-236709/>                                                     | Pexels License |
| Service: BIM Coordination  | <https://www.pexels.com/photo/metal-beams-in-a-construction-site-3818947/>                                                 | Pexels License |
| BIM Coordination, photo 2  | <https://www.pexels.com/photo/two-man-holding-white-paper-1216589/>                                                        | Pexels License |
| BIM Coordination, photo 3  | <https://www.pexels.com/photo/engineers-looking-at-blueprint-3862135/>                                                     | Pexels License |
| Project: Harbour Tower     | <https://www.pexels.com/photo/facade-of-architectural-glass-building-8171870/>                                             | Pexels License |
| Project: Riverside Offices | <https://www.pexels.com/photo/modern-building-with-a-glass-facade-reflecting-other-buildings-in-city-9321327/>             | Pexels License |
| Project: Midtown Retrofit  | <https://www.pexels.com/photo/modern-high-rise-construction-site-with-crane-33628380/>                                     | Pexels License |
| Project: Corner Block      | <https://www.pexels.com/photo/stylish-geometric-building-with-glass-balconies-4082527/>                                    | Pexels License |
| Project: College Hall      | <https://www.pexels.com/photo/modern-office-building-17097090/>                                                            | Pexels License |
| Contact intro              | <https://www.pexels.com/photo/323705/>                                                                                     | Pexels License |
| Contact form band          | <https://www.pexels.com/photo/2138126/>                                                                                    | Pexels License |

## Icons copied from open licence sets (spec 0013)

The service pages' glyphs are copied into the fixed map in
`src/components/ui/Icon.astro`, each with a comment naming its source. No
icon package is installed; only the path data is copied.

- [Tabler Icons](https://tabler.io/icons) 3.48.0, MIT licence, © Paweł Kuna.
  Outline: `map` (as `blueprint`), `crane`, `home-check` (as
  `building-check`), `scan-cube` (as `scan`), `clipboard-check`, `ruler`,
  `layers-intersect` (as `clash`), `stack-2` (as `layers`), `messages`.
  Filled: `user`.
- [Material Icons](https://fonts.google.com/icons) by Google, filled,
  Apache License 2.0, where Tabler has no solid match: `co_present` (as
  `presenter`), `architecture` (as `compass`), `engineering` (as
  `hard-hat`), `manage_accounts` (as `users-gear`).

## Generated from public domain data

- `home/world-map.svg` (the home presence band, spec 0005): a dotted world
  map drawn from [Natural Earth](https://www.naturalearthdata.com/) 1:50m land
  data, which is public domain, via the `world-atlas` package (ISC). It was
  generated once on a 2 degree grid, latitude 84 to minus 56, and is not
  rebuilt at build time.

## Generated placeholders (no licence needed)

These are simple SVGs made for this project. They are not real brand marks or
certification body marks, and must be replaced before launch.

- `brand/logo.svg`
- `badges/badge-quality.svg`
- `badges/badge-bim.svg`
- `badges/badge-security.svg`

## Placeholders to replace before launch

These files are copied from another company's site. Their licence is unknown,
so they must not reach launch. Replace each one with an image the company owns
or licenses, then move its line to the right section above.

- `services/service-illustration.png` (the home service cards, spec 0005):
  <https://paviliusbim.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-30-2026-04_57_23-PM-Photoroom.png>,
  licence unknown, copied from the reference site.
