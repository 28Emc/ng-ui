import {
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideStar } from '@lucide/angular';
import { cn } from '../utils/cn';

const SIZE_MAP = { sm: 18, md: 22, lg: 28 } as const;

@Component({
  selector: 'ui-rating',
  standalone: true,
  imports: [LucideStar],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="inline-flex items-center gap-0.5"
      [attr.role]="readonly() ? undefined : 'radiogroup'"
      [attr.aria-label]="label() || null"
    >
      @for (index of stars(); track index) {
        <button
          type="button"
          [attr.role]="readonly() ? undefined : 'radio'"
          [attr.aria-checked]="readonly() ? null : index < value() ? 'true' : 'false'"
          [attr.aria-label]="'Calificar ' + (index + 1) + ' de ' + max()"
          [disabled]="interactiveDisabled()"
          [class]="starClasses()"
          (mouseenter)="hover.set(index + 1)"
          (mouseleave)="hover.set(0)"
          (focus)="hover.set(index + 1)"
          (blur)="hover.set(0)"
          (click)="select(index + 1)"
          (keydown.arrowleft)="moveFocus(-1, $event)"
          (keydown.arrowright)="moveFocus(1, $event)"
          (keydown.arrowup)="moveFocus(-1, $event)"
          (keydown.arrowdown)="moveFocus(1, $event)"
          (keydown.home)="moveTo(0, $event)"
          (keydown.end)="moveTo(max() - 1, $event)"
        >
          <svg
            lucideStar
            [size]="sizeValue()"
            [strokeWidth]="1.8"
            [class]="iconClasses(index)"
            [attr.fill]="isFilled(index) ? 'currentColor' : 'none'"
          />
        </button>
      }
    </div>
  `,
})
export class RatingComponent implements ControlValueAccessor {
  readonly value = model(0);
  readonly max = input(5);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input('');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly hover = signal(0);
  protected readonly formDisabled = signal(false);

  private _onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i));
  protected readonly sizeValue = computed(() => SIZE_MAP[this.size()]);
  protected readonly interactiveDisabled = computed(
    () => this.readonly() || this.disabled() || this.formDisabled(),
  );

  protected isFilled(index: number): boolean {
    const current = this.hover() || this.value();
    return index < current;
  }

  protected iconClasses(index: number): string {
    return cn(
      'transition-[color,transform] duration-150',
      this.isFilled(index) ? 'text-amber-400' : 'text-muted',
      !this.interactiveDisabled() && 'cursor-pointer hover:scale-110',
    );
  }

  protected starClasses(): string {
    return cn(
      'rounded-md p-0.5 transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      !this.readonly() && this.interactiveDisabled() && 'cursor-not-allowed opacity-50',
    );
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected select(index: number): void {
    if (this.interactiveDisabled()) {
      return;
    }
    const next = this.value() === index ? 0 : index;
    this.value.set(next);
    this._onChange(next);
    this.onTouched();
  }

  protected moveFocus(delta: number, event: Event): void {
    event.preventDefault();
    const buttons = this.starButtons();
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (current + delta + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  protected moveTo(index: number, event: Event): void {
    event.preventDefault();
    this.starButtons()[index]?.focus();
  }

  private starButtons(): HTMLButtonElement[] {
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
  }

  private readonly elementRef = inject(ElementRef<HTMLElement>);
}
