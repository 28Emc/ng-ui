import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { SelectComponent } from './select.component';
import { FieldComponent } from './field.component';

const OPTIONS = `
  <option value="1">Opción uno</option>
  <option value="2">Opción dos</option>
  <option value="3">Opción tres</option>
`;

const meta: Meta<SelectComponent> = {
  title: 'Inputs/Select',
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [FieldComponent],
    }),
  ],
  args: {
    placeholder: 'Selecciona una opción',
    invalid: false,
    disabled: false,
    name: 'country',
    autocomplete: 'country-name',
  },
  render: (args) => ({
    props: args,
    template: `<ui-select [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled" [name]="name" [autocomplete]="autocomplete">${OPTIONS}</ui-select>`,
  }),
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-field label="Tipo de documento" required>
          <ui-select [placeholder]="placeholder" [invalid]="invalid" [disabled]="disabled">${OPTIONS}</ui-select>
        </ui-field>
      </div>
    `,
  }),
};
