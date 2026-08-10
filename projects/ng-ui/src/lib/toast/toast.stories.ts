import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ToastComponent } from './toast.component';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from './toast.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'toast-gallery',
  standalone: true,
  imports: [ToastHostComponent, ButtonComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <ui-button
        variant="secondary"
        (click)="toastService.info('Información', 'La operación está en proceso.')"
      >
        Info
      </ui-button>
      <ui-button
        variant="secondary"
        (click)="
          toastService.success('Cambios guardados', 'Tu configuración se actualizó correctamente.')
        "
      >
        Success
      </ui-button>
      <ui-button
        variant="secondary"
        (click)="toastService.warning('Almacenamiento casi lleno', 'Considera liberar espacio.')"
      >
        Warning
      </ui-button>
      <ui-button
        variant="danger"
        (click)="toastService.error('Error de conexión', 'No se pudo conectar con el servidor.')"
      >
        Error
      </ui-button>
      <ui-button
        variant="secondary"
        (click)="
          toastService.toast({
            title: 'Documento borrado',
            description: 'Se moverá a la papelera',
            variant: 'warning',
            action: {
              label: 'Deshacer',
              onClick: () => toastService.success('Restaurado', 'El documento se recuperó.'),
            },
          })
        "
      >
        Con acción
      </ui-button>
      <ui-button variant="secondary" (click)="burst()">Ráfaga (máx 3)</ui-button>
      <ui-button variant="ghost" (click)="cyclePosition()">Posición</ui-button>
    </div>
    <ui-toast-host />
  `,
})
class ToastGalleryComponent {
  readonly toastService = inject(ToastService);

  private readonly positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
  private index = 0;

  burst(): void {
    this.toastService.maxToasts.set(3);
    for (let i = 1; i <= 4; i++) {
      this.toastService.info(`Toast ${i}`, `Mensaje número ${i}`);
    }
  }

  cyclePosition(): void {
    this.index = (this.index + 1) % this.positions.length;
    this.toastService.position.set(this.positions[this.index]);
    this.toastService.info('Posición', `Moviendo la pila a ${this.positions[this.index]}`);
  }
}

const meta: Meta<ToastComponent> = {
  title: 'Feedback/Toast',
  component: ToastComponent,
  decorators: [
    moduleMetadata({
      imports: [ToastGalleryComponent],
    }),
  ],
  render: () => ({
    template: `<toast-gallery />`,
  }),
};

export default meta;
type Story = StoryObj<ToastComponent>;

export const Default: Story = {};
