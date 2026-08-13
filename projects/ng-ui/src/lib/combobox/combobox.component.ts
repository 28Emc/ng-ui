import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
  booleanAttribute,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { filter } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideChevronDown, LucideSearch } from '@lucide/angular';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';

export type ComboboxOption = string | { label: string; value: string };

interface NormalizedOption {
  label: string;
  value: string;
}

let uidCounter = 0;

@Component({
  selector: 'ui-combobox',
  standalone: true,
  imports: [LucideChevronDown, LucideSearch],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <svg lucideSearch [size]="16" [strokeWidth]="2" class="shrink-0 text-muted" />
        <input
          #inputEl
          type="text"
          role="combobox"
          autocomplete="off"
          [attr.id]="id() || null"
          [attr.name]="name() || null"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="listboxId"
          [attr.aria-activedescendant]="activeDescendant()"
          aria-autocomplete="list"
          [placeholder]="placeholder()"
          [value]="displayText()"
          [disabled]="disabled() || formDisabled()"
          (input)="onInput($event)"
          (focus)="open()"
          (keydown)="onKeydown($event)"
          (blur)="onBlur()"
          class="w-full min-w-0 flex-1 bg-transparent text-sm text-fg focus-visible:outline-none placeholder:text-muted"
        />
        <button
          type="button"
          [disabled]="disabled() || formDisabled()"
          [attr.aria-label]="'Alternar opciones'"
          (click)="toggle()"
          class="-mr-1 shrink-0 rounded-md p-1 text-muted transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <svg lucideChevronDown [size]="16" [strokeWidth]="2" [class]="chevronClasses()" />
        </button>
      </div>
    </div>

    <ng-template #panel>
      <ul [id]="listboxId" role="listbox" [class]="listboxClasses()">
        @if (filteredOptions().length === 0) {
          <li class="px-3 py-2 text-sm text-muted">Sin resultados</li>
        } @else {
          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <li
              [id]="optionId(i)"
              role="option"
              [attr.aria-selected]="opt.value === value() ? 'true' : 'false'"
              [class]="optionClasses(i)"
              (mousedown)="$event.preventDefault()"
              (mouseenter)="activeIndex.set(i)"
            >
              {{ opt.label }}
            </li>
          }
        }
      </ul>
    </ng-template>
  `,
})
export class ComboboxComponent implements ControlValueAccessor {
  readonly value = model<string | null>(null);
  readonly options = input<ComboboxOption[]>([]);
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly name = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly editing = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly formDisabled = signal(false);
  protected readonly listboxId = `ui-combobox-${++uidCounter}`;

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private _onChange: (value: string | null) => void = () => {};

  protected onTouched: () => void = () => {};

  protected readonly normalizedOptions = computed<NormalizedOption[]>(() =>
    this.options().map((option) =>
      typeof option === 'string' ? { label: option, value: option } : option,
    ),
  );

  protected readonly filteredOptions = computed<NormalizedOption[]>(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.normalizedOptions();
    }
    return this.normalizedOptions().filter((option) => option.label.toLowerCase().includes(query));
  });

  protected readonly selectedOption = computed<NormalizedOption | null>(
    () => this.normalizedOptions().find((option) => option.value === this.value()) ?? null,
  );

  protected readonly displayText = computed(() => {
    if (this.editing()) {
      return this.query();
    }
    return this.selectedOption()?.label ?? '';
  });

  protected readonly chevronClasses = computed(() =>
    cn('transition-transform duration-150', this.isOpen() ? 'rotate-180' : ''),
  );

  protected readonly fieldClasses = computed(() =>
    cn(FIELD_CLASSES, 'flex items-center gap-2', this.invalid() ? FIELD_INVALID_CLASSES : ''),
  );

  protected readonly activeDescendant = computed(() =>
    this.isOpen() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  private readonly onPanelClick = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!target) {
      return;
    }
    const index = Number(target.id.split('-option-')[1]);
    const option = this.filteredOptions()[index];
    if (option) {
      this.select(option);
    }
  };

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.editing.set(true);
    this.activeIndex.set(-1);
    if (!this.isOpen()) {
      this.open();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const count = this.filteredOptions().length;
      if (count === 0) {
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const current = this.activeIndex();
      this.activeIndex.set((current + delta + count) % count);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = this.filteredOptions()[this.activeIndex()];
      if (active) {
        this.select(active);
      } else if (this.isOpen()) {
        this.close();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  protected onBlur(): void {
    this.editing.set(false);
    const text = this.query().trim();
    if (!text) {
      this.clearValue();
      return;
    }
    const exact = this.normalizedOptions().find(
      (option) => option.label.toLowerCase() === text.toLowerCase(),
    );
    if (exact) {
      this.setValue(exact);
    } else {
      this.clearValue();
    }
  }

  protected select(option: NormalizedOption): void {
    this.setValue(option);
    this.close();
    this.inputEl().nativeElement.focus();
  }

  private setValue(option: NormalizedOption): void {
    this.value.set(option.value);
    this.query.set(option.label);
    this.editing.set(false);
    this._onChange(option.value);
    this.onTouched();
  }

  private clearValue(): void {
    this.value.set(null);
    this.query.set('');
    this.editing.set(false);
    this._onChange(null);
    this.onTouched();
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected listboxClasses(): string {
    return cn(
      'max-h-64 w-full overflow-auto overscroll-contain rounded-xl border border-default bg-surface p-1.5 shadow-pop animate-scale-in',
    );
  }

  protected optionClasses(index: number): string {
    const opt = this.filteredOptions()[index];
    return cn(
      'cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      opt && opt.value === this.value()
        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400'
        : index === this.activeIndex()
          ? 'bg-surface-2 text-fg'
          : 'text-fg',
    );
  }

  protected open(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      width: this.inputEl().nativeElement.getBoundingClientRect().width,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.inputEl())
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 8,
          },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.elementRef.nativeElement.contains(event.target as Node)) {
        this.close();
      }
    });
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.close());
    this.overlayRef.detachments().subscribe(() => this.onOverlayDetached());
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.overlayRef.overlayElement.addEventListener('click', this.onPanelClick);
    this.isOpen.set(true);
  }

  protected close(): void {
    if (this.closing) return;
    this.closing = true;
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.overlayElement.removeEventListener('click', this.onPanelClick);
      ref.detach();
      ref.dispose();
    }
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.closing = false;
  }

  private onOverlayDetached(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.activeIndex.set(-1);
      if (this.overlayRef) {
        this.overlayRef.overlayElement.removeEventListener('click', this.onPanelClick);
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }
}
