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

export const Success: Story = {
  args: { variant: 'success' },
};

export const Warning: Story = {
  args: { variant: 'warning' },
};

export const Info: Story = {
  args: { variant: 'info' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const Gray: Story = {
  args: { variant: 'gray' },
};

export const All: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 p-2">
        <p class="kicker">Semantic variants</p>
        <div class="flex flex-wrap gap-2">
          <ui-badge variant="brand">Brand</ui-badge>
          <ui-badge variant="success">Success</ui-badge>
          <ui-badge variant="warning">Warning</ui-badge>
          <ui-badge variant="info">Info</ui-badge>
          <ui-badge variant="danger">Danger</ui-badge>
          <ui-badge variant="gray">Gray</ui-badge>
        </div>
      </div>
    `,
  }),
};
