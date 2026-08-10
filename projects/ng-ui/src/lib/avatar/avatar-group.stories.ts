import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AvatarGroupComponent } from './avatar-group.component';

const TEAM = [
  { name: 'Ana López', color: '#15a18b' },
  { name: 'Juan Pérez', color: '#6f86c9' },
  { name: 'María García', color: '#c2706a' },
  { name: 'Carlos Ruiz', color: '#7e6cc0' },
  { name: 'Lucía Gómez' },
  { name: 'Pedro Sánchez', color: '#bfa23a' },
  { name: 'Sofía Herrera' },
];

const meta: Meta<AvatarGroupComponent> = {
  title: 'Data Display/AvatarGroup',
  component: AvatarGroupComponent,
  args: {
    avatars: TEAM,
    max: 5,
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<ui-avatar-group [avatars]="avatars" [max]="max" [size]="size" />`,
  }),
};

export default meta;
type Story = StoryObj<AvatarGroupComponent>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const NoOverflow: Story = {
  args: {
    avatars: [{ name: 'Ana López' }, { name: 'Juan Pérez' }, { name: 'María García' }],
  },
};

export const LimitThree: Story = {
  args: { max: 3 },
};

export const CustomColors: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-6">
        <ui-avatar-group [avatars]="avatars" [max]="max" [size]="size" />
      </div>
    `,
  }),
};
