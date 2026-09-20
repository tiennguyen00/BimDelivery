/**
 * The one place that calls every getter in `content.ts`, once per build.
 *
 * Why this exists: the cross entry checks in `content.ts` (unique slugs and
 * orders, matching language folders, reserved paths, a project pointing at a
 * real service in its own language) only run when the getter that owns them is
 * actually called. Until features 6 to 10 land, several getters have no page
 * reading them, so a broken content file would sail through the build and
 * surface much later, in the feature that finally reads it.
 *
 * `PageLayout.astro` imports this module, so every page pulls it in. A module
 * body runs once however many times it is imported, which is what makes this
 * one call site rather than one per page.
 *
 * It exists to throw. Nothing reads the result, and that is not a mistake: the
 * value of the call is the checking it does on the way.
 *
 * When a real page takes a getter over, drop it from this list. When the list
 * is empty, delete the file.
 */
import { LOCALES } from '../i18n/locales';
import {
  getAboutPage,
  getContactPage,
  getHomePage,
  getNavigation,
  getNotFoundPage,
  getProjectPage,
  getProjects,
  getServices,
  getSettings,
  getStats,
} from './content';

await Promise.all(
  LOCALES.flatMap((lang) => [
    getSettings(lang),
    getNavigation(lang),
    getStats(lang),
    getHomePage(lang),
    getAboutPage(lang),
    getContactPage(lang),
    getProjectPage(lang),
    getNotFoundPage(lang),
    getServices(lang),
    getProjects(lang),
  ]),
);
