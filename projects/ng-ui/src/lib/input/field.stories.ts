import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FieldComponent } from './field.component';
import { InputComponent } from './input.component';

const meta: Meta<FieldComponent> = {
  title: 'Inputs/Field',
  parameters: {
    a11y: { test: 'error' },
  },
  component: FieldComponent,
  decorators: [
    moduleMetadata({
      imports: [InputComponent],
    }),
  ],
  args: {
    label: 'Correo electrónico',
    hint: null,
    error: null,
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field [label]="label" [hint]="hint" [error]="error" [required]="required">
          <ui-input placeholder="tu@correo.com" [invalid]="!!error" />
        </ui-field>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<FieldComponent>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    hint: 'Usaremos este correo para enviarte el acceso.',
  },
};

export const Required: Story = {
  args: {
    required: true,
    hint: 'No compartiremos tu correo con terceros.',
  },
};

export const WithError: Story = {
  args: {
    error: 'El correo no es válido.',
  },
};

export const RequiredWithError: Story = {
  args: {
    required: true,
    error: 'Este campo es obligatorio.',
  },
};
