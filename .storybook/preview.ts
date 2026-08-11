import type { Preview } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import '../projects/ng-ui/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
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
