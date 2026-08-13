import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { TableComponent, TableColumn } from './table.component';

interface DemoRow {
  id: number;
  name: string;
  email: string;
  role: string;
  amount: number;
}

const COLUMNS: TableColumn<DemoRow>[] = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Correo' },
  { key: 'role', label: 'Rol' },
  { key: 'amount', label: 'Monto', sortable: true, align: 'right' },
];

const DATA: DemoRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: ['Ana Torres', 'Carlos Pérez', 'Lucía Gómez', 'Marco Ruiz', 'Sofía Díaz', 'Jorge Mora'][
    i % 6
  ],
  email: `usuario${i + 1}@empresa.com`,
  role: ['Admin', 'Editor', 'Viewer', 'Admin', 'Editor', 'Viewer'][i % 6],
  amount: Math.round(120 + Math.random() * 9800),
}));

const meta: Meta<TableComponent<DemoRow>> = {
  title: 'Data Display/Table',
  component: TableComponent<DemoRow>,
  args: {
    columns: COLUMNS,
    data: DATA,
    emptyMessage: 'No hay datos',
    pageSize: 5,
    showPagination: true,
    striped: false,
    rowClick: fn(),
  },
  argTypes: {
    rowClick: {
      description: 'Se emite al hacer clic en una fila.',
      table: { disable: true },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-table
        [columns]="columns"
        [data]="data"
        [emptyMessage]="emptyMessage"
        [pageSize]="pageSize"
        [showPagination]="showPagination"
        [striped]="striped"
        (rowClick)="rowClick($event)"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<TableComponent<DemoRow>>;

export const Default: Story = {};

export const Responsive: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-6">
        <div class="w-64">
          <ui-table
            [columns]="columns"
            [data]="data"
            [pageSize]="5"
            [showPagination]="true"
          />
        </div>
        <div class="w-full">
          <ui-table
            [columns]="columns"
            [data]="data"
            [pageSize]="5"
            [showPagination]="true"
          />
        </div>
      </div>
    `,
  }),
};

export const Striped: Story = {
  args: { striped: true },
};

export const WithoutPagination: Story = {
  args: { showPagination: false },
};

export const Empty: Story = {
  args: { data: [], showPagination: false },
};
