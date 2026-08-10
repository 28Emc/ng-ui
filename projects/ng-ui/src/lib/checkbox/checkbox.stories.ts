import type { Meta, StoryObj } from '@storybook/angular-vite';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Input/Checkbox',
  component: CheckboxComponent,
  args: {
    label: 'Acepto los términos y condiciones',
    description: 'Lee la política de privacidad antes de continuar.',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-checkbox [label]="label" [description]="description" [disabled]="disabled" />`,
  }),
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: { description: '' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
