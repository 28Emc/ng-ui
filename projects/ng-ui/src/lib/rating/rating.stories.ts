import type { Meta, StoryObj } from '@storybook/angular-vite';
import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Input/Rating',
  component: RatingComponent,
  args: {
    value: 3,
    max: 5,
    size: 'md',
    label: 'Calificación',
    disabled: false,
    readonly: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-rating [value]="value" [max]="max" [size]="size" [label]="label" [disabled]="disabled" [readonly]="readonly" />`,
  }),
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const MaxValue: Story = {
  args: { value: 5 },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Readonly: Story = {
  args: { readonly: true },
};

export const Disabled: Story = {
  args: { disabled: true, value: 4 },
};
