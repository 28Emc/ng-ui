import type { Meta, StoryObj } from '@storybook/angular-vite';
import { PageLoaderComponent } from './page-loader.component';

const meta: Meta<PageLoaderComponent> = {
  title: 'Feedback/PageLoader',
  parameters: {
    a11y: { test: 'error' },
  },
  component: PageLoaderComponent,
  args: { label: 'Cargando…', fullScreen: false },
  render: (args) => ({
    props: args,
    template: `<ui-page-loader [label]="label" [fullScreen]="fullScreen" />`,
  }),
};

export default meta;
type Story = StoryObj<PageLoaderComponent>;

export const Inline: Story = {};

export const WithCustomLabel: Story = {
  args: { label: 'Procesando solicitud…' },
};

export const FullScreen: Story = {
  args: { fullScreen: true },
};
