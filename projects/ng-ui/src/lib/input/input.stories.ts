import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { InputComponent } from './input.component';
import { FieldComponent } from './field.component';

const meta: Meta<InputComponent> = {
  title: 'Inputs/Input',
  parameters: {
    a11y: { test: 'error' },
  },
  component: InputComponent,
  decorators: [
    moduleMetadata({
      imports: [FieldComponent],
    }),
  ],
  args: {
    type: 'text',
    placeholder: 'Ingresa tu correo',
    invalid: false,
    disabled: false,
    name: 'email',
    autocomplete: 'email',
  },
  argTypes: {
    type: {
      description: 'Tipo de input nativo.',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      control: { type: 'select' },
    },
    placeholder: {
      description: 'Texto de marcador de posición.',
      control: { type: 'text' },
    },
    invalid: {
      description: 'Aplica estilos de estado inválido y `aria-invalid`.',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Deshabilita el input.',
      control: { type: 'boolean' },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-input [type]="type" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" [name]="name" [autocomplete]="autocomplete" />`,
  }),
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, value: undefined },
};

export const WithField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Correo electrónico" hint="Usaremos este correo para enviarte el acceso.">
          <ui-input [type]="type" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" />
        </ui-field>
      </div>
    `,
  }),
};

export const WithError: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Correo electrónico" error="Ingresa un correo válido.">
          <ui-input [type]="type" [placeholder]="placeholder" invalid [disabled]="disabled" />
        </ui-field>
      </div>
    `,
  }),
};

export const WithRequired: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Nombre completo" required>
          <ui-input [type]="type" placeholder="Tu nombre" [disabled]="disabled" />
        </ui-field>
      </div>
    `,
  }),
};
