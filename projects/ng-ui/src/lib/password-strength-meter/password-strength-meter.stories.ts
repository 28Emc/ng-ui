import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { PasswordStrengthMeterComponent } from './password-strength-meter.component';
import { FieldComponent } from '../input/field.component';

const meta: Meta<PasswordStrengthMeterComponent> = {
  title: 'Input/PasswordStrengthMeter',
  component: PasswordStrengthMeterComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule, FieldComponent],
    }),
  ],
  args: {
    placeholder: 'Contraseña',
    invalid: false,
    disabled: false,
    showCriteria: true,
    autocomplete: 'current-password',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-password-strength-meter
          [placeholder]="placeholder"
          [invalid]="invalid"
          [disabled]="disabled"
          [showCriteria]="showCriteria"
          [ngModel]="value"
          (ngModelChange)="value = $event"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<PasswordStrengthMeterComponent>;

export const Empty: Story = {
  args: { value: '' },
};

export const Weak: Story = {
  args: { value: 'abc' },
};

export const Fair: Story = {
  args: { value: 'Abc123' },
};

export const Strong: Story = {
  args: { value: 'Tr0b4dor!2026' },
};

export const WithoutCriteria: Story = {
  args: { value: 'Tr0bador', showCriteria: false },
};

export const WithField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Contraseña" hint="Mínimo 8 caracteres.">
          <ui-password-strength-meter
            [placeholder]="placeholder"
            [invalid]="invalid"
            [disabled]="disabled"
            [showCriteria]="showCriteria"
            [(ngModel)]="value"
          />
        </ui-field>
      </div>
    `,
  }),
  args: { value: 'Tr0b4dor!2026' },
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-password-strength-meter
          [placeholder]="placeholder"
          [disabled]="disabled"
          [ngModel]="value"
          (ngModelChange)="value = $event"
        />
      </div>
    `,
  }),
  args: { value: 'S3cret#pass', disabled: true },
};
