// @ts-check
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Generated output, local state, and vendored agent skills.
  // The Studio's and the relay Worker's build output and generated types too
  // (spec 0019); their source is linted like the site's.
  globalIgnores([
    'dist/',
    '.astro/',
    '.wrangler/',
    '.agents/',
    '.claude/',
    'studio/dist/',
    'studio/.sanity/',
    'workers/*/.wrangler/',
    'workers/*/worker-configuration.d.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: {
      // Build time code runs on Node; the deployed Worker and the plain
      // browser scripts get narrower globals once those files exist.
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // AGENTS.md Rules: immutable data, never mutate props or entries.
      'prefer-const': 'error',
      'no-var': 'error',
      'no-param-reassign': ['error', { props: true }],
    },
  },
  // Last, so formatting is Prettier's job alone.
  prettier,
);
