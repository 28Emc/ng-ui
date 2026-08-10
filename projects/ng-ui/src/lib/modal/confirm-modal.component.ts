import { Component, input, model, output, booleanAttribute } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent, ModalSize } from './modal.component';
import { UiModalFooterDirective } from './modal-footer.directive';

@Component({
  selector: 'ui-confirm-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, UiModalFooterDirective],
  template: `
    <ui-modal [(open)]="open" [title]="title()" [size]="size()">
      @if (description()) {
        <p class="text-sm text-muted">{{ description() }}</p>
      }
      <ng-content />
      <footer uiModalFooter>
        <ui-button variant="ghost" (click)="onCancel()">
          {{ cancelLabel() }}
        </ui-button>
        <ui-button [variant]="danger() ? 'danger' : 'primary'" (click)="onConfirm()">
          {{ confirmLabel() }}
        </ui-button>
      </footer>
    </ui-modal>
  `,
})
export class ConfirmModalComponent {
  readonly open = model(false);
  readonly title = input('');
  readonly description = input('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly danger = input(false, { transform: booleanAttribute });
  readonly size = input<ModalSize>('sm');

  readonly confirm = output<void>();
  readonly cancelled = output<void>();

  protected onConfirm(): void {
    this.confirm.emit();
    this.open.set(false);
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.open.set(false);
  }
}
