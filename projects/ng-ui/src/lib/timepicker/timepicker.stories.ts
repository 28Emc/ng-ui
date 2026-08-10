import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TimePickerComponent } from './timepicker.component';

const meta: Meta<TimePickerComponent> = {
  title: 'Input/TimePicker',
  component: TimePickerComponent,
  args: {
    placeholder: 'Selecciona una hora',
    value: null,
    min: undefined,
    max: undefined,
    format: undefined,
    minuteStep: 1,
    disabled: false,
    name: 'startTime',
  },
  render: (args) => ({
    props: args,
    template: `<ui-timepicker [placeholder]="placeholder" [value]="value" [min]="min" [max]="max" [format]="format" [minuteStep]="minuteStep" [disabled]="disabled" [name]="name" />`,
  }),
};

export default meta;
type Story = StoryObj<TimePickerComponent>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: '14:30' },
};

export const Format12h: Story = {
  args: { value: '14:30', format: 'h:mm a' },
};

export const WithMinMax: Story = {
  args: {
    value: '12:00',
    min: '08:00',
    max: '18:00',
  },
};

export const WithMinuteStep: Story = {
  args: {
    value: '10:00',
    minuteStep: 5,
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
