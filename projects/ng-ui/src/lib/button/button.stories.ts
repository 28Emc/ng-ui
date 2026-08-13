import type { Meta, StoryObj } from '@storybook/angular-vite';
import { within, expect } from 'storybook/test';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Inputs/Button',
  parameters: {
    a11y: { test: 'error' },
  },
  component: ButtonComponent,
  args: {
    type: 'button',
    variant: 'primary',
    size: 'md',
    density: 'comfortable',
    disabled: false,
    loading: false,
  },
  argTypes: {
    type: {
      description: 'Atributo `type` nativo del botón.',
      options: ['button', 'submit', 'reset'],
      control: { type: 'select' },
    },
    variant: {
      description: 'Estilo visual del botón.',
      options: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'subtle'],
      control: { type: 'select' },
    },
    size: {
      description: 'Tamaño del botón.',
      options: ['sm', 'md', 'lg', 'icon', 'icon-sm'],
      control: { type: 'select' },
    },
    density: {
      description: 'Densidad vertical del botón.',
      options: ['comfortable', 'compact', 'spacious'],
      control: { type: 'select' },
    },
    loading: {
      description: 'Muestra un spinner y deshabilita el botón.',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Deshabilita el botón.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-button [type]="type" [variant]="variant" [size]="size" [density]="density" [disabled]="disabled" [loading]="loading">Button</ui-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <ui-button size="sm">Small</ui-button>
        <ui-button size="md">Medium</ui-button>
        <ui-button size="lg">Large</ui-button>
      </div>
    `,
  }),
};

export const All: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-6 p-4">
        <div class="flex flex-wrap items-center gap-3">
          <ui-button variant="primary">Primary</ui-button>
          <ui-button variant="secondary">Secondary</ui-button>
          <ui-button variant="ghost">Ghost</ui-button>
          <ui-button variant="outline">Outline</ui-button>
          <ui-button variant="subtle">Subtle</ui-button>
          <ui-button variant="danger">Danger</ui-button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <ui-button variant="primary" loading>Loading</ui-button>
          <ui-button variant="secondary" disabled>Disabled</ui-button>
        </div>
      </div>
    `,
  }),
};
