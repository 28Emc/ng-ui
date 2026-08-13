import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SkipLinkComponent } from './skip-link.component';

const meta: Meta<SkipLinkComponent> = {
  title: 'Feedback/SkipLink',
  parameters: {
    a11y: { test: 'error' },
  },
  component: SkipLinkComponent,
  render: () => ({
    template: `
      <div class="max-w-xl space-y-4">
        <ui-skip-link target="#contenido" />
        <div id="contenido" class="rounded-lg border border-default bg-surface p-4">
          <p class="text-sm text-fg">
            Pulsa <kbd class="rounded border border-default bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Tab</kbd>
            para ver aparecer el enlace "Saltar al contenido" en la esquina superior izquierda.
          </p>
        </div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<SkipLinkComponent>;

export const Default: Story = {};

export const CustomTargetAndLabel: Story = {
  render: () => ({
    template: `
      <div class="max-w-xl space-y-4">
        <ui-skip-link target="#seccion" label="Ir directamente al formulario" />
        <div id="seccion" class="rounded-lg border border-default bg-surface p-4">
          <p class="text-sm text-fg">Destino del enlace de salto.</p>
        </div>
      </div>
    `,
  }),
};
