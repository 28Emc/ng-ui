import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { MaskedInputComponent } from './masked-input.component';
import { FieldComponent } from './field.component';

const meta: Meta<MaskedInputComponent> = {
  title: 'Inputs/MaskedInput',
  parameters: {
    a11y: { test: 'error' },
  },
  component: MaskedInputComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule, FieldComponent],
    }),
  ],
  args: {
    mask: '(###) ###-####',
    placeholder: '',
    invalid: false,
    disabled: false,
    emitMasked: false,
    name: 'phone',
    autocomplete: 'tel',
  },
  render: (args) => ({
    props: args,
    template: `<ui-masked-input [mask]="mask" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" [emitMasked]="emitMasked" [name]="name" [autocomplete]="autocomplete" />`,
  }),
};

export default meta;
type Story = StoryObj<MaskedInputComponent>;

export const Phone: Story = {};

export const CreditCard: Story = {
  args: { mask: '#### #### #### ####' },
};

export const SSN: Story = {
  args: { mask: '###-##-####' },
};

export const WithField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Teléfono" hint="El modelo guarda solo los dígitos.">
          <ui-masked-input [mask]="mask" [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" />
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
        <ui-field label="Tarjeta de crédito" error="Ingresa los 16 dígitos.">
          <ui-masked-input mask="#### #### #### ####" invalid />
        </ui-field>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    props: args,
    template: `<ui-masked-input [mask]="mask" [disabled]="disabled" />`,
  }),
};
