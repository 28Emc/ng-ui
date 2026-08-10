import {
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';

@Component({
  selector: 'ui-taginput',
  standalone: true,
  imports: [LucideX],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <div
          class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          (mousedown)="onFieldMousedown()"
        >
          @for (tag of value(); track tag; let i = $index) {
            <span
              class="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {{ tag }}
              <button
                type="button"
                [attr.aria-label]="'Quitar ' + tag"
                [disabled]="disabled() || formDisabled()"
                (mousedown)="$event.preventDefault()"
                (click)="removeTag(i)"
                class="text-brand-500 transition-colors duration-150 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <svg lucideX [size]="12" [strokeWidth]="2.5" />
              </button>
            </span>
          }
          <input
            #inputEl
            type="text"
            [attr.id]="id() || null"
            [placeholder]="placeholder()"
            [value]="draft()"
            [disabled]="disabled() || formDisabled()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
            (paste)="onPaste($event)"
            (blur)="onBlur()"
            class="min-w-24 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
        </div>
      </div>
      @if (error()) {
        <p class="mt-1.5 text-xs text-red-500">{{ error() }}</p>
      }
    </div>
  `,
})
export class TagInputComponent implements ControlValueAccessor {
  readonly value = model<string[]>([]);
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly maxTags = input<number | null>(null);
  readonly validator = input<((tag: string) => string | null) | null>(null);

  protected readonly draft = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly formDisabled = signal(false);

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private _onChange: (value: string[]) => void = () => {};
  private readonly defaultValidators: ((tag: string) => string | null)[] = [
    (tag) => (tag.length === 0 ? 'La etiqueta no puede estar vacía' : null),
    (tag) =>
      this.value().some((existing) => existing.toLowerCase() === tag.toLowerCase())
        ? `"${tag}" ya existe`
        : null,
  ];

  protected onTouched: () => void = () => {};

  protected readonly fieldClasses = computed(() =>
    cn(FIELD_CLASSES, 'flex items-center gap-2', this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  writeValue(value: string[] | null): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onFieldMousedown(): void {
    this.inputEl().nativeElement.focus();
  }

  /**
   * Cancela la activación del <label> contenedor cuando el primer elemento labelable
   * es el botón ✕ de un chip: sin esto, un click en cualquier parte del campo quitaría
   * el primer tag. Solo los clicks directos sobre el ✕ deben eliminar.
   */
  @HostListener('click', ['$event'])
  protected onFieldClick(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.draft.set(text);
    this.error.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commit();
    } else if (event.key === 'Backspace' && !this.draft() && this.value().length > 0) {
      this.removeTag(this.value().length - 1);
    } else if (event.key === 'Escape') {
      this.draft.set('');
      this.error.set(null);
      this.inputEl().nativeElement.value = '';
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').trim();
    if (!text) {
      return;
    }
    const parts = this.splitTags(text);
    if (parts.length === 0) {
      return;
    }
    this.addTags(parts);
    this.draft.set('');
  }

  protected onBlur(): void {
    const parts = this.splitTags(this.draft());
    this.draft.set('');
    this.inputEl().nativeElement.value = '';
    if (parts.length > 0) {
      this.addTags(parts);
    }
  }

  protected commit(): void {
    const parts = this.splitTags(this.draft());
    this.draft.set('');
    this.inputEl().nativeElement.value = '';
    if (parts.length > 0) {
      this.addTags(parts);
    }
  }

  private splitTags(text: string): string[] {
    return text
      .split(/[,;\n]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  protected removeTag(index: number): void {
    const next = this.value().filter((_, i) => i !== index);
    this.value.set(next);
    this._onChange(next);
    this.onTouched();
    this.error.set(null);
    this.inputEl().nativeElement.focus();
  }

  private addTags(tags: string[]): void {
    const added: string[] = [];
    for (const tag of tags) {
      const validation = this.validateTag(tag);
      if (validation) {
        this.error.set(validation);
        break;
      }
      const limit = this.maxTags();
      if (limit !== null && this.value().length + added.length >= limit) {
        this.error.set(`Máximo ${limit} etiquetas`);
        break;
      }
      added.push(tag);
    }
    if (added.length === 0) {
      return;
    }
    const next = [...this.value(), ...added];
    this.value.set(next);
    this._onChange(next);
    this.onTouched();
    this.inputEl().nativeElement.focus();
  }

  private validateTag(tag: string): string | null {
    for (const validate of this.defaultValidators) {
      const message = validate(tag);
      if (message) {
        return message;
      }
    }
    const custom = this.validator();
    return custom ? custom(tag) : null;
  }
}
