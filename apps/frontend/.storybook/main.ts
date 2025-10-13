import type { StorybookConfig } from '@storybook/react-webpack5';

import { join, dirname } from "path"

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding')
  ],
  "framework": {
    "name": getAbsolutePath('@storybook/react-webpack5'),
    "options": {}
  },
  webpackFinal: async (config) => {
    // Add PostCSS support for Tailwind
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    const cssRule = config.module.rules.find(
      (rule) => rule && typeof rule === 'object' && rule.test && rule.test.toString().includes('css')
    );

    if (cssRule && typeof cssRule === 'object' && Array.isArray(cssRule.use)) {
      const postCssLoader = cssRule.use.find(
        (loader) => typeof loader === 'object' && loader.loader && loader.loader.includes('postcss-loader')
      );

      if (postCssLoader && typeof postCssLoader === 'object') {
        postCssLoader.options = {
          postcssOptions: {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            plugins: [
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require('tailwindcss'),
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require('autoprefixer'),
            ],
          },
        };
      }
    }

    return config;
  }
};
export default config;