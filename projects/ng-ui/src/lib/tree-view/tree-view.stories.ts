import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TreeViewComponent, type UiTreeNode } from './tree-view.component';

const nodes: UiTreeNode[] = [
  {
    id: 'productos',
    label: 'Productos',
    initiallyExpanded: true,
    children: [
      { id: 'productos-activos', label: 'Activos' },
      {
        id: 'productos-archivados',
        label: 'Archivados',
        children: [{ id: 'productos-archivados-2024', label: '2024' }],
      },
    ],
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    children: [{ id: 'pedidos-pendientes', label: 'Pendientes' }],
  },
  { id: 'clientes', label: 'Clientes' },
  { id: 'facturacion', label: 'Facturación', disabled: true },
];

const meta: Meta<TreeViewComponent> = {
  title: 'Data Display/TreeView',
  component: TreeViewComponent,
  args: {
    nodes,
    multiSelect: false,
    selectable: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-full max-w-sm rounded-xl border border-default bg-surface p-2 shadow-soft">
        <ui-tree-view [nodes]="nodes" [multiSelect]="multiSelect" [selectable]="selectable" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TreeViewComponent>;

export const Default: Story = {};

export const MultiSelect: Story = {
  args: { multiSelect: true },
};
