import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FieldErrorComponent } from './field-error.component';

const meta: Meta<FieldErrorComponent> = {
  title: 'Input/FieldError',
  component: FieldErrorComponent,
  render: (args) => ({
    props: args,
    template: `<ui-field-error [id]="id">Este campo es obligatorio.</ui-field-error>`,
  }),
};

export default meta;
type Story = StoryObj<FieldErrorComponent>;

export const Default: Story = {};
