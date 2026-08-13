import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DatePickerComponent } from './datepicker.component';

const meta: Meta<DatePickerComponent> = {
  title: 'Pickers/DatePicker',
  parameters: {
    a11y: { test: 'error' },
  },
  component: DatePickerComponent,
  args: {
    placeholder: 'Selecciona una fecha',
    value: null,
    min: undefined,
    max: undefined,
    disabled: false,
    name: 'birthDate',
  },
  render: (args) => ({
    props: args,
    template: `<ui-datepicker [placeholder]="placeholder" [value]="value" [min]="min" [max]="max" [disabled]="disabled" [name]="name" />`,
  }),
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: '2026-08-15' },
};

export const WithMinMax: Story = {
  args: {
    value: '2026-08-15',
    min: '2026-08-01',
    max: '2026-08-31',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
