import { useToast } from '@sanity/ui/toast';
import { useState } from 'react';
import { useClient, type DocumentActionComponent } from 'sanity';
import { API_VERSION, DEV_LINK } from '../project';

/** Where the editor looks: the project's page on the dev link, else `/project`. */
const previewAddress = (slug: string | undefined): string =>
  slug ? `${DEV_LINK}/project/${slug}` : `${DEV_LINK}/project`;

/**
 * "Preview on site" on a project (spec 0019, AC-5). It rewrites the hidden,
 * published `previewRequest` document, whose change the `site-build`
 * webhook turns into a preview build of the dev link with every current
 * draft. Then it tells the editor where to look and how long to wait.
 * Production is untouched, and a newer request cancels a running one.
 */
export const PreviewOnSiteAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const document = props.draft ?? props.published;
  const slug = (document?.slug as { current?: string } | undefined)?.current;
  const address = previewAddress(slug);

  return {
    label: busy ? 'Starting preview…' : 'Preview on site',
    title:
      'Rebuild the dev link with every draft, so you can check this page before you publish.',
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      try {
        await client.createOrReplace({
          _id: 'previewRequest',
          _type: 'previewRequest',
          requestedAt: new Date().toISOString(),
        });
        toast.push({
          status: 'success',
          title: 'Preview started, ready in about 3 minutes',
          description: (
            <a href={address} target="_blank" rel="noreferrer">
              {address}
            </a>
          ),
          duration: 30000,
          closable: true,
        });
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'The preview could not start',
          description: error instanceof Error ? error.message : String(error),
          closable: true,
        });
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};
