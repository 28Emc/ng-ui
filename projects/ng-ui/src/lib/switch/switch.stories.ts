import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Input/Switch',
  component: SwitchComponent,
  args: {
    label: 'Notificaciones',
    description: 'Recibir un correo cuando alguien responda.',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-switch [label]="label" [description]="description" [disabled]="disabled" />`,
  }),
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: { description: '' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
