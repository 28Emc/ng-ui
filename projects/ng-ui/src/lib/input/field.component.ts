import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  inject,
  booleanAttribute,
} from '@angular/core';
import { FieldErrorComponent } from './field-error.component';
import { FieldContext, FIELD_CONTEXT } from './field-context.token';

let fieldUid = 0;

@Component({
  selector: 'ui-field',
  standalone: true,
  imports: [FieldErrorComponent],
  providers: [{ provide: FIELD_CONTEXT, useExisting: FieldComponent }],
  template: `
    <!-- El control se proyecta vía ng-content y queda dentro del label -->
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-fg">
        {{ label() }}
        @if (required()) {
          <span class="text-red-500"> *</span>
        }
      </span>
      <ng-content />
      @if (error()) {
        <ui-field-error [id]="errorId() || undefined">{{ error() }}</ui-field-error>
      } @else if (hint()) {
        <p [id]="hintId() || undefined" class="text-sm text-muted">{{ hint() }}</p>
      }
    </label>
  `,
})
export class FieldComponent implements FieldContext {
  readonly label = input('');
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  private readonly uid = ++fieldUid;
  readonly errorId = computed(() => (this.error() ? `ui-field-error-${this.uid}` : null));
  readonly hintId = computed(() => (this.hint() ? `ui-field-hint-${this.uid}` : null));

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /**
   * Un <label> sin `for` reenvía el click al primer elemento labelable de su interior.
   * Si ese elemento es un botón (chips ✕, chevrons), cualquier click en el campo lo
   * activaría por accidente. Lo prevenimos solo en ese caso y enfocamos el control
   * proyectado para conservar el comportamiento accesible del label.
   */
  @HostListener('click', ['$event'])
  protected onLabelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }
    const firstLabelable = this.elementRef.nativeElement.querySelector(
      'input, select, textarea, button, output, progress, meter',
    );
    if (firstLabelable?.tagName !== 'BUTTON') {
      return;
    }
    event.preventDefault();
    this.elementRef.nativeElement
      .querySelector<HTMLElement>(
        'input, select, textarea, [contenteditable="true"], [role="combobox"]',
      )
      ?.focus();
  }
}
