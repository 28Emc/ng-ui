import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { VirtualScrollListComponent } from './virtual-scroll-list.component';

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Ítem ${i}` }));
const projects = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  name: `Proyecto ${i + 1}`,
  status: ['Activo', 'Pausado', 'Archivado'][i % 3],
}));

const meta: Meta<VirtualScrollListComponent> = {
  title: 'Lists/VirtualScrollList',
  component: VirtualScrollListComponent,
  decorators: [moduleMetadata({ imports: [VirtualScrollListComponent] })],
  args: {
    items,
    height: 320,
    itemHeight: 40,
    buffer: 5,
    selectable: false,
    selection: [],
    emptyText: 'No hay elementos',
    ariaLabel: 'Lista',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-virtual-scroll-list
          [items]="items"
          [height]="height"
          [itemHeight]="itemHeight"
          [buffer]="buffer"
          [selectable]="selectable"
          [selection]="selection"
          (selectionChange)="selection = $event"
          [emptyText]="emptyText"
          [ariaLabel]="ariaLabel"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<VirtualScrollListComponent>;

export const LargeList: Story = {};

export const Selectable: Story = {
  args: { items: projects, selectable: true },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-80">
        <ui-virtual-scroll-list
          [items]="items"
          [height]="height"
          [selectable]="selectable"
          [(selection)]="selection"
          [emptyText]="emptyText"
          ariaLabel="Proyectos"
        />
      </div>
    `,
  }),
};

export const CustomTemplate: Story = {
  args: { items: projects },
  render: (args) => ({
    props: { ...args, trackById: (item: { id: number }) => item.id },
    template: `
      <div class="w-80">
        <ui-virtual-scroll-list
          [items]="items"
          [height]="height"
          [itemTemplate]="row"
          [trackBy]="trackById"
        >
          <ng-template #row let-item>
            <div class="flex h-full items-center justify-between px-3.5 text-sm">
              <span class="truncate text-fg">{{ item.name }}</span>
              <span class="text-xs text-muted">{{ item.status }}</span>
            </div>
          </ng-template>
        </ui-virtual-scroll-list>
      </div>
    `,
  }),
};

export const Empty: Story = {
  args: { items: [] },
};
