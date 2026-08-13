import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fireEvent, within, expect, waitFor } from 'storybook/test';
import { LucideCopy, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { ContextMenuComponent, type UiContextMenuItem } from './context-menu.component';

const items: UiContextMenuItem[] = [
  { id: 'renombrar', label: 'Renombrar', icon: LucidePencil, shortcut: 'F2' },
  { id: 'copiar', label: 'Copiar', icon: LucideCopy, shortcut: 'Ctrl+C' },
  { id: 'sep', separator: true },
  { id: 'eliminar', label: 'Eliminar', icon: LucideTrash2, danger: true },
];

const meta: Meta<ContextMenuComponent> = {
  title: 'Overlays/ContextMenu',
  component: ContextMenuComponent,
  args: { items },
  render: (args) => ({
    props: args,
    template: `
      <ui-context-menu [items]="items">
        <div class="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-default bg-surface-2/40 text-muted">
          Haz clic derecho en esta zona
        </div>
      </ui-context-menu>
    `,
  }),
};

export default meta;
type Story = StoryObj<ContextMenuComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const zone = within(canvasElement).getByText('Haz clic derecho en esta zona');
    fireEvent.contextMenu(zone);
    await waitFor(async () => {
      await expect(await within(document.body).findByText('Renombrar')).toBeVisible();
    });
  },
};

export const DisabledItem: Story = {
  args: {
    items: [...items, { id: 'bloqueado', label: 'Bloqueado', icon: LucideCopy, disabled: true }],
  },
};
