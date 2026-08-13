import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SkeletonComponent } from './skeleton.component';

const meta: Meta<SkeletonComponent> = {
  title: 'Feedback/Skeleton',
  parameters: {
    a11y: { test: 'error' },
  },
  component: SkeletonComponent,
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-3">
        <ui-skeleton class="h-10 w-10 rounded-full" />
        <ui-skeleton class="h-4 w-full" />
        <ui-skeleton class="h-4 w-2/3" />
        <ui-skeleton class="h-24 w-full" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Default: Story = {};

export const Card: Story = {
  render: () => ({
    template: `
      <div class="w-72 space-y-3 rounded-xl border border-default bg-surface p-4">
        <ui-skeleton class="h-6 w-1/2" />
        <ui-skeleton class="h-20 w-full" />
        <div class="flex justify-between">
          <ui-skeleton class="h-8 w-20" />
          <ui-skeleton class="h-8 w-20" />
        </div>
      </div>
    `,
  }),
};
