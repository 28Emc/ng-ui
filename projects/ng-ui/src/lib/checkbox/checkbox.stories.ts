import type { Meta, StoryObj } from '@storybook/angular-vite';
import { userEvent, within, expect } from 'storybook/test';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Inputs/Checkbox',
  parameters: {
    a11y: { test: 'error' },
  },
  component: CheckboxComponent,
  args: {
    label: 'Acepto los términos y condiciones',
    description: 'Lee la política de privacidad antes de continuar.',
    disabled: false,
  },
  argTypes: {
    label: {
      description: 'Etiqueta principal del checkbox.',
      control: { type: 'text' },
    },
    description: {
      description: 'Texto secundario de apoyo.',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Deshabilita el checkbox.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-checkbox [label]="label" [description]="description" [disabled]="disabled" />`,
  }),
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  },
};

export const WithoutDescription: Story = {
  args: { description: '' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
