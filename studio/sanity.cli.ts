import { defineCliConfig } from 'sanity/cli';
import { DATASET, PROJECT_ID } from './project';

export default defineCliConfig({
  api: { projectId: PROJECT_ID, dataset: DATASET },
  // The Studio's address, https://bimdelivery.sanity.studio, chosen at the
  // first `sanity deploy`.
  studioHost: 'bimdelivery',
  // Versions are pinned in package.json and move only with a commit, so the
  // Studio and the site's schema never drift apart on their own.
  // `appId` names the deployed Studio, so `studio.yml` never stops to ask.
  deployment: { appId: 'wogyphghs8at5j5xsx9za5im', autoUpdates: false },
});
