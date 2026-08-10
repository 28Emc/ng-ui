import { Component, signal } from '@angular/core';
import { LucideEdit, LucideDownload, LucideSettings, LucideTrash2 } from '@lucide/angular';
import {
  ButtonComponent,
  ConfirmModalComponent,
  DrawerComponent,
  DropdownComponent,
  MenuDividerComponent,
  MenuItemComponent,
  ModalComponent,
  ModalSize,
  PopoverComponent,
  UiDrawerFooterDirective,
  UiModalFooterDirective,
} from '@emc-dev/ng-ui';

@Component({
  selector: 'app-overlays-page',
  standalone: true,
  imports: [
    ButtonComponent,
    ConfirmModalComponent,
    DrawerComponent,
    DropdownComponent,
    MenuDividerComponent,
    MenuItemComponent,
    ModalComponent,
    PopoverComponent,
    UiDrawerFooterDirective,
    UiModalFooterDirective,
    LucideEdit,
    LucideDownload,
    LucideSettings,
    LucideTrash2,
  ],
  template: `
    <h1 class="mb-8 text-xl font-semibold text-fg">Overlays</h1>

    <h2 class="mb-4 text-lg font-semibold text-fg">Modal</h2>
    <p class="mb-2 text-sm font-medium text-muted">size: sm / md / lg / xl</p>
    <div class="mb-6 flex flex-wrap items-center gap-3">
      @for (size of sizes; track size) {
        <ui-button variant="secondary" size="sm" (click)="openModal(size)">
          {{ size }}
        </ui-button>
      }
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">ConfirmModal</h2>
    <div class="mb-6">
      <ui-button variant="danger" (click)="confirmOpen.set(true)">Eliminar proyecto</ui-button>
      @if (confirmed) {
        <span class="ml-3 text-sm text-muted">Último evento: {{ confirmed }}</span>
      }
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Drawer</h2>
    <div class="mb-6">
      <ui-button variant="secondary" (click)="drawerOpen.set(true)">Abrir Drawer</ui-button>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Dropdown</h2>
    <p class="mb-2 text-sm font-medium text-muted">align: left / right</p>
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4">
      <ui-dropdown label="Acciones" align="left">
        <ui-menu-item (click)="menuAction = 'edit'">
          <svg lucideEdit [size]="14" [strokeWidth]="2" class="text-muted" />
          Editar
        </ui-menu-item>
        <ui-menu-item (click)="menuAction = 'download'">
          <svg lucideDownload [size]="14" [strokeWidth]="2" class="text-muted" />
          Descargar
        </ui-menu-item>
        <ui-menu-item (click)="menuAction = 'settings'">
          <svg lucideSettings [size]="14" [strokeWidth]="2" class="text-muted" />
          Ajustes
        </ui-menu-item>
        <ui-menu-divider />
        <ui-menu-item [danger]="true" (click)="menuAction = 'delete'">
          <svg lucideTrash2 [size]="14" [strokeWidth]="2" class="text-red-600 dark:text-red-400" />
          Eliminar
        </ui-menu-item>
      </ui-dropdown>
      <ui-dropdown label="Más opciones" align="right">
        <ui-menu-item (click)="menuAction = 'export'">Exportar</ui-menu-item>
        <ui-menu-divider />
        <ui-menu-item [danger]="true" (click)="menuAction = 'reset'">Restablecer</ui-menu-item>
      </ui-dropdown>
      @if (menuAction) {
        <span class="text-sm text-muted">Acción: {{ menuAction }}</span>
      }
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Popover</h2>
    <p class="mb-2 text-sm font-medium text-muted">placement: top / bottom / left / right</p>
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4">
      <ui-popover label="Más información" placement="bottom">
        <div class="max-w-xs space-y-2">
          <p class="text-sm font-semibold text-fg">¿Qué es un popover?</p>
          <p class="text-sm text-muted">
            Un panel contextual que se posiciona junto a su trigger y cierra con clic fuera o
            Escape.
          </p>
        </div>
      </ui-popover>
      <ui-popover label="Izquierda" placement="left" align="start">
        <div class="max-w-xs space-y-2">
          <p class="text-sm font-semibold text-fg">Alineado al inicio</p>
          <p class="text-sm text-muted">placement left + align start.</p>
        </div>
      </ui-popover>
      <ui-popover label="Arriba" placement="top">
        <div class="max-w-xs space-y-2">
          <p class="text-sm font-semibold text-fg">Invertido al no caber</p>
          <p class="text-sm text-muted">
            Si no hay espacio, el panel voltea a la posición opuesta automáticamente.
          </p>
        </div>
      </ui-popover>
    </div>

    <ui-modal
      [(open)]="modalOpen"
      [size]="modalSize()"
      title="Nuevo proyecto"
      subtitle="Configura los detalles básicos"
    >
      <p class="text-sm text-muted">
        Contenido del modal. El pie se proyecta con <code>[uiModalFooter]</code> y se muestra
        automáticamente al detectarse.
      </p>
      <div uiModalFooter class="flex items-center justify-end gap-3">
        <ui-button variant="secondary" (click)="modalOpen.set(false)">Cancelar</ui-button>
        <ui-button variant="primary" (click)="modalOpen.set(false)">Crear proyecto</ui-button>
      </div>
    </ui-modal>

    <ui-confirm-modal
      [(open)]="confirmOpen"
      title="¿Eliminar proyecto?"
      description="Esta acción no se puede deshacer. Se eliminarán todos los datos asociados."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      [danger]="true"
      (confirm)="confirmDelete()"
    />

    <ui-drawer
      [(open)]="drawerOpen"
      title="Ajustes"
      subtitle="Preferencias del workspace"
      width="w-[22rem]"
    >
      <p class="text-sm text-muted">
        Drawer lateral con CDK Overlay posicionado a la derecha. Usa <code>[uiDrawerFooter]</code>
        para el pie.
      </p>
      <div uiDrawerFooter class="flex items-center justify-end gap-3">
        <ui-button variant="secondary" (click)="drawerOpen.set(false)">Cancelar</ui-button>
        <ui-button variant="primary" (click)="drawerOpen.set(false)">Guardar</ui-button>
      </div>
    </ui-drawer>
  `,
})
export class OverlaysPage {
  protected readonly sizes: ModalSize[] = ['sm', 'md', 'lg', 'xl'];

  protected readonly modalOpen = signal(false);
  protected readonly modalSize = signal<ModalSize>('md');
  protected readonly confirmOpen = signal(false);
  protected readonly drawerOpen = signal(false);

  protected confirmed: string | null = null;
  protected menuAction: string | null = null;

  protected openModal(size: ModalSize): void {
    this.modalSize.set(size);
    this.modalOpen.set(true);
  }

  protected confirmDelete(): void {
    this.confirmed = 'Eliminado';
    this.confirmOpen.set(false);
  }
}
