import type { Meta, StoryObj } from '@storybook/angular-vite';
import { UiIconComponent } from './ui-icon.component';
import { ICON_PATHS } from './icon-paths';

const meta: Meta<UiIconComponent> = {
  title: 'Inputs/Icon',
  parameters: {
    a11y: { test: 'error' },
  },
  component: UiIconComponent,
  args: {
    name: 'settings',
    size: 24,
    strokeWidth: 2,
  },
  argTypes: {
    name: {
      description: 'Nombre del icono en `ICON_PATHS`.',
      options: Object.keys(ICON_PATHS),
      control: { type: 'select' },
    },
    size: {
      description: 'Tamaño del icono en píxeles (ancho y alto).',
      control: { type: 'range', min: 12, max: 48, step: 2 },
    },
    strokeWidth: {
      description: 'Grosor del trazo del icono.',
      control: { type: 'range', min: 1, max: 3, step: 0.5 },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-icon [name]="name" [size]="size" [strokeWidth]="strokeWidth" />`,
  }),
};

export default meta;
type Story = StoryObj<UiIconComponent>;

export const Default: Story = {};

export const Gallery: Story = {
  render: () => ({
    props: { iconNames: Object.keys(ICON_PATHS) },
    template: `
      <div class="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 p-4">
        @for (name of iconNames; track name) {
          <div class="flex flex-col items-center gap-2 rounded-lg border border-default bg-surface p-3">
            <ui-icon [name]="name" [size]="22" />
            <span class="text-[10px] font-mono text-muted">{{ name }}</span>
          </div>
        }
      </div>
    `,
  }),
};
