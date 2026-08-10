import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ConfirmModalComponent } from './confirm-modal.component';

const meta: Meta<ConfirmModalComponent> = {
  title: 'Overlays/ConfirmModal',
  component: ConfirmModalComponent,
  args: {
    title: 'Eliminar usuario',
    description: 'Esta acción no se puede deshacer. El usuario perderá el acceso permanentemente.',
    confirmLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
    danger: false,
    size: 'sm',
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-confirm-modal
        [open]="open"
        [title]="title"
        [description]="description"
        [confirmLabel]="confirmLabel"
        [cancelLabel]="cancelLabel"
        [danger]="danger"
        [size]="size"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<ConfirmModalComponent>;

export const Default: Story = {};

export const Danger: Story = {
  args: { danger: true, title: 'Eliminar proyecto', confirmLabel: 'Eliminar proyecto' },
};
