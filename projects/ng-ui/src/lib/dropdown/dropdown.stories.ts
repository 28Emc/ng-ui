import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { LucidePencil, LucideCopy, LucideTrash2 } from '@lucide/angular';
import { DropdownComponent } from './dropdown.component';
import { MenuItemComponent } from './menu-item.component';
import { MenuDividerComponent } from './menu-divider.component';

const meta: Meta<DropdownComponent> = {
  title: 'Overlays/Dropdown',
  component: DropdownComponent,
  decorators: [
    moduleMetadata({
      imports: [MenuItemComponent, MenuDividerComponent, LucidePencil, LucideCopy, LucideTrash2],
    }),
  ],
  args: {
    label: 'Acciones',
    align: 'right',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-center pt-2">
        <ui-dropdown [label]="label" [align]="align">
          <ui-menu-item>
            <svg lucidePencil [size]="14" [strokeWidth]="2" /> Editar
          </ui-menu-item>
          <ui-menu-item>
            <svg lucideCopy [size]="14" [strokeWidth]="2" /> Duplicar
          </ui-menu-item>
          <ui-menu-divider />
          <ui-menu-item danger>
            <svg lucideTrash2 [size]="14" [strokeWidth]="2" /> Eliminar
          </ui-menu-item>
        </ui-dropdown>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const Default: Story = {};

export const AlignLeft: Story = {
  args: { align: 'left' },
};
