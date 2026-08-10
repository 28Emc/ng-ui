import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DateRangePickerComponent } from './daterangepicker.component';

const meta: Meta<DateRangePickerComponent> = {
  title: 'Input/DateRangePicker',
  component: DateRangePickerComponent,
  args: {
    placeholder: 'Selecciona un rango',
    value: null,
    min: undefined,
    max: undefined,
    disabled: false,
    name: 'period',
  },
  render: (args) => ({
    props: args,
    template: `<ui-daterangepicker [placeholder]="placeholder" [value]="value" [min]="min" [max]="max" [disabled]="disabled" [name]="name" />`,
  }),
};

export default meta;
type Story = StoryObj<DateRangePickerComponent>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: ['2026-08-10', '2026-08-20'] },
};

export const WithMinMax: Story = {
  args: {
    value: ['2026-08-12', '2026-08-18'],
    min: '2026-08-01',
    max: '2026-08-31',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
