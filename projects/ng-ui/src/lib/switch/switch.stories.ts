import type { Meta, StoryObj } from '@storybook/angular-vite';
import { userEvent, within, expect } from 'storybook/test';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Inputs/Switch',
  parameters: {
    a11y: { test: 'error' },
  },
  component: SwitchComponent,
  args: {
    label: 'Notificaciones',
    description: 'Recibir un correo cuando alguien responda.',
    disabled: false,
  },
  argTypes: {
    label: {
      description: 'Etiqueta principal del switch.',
      control: { type: 'text' },
    },
    description: {
      description: 'Texto secundario de apoyo.',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Deshabilita el switch.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-switch [label]="label" [description]="description" [disabled]="disabled" />`,
  }),
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};

export const WithoutDescription: Story = {
  args: { description: '' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
