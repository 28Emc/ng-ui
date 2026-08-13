import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../projects/ng-ui/src/lib/**/*.stories.ts', '../projects/ng-ui/src/lib/**/*.mdx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      tsconfig: '.storybook/compodoc.tsconfig.json',
    },
  },
  docs: {
    defaultName: 'Documentation',
  },
  globalTypes: {
    theme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default config;
