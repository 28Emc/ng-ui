import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { DragDropListComponent } from './drag-drop-list.component';

interface TodoItem {
  id: number;
  title: string;
  status: string;
}

@Component({
  selector: 'drag-list-basic',
  standalone: true,
  imports: [DragDropListComponent],
  template: `
    <div class="max-w-md rounded-xl border border-default bg-surface p-4">
      <ui-drag-drop-list
        [items]="items()"
        (itemsChange)="items.set($event)"
        handleLabel="Mover tarea"
      />
    </div>
  `,
})
class DragListBasic {
  readonly items = signal(['Comprar pan', 'Enviar email', 'Revisar PR', 'Llamar al cliente']);
}

@Component({
  selector: 'drag-list-custom',
  standalone: true,
  imports: [DragDropListComponent],
  template: `
    <div class="max-w-md rounded-xl border border-default bg-surface p-4">
      <ui-drag-drop-list
        [items]="items()"
        (itemsChange)="items.set($event)"
        [itemTemplate]="row"
        [trackBy]="trackById"
        handleLabel="Mover tarea"
      >
        <ng-template #row let-item>
          <div class="flex flex-1 items-center gap-3">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700"
            >
              {{ initials(item.title) }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-fg">{{ item.title }}</p>
              <p class="truncate text-xs text-muted">{{ item.status }}</p>
            </div>
          </div>
        </ng-template>
      </ui-drag-drop-list>
    </div>
  `,
})
class DragListCustom {
  readonly items = signal<TodoItem[]>([
    { id: 1, title: 'Configurar CI', status: 'En progreso' },
    { id: 2, title: 'Escribir documentación', status: 'Pendiente' },
    { id: 3, title: 'Revisar diseño', status: 'Hecho' },
    { id: 4, title: 'Publicar release', status: 'Bloqueado' },
  ]);

  trackById = (item: TodoItem) => item.id;

  initials(title: string): string {
    return title
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}

@Component({
  selector: 'drag-list-disabled',
  standalone: true,
  imports: [DragDropListComponent],
  template: `
    <div class="max-w-md rounded-xl border border-default bg-surface p-4">
      <ui-drag-drop-list [items]="items()" [disabled]="true" handleLabel="Mover tarea" />
      <p class="mt-3 text-xs text-muted">Lista deshabilitada: no se puede reordenar.</p>
    </div>
  `,
})
class DragListDisabled {
  readonly items = signal(['Configuración', 'Perfil', 'Facturación', 'Equipo']);
}

const meta: Meta<DragDropListComponent> = {
  title: 'Data Display/DragDropList',
  component: DragDropListComponent,
  decorators: [moduleMetadata({ imports: [DragListBasic, DragListCustom, DragListDisabled] })],
  render: () => ({ template: '<drag-list-basic />' }),
};

export default meta;
type Story = StoryObj<DragDropListComponent>;

export const Default: Story = {};

export const CustomTemplate: Story = {
  render: () => ({ template: '<drag-list-custom />' }),
};

export const Disabled: Story = {
  render: () => ({ template: '<drag-list-disabled />' }),
};
