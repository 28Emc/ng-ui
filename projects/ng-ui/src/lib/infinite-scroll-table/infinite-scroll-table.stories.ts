import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { InfiniteScrollTableComponent } from './infinite-scroll-table.component';
import { TableColumn } from '../table/table.component';

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

const NAMES = [
  'Ana Torres',
  'Carlos Pérez',
  'Lucía Gómez',
  'Marco Ruiz',
  'Sofía Díaz',
  'Jorge Mora',
];
const ROLES = ['Admin', 'Editor', 'Viewer'];

function makeRows(count: number, start = 0): DemoRow[] {
  return Array.from({ length: count }, (_, i) => {
    const n = start + i;
    return {
      id: n,
      name: NAMES[n % NAMES.length],
      email: `usuario${n + 1}@empresa.com`,
      role: ROLES[n % ROLES.length],
      amount: Math.round(120 + ((n * 97) % 9800)),
    };
  });
}

@Component({
  selector: 'ist-demo',
  standalone: true,
  imports: [InfiniteScrollTableComponent],
  template: `
    <ui-infinite-scroll-table
      [columns]="columns"
      [data]="rows()"
      [loading]="loading()"
      [hasMore]="hasMore()"
      [height]="360"
      [striped]="true"
      (loadMore)="loadMore()"
    />
    <p class="mt-2 text-xs text-muted">Filas cargadas: {{ rows().length }} de 500</p>
  `,
})
class InfiniteScrollDemoComponent {
  readonly columns = COLUMNS;
  readonly rows = signal<DemoRow[]>(makeRows(20));
  readonly loading = signal(false);
  readonly hasMore = signal(true);

  loadMore(): void {
    if (this.loading()) return;
    this.loading.set(true);
    setTimeout(() => {
      this.rows.update((r) => [...r, ...makeRows(20, r.length)]);
      this.loading.set(false);
      if (this.rows().length >= 500) this.hasMore.set(false);
    }, 500);
  }
}

const meta: Meta<InfiniteScrollTableComponent<DemoRow>> = {
  title: 'Data Display/InfiniteScrollTable',
  parameters: {
    a11y: { test: 'error' },
  },
  component: InfiniteScrollTableComponent<DemoRow>,
  decorators: [moduleMetadata({ imports: [InfiniteScrollTableComponent] })],
  args: {
    columns: COLUMNS,
    data: makeRows(12),
    hasMore: false,
    height: 360,
    striped: false,
    emptyMessage: 'No hay datos',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-infinite-scroll-table
        [columns]="columns"
        [data]="data"
        [loading]="loading"
        [hasMore]="hasMore"
        [height]="height"
        [striped]="striped"
        [emptyMessage]="emptyMessage"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<InfiniteScrollTableComponent<DemoRow>>;

export const Basic: Story = {};

export const Striped: Story = {
  args: { striped: true },
};

export const Loading: Story = {
  args: { data: makeRows(12), loading: true, hasMore: true },
};

export const Empty: Story = {
  args: { data: [], hasMore: false },
};

export const Interactive: Story = {
  render: () => ({
    moduleMetadata: { imports: [InfiniteScrollDemoComponent] },
    template: `<ist-demo />`,
  }),
};
