import type { Meta, StoryObj } from '@storybook/angular-vite';
import { OtpInputComponent } from './otp-input.component';

const meta: Meta<OtpInputComponent> = {
  title: 'Inputs/OtpInput',
  component: OtpInputComponent,
  args: {
    length: 6,
    numeric: true,
    autoFocus: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-4">
        <ui-otp-input
          [length]="length"
          [numeric]="numeric"
          [autoFocus]="autoFocus"
          [disabled]="disabled"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<OtpInputComponent>;

export const Default: Story = {};

export const FourDigits: Story = {
  args: { length: 4 },
};

export const Alphanumeric: Story = {
  args: { length: 5, numeric: false },
};

export const Disabled: Story = {
  args: { disabled: true, length: 4 },
};
