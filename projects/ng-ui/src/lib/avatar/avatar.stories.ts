import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Data Display/Avatar',
  component: AvatarComponent,
  args: {
    name: 'María Fernanda López',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<ui-avatar [name]="name" [size]="size" [color]="color" />`,
  }),
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const SingleWordName: Story = {
  args: { name: 'Admin' },
};

export const CustomColor: Story = {
  args: { color: '#7c3aed' },
};

export const Gallery: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex items-center gap-3">
        <ui-avatar name="Ana Torres" size="sm" />
        <ui-avatar name="Carlos Pérez" size="md" color="#0ea5e9" />
        <ui-avatar name="Lucía Gómez" size="lg" color="#10b981" />
        <ui-avatar name="Producto" size="md" color="#f59e0b" />
      </div>
    `,
  }),
};
