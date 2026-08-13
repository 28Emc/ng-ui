import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'ng-ui · Component Library',
    brandUrl: 'https://github.com/28Emc/ng-ui',
    colorPrimary: '#15a18b',
    colorSecondary: '#0c8b7c',
    fontBase: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontCode: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  }),
});
