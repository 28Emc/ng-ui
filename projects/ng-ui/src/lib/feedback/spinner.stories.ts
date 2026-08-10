import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Feedback/Spinner',
  component: SpinnerComponent,
  args: { size: 24 },
  render: (args) => ({
    props: args,
    template: `<ui-spinner [size]="size" />`,
  }),
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {};

export const Large: Story = {
  args: { size: 48 },
};

export const Small: Story = {
  args: { size: 12 },
};
