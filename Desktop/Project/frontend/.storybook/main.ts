import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Serves mockServiceWorker.js (msw-storybook-addon) for auth stories. Kept
  // out of src/public so the production app build never ships it — Storybook
  // is the only consumer of the MSW browser worker.
  staticDirs: ['./public'],
};

export default config;
