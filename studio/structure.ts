import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureResolver } from 'sanity/structure';

/**
 * The Studio's one list: Projects, in the site's order, reordered by drag
 * and drop (spec 0019). A reorder writes the published documents directly,
 * so it goes live at once, with no draft step. `previewRequest` is not
 * listed anywhere.
 */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),
    ]);
