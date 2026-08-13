import type { Preview } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import '../projects/ng-ui/styles.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      test: 'error',
    },
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
      viewports: [390, 768, 1280],
      diffThreshold: 0.3,
    },
  },
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
    (storyFn, context) => {
      const theme = (context.globals as { theme?: string }).theme;
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return storyFn();
    },
  ],
};

export default preview;
