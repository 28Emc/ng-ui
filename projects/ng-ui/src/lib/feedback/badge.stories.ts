import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Feedback/Badge',
  component: BadgeComponent,
  args: { variant: 'default' },
  render: (args) => ({
    props: args,
    template: `<ui-badge [variant]="variant">Badge</ui-badge>`,
  }),
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {};

export const Brand: Story = {
  args: { variant: 'brand' },
};

export const Green: Story = {
  args: { variant: 'green' },
};

export const Amber: Story = {
  args: { variant: 'amber' },
};

export const Gray: Story = {
  args: { variant: 'gray' },
};
