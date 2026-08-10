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
import { LucideCheck, LucideChevronDown, LucideSearch, LucideX } from '@lucide/angular';
import { cn } from '../utils/cn';
import { FIELD_CLASSES, FIELD_INVALID_CLASSES } from '../input/field-base';

export type MultiSelectOption = string | { label: string; value: string; disabled?: boolean };

interface NormalizedOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let uidCounter = 0;

@Component({
  selector: 'ui-multiselect',
  standalone: true,
  imports: [LucideCheck, LucideChevronDown, LucideSearch, LucideX],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div [class]="fieldClasses()">
        <svg lucideSearch [size]="16" [strokeWidth]="2" class="shrink-0 text-muted" />
        <div
          class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          (mousedown)="onFieldMousedown($event)"
        >
          @for (chip of visibleChips(); track chip.value) {
            <span
              class="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {{ chip.label }}
              <button
                type="button"
                [attr.aria-label]="'Quitar ' + chip.label"
                [disabled]="disabled() || formDisabled()"
                (mousedown)="$event.preventDefault()"
                (click)="removeChip($event, chip.value)"
                class="text-brand-500 transition-colors duration-150 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <svg lucideX [size]="12" [strokeWidth]="2.5" />
              </button>
            </span>
          }
          @if (collapsedCount() > 0) {
            <span
              class="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
            >
              +{{ collapsedCount() }}
            </span>
          }
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
            [placeholder]="selectedOptions().length === 0 ? placeholder() : ''"
            [value]="query()"
            [disabled]="disabled() || formDisabled()"
            (input)="onInput($event)"
            (focus)="open()"
            (keydown)="onKeydown($event)"
            (blur)="onBlur()"
            class="min-w-24 flex-1 bg-transparent text-sm text-fg focus-visible:outline-none placeholder:text-muted"
          />
        </div>
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
      <ul
        [id]="listboxId"
        role="listbox"
        aria-multiselectable="true"
        [class]="listboxClasses()"
        [style.max-height]="listMaxHeight()"
      >
        @if (filteredOptions().length === 0) {
          <li class="px-3 py-2 text-sm text-muted">Sin resultados</li>
        } @else {
          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <li
              [id]="optionId(i)"
              role="option"
              [attr.aria-selected]="isSelected(opt.value) ? 'true' : 'false'"
              [attr.aria-disabled]="opt.disabled ? 'true' : 'false'"
              [class]="optionClasses(i)"
              (mousedown)="$event.preventDefault()"
              (mouseenter)="activeIndex.set(i)"
            >
              <span [class]="boxClasses(opt.value)">
                @if (isSelected(opt.value)) {
                  <svg lucideCheck [size]="12" [strokeWidth]="3" class="text-white" />
                }
              </span>
              <span class="min-w-0 flex-1 truncate">{{ opt.label }}</span>
            </li>
          }
        }
      </ul>
    </ng-template>
  `,
})
export class MultiSelectComponent implements ControlValueAccessor {
  readonly value = model<string[]>([]);
  readonly options = input<MultiSelectOption[]>([]);
  readonly placeholder = input('');
  readonly id = input<string>();
  readonly name = input<string>();
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly maxVisibleOptions = input(6);
  readonly maxChips = input(3);

  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly formDisabled = signal(false);
  protected readonly listboxId = `ui-multiselect-${++uidCounter}`;

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private closing = false;
  private _onChange: (value: string[]) => void = () => {};

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

  protected readonly selectedOptions = computed<NormalizedOption[]>(() =>
    this.value().map(
      (value) =>
        this.normalizedOptions().find((option) => option.value === value) ?? {
          label: value,
          value,
        },
    ),
  );

  protected readonly visibleChips = computed(() =>
    this.selectedOptions().slice(0, this.maxChips()),
  );

  protected readonly collapsedCount = computed(() =>
    Math.max(0, this.selectedOptions().length - this.maxChips()),
  );

  protected readonly listMaxHeight = computed(() => {
    const count = Math.max(1, Math.min(this.filteredOptions().length, this.maxVisibleOptions()));
    return `${count * 40 + 12}px`;
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

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected focusSearch(): void {
    this.inputEl().nativeElement.focus();
    if (!this.isOpen()) {
      this.open();
    }
  }

  protected onFieldMousedown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    this.focusSearch();
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
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
        this.toggleOption(active);
      } else if (this.isOpen()) {
        this.close();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Backspace' && !this.query() && this.value().length > 0) {
      this.setValue(this.value().slice(0, -1));
    }
  }

  protected onBlur(): void {
    setTimeout(() => this.close(), 0);
  }

  private readonly onPanelClick = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!target) {
      return;
    }
    const index = Number(target.id.split('-option-')[1]);
    const option = this.filteredOptions()[index];
    if (option) {
      this.toggleOption(option);
    }
  };

  protected toggleOption(option: NormalizedOption): void {
    if (option.disabled) {
      return;
    }
    const current = this.value();
    const next = current.includes(option.value)
      ? current.filter((value) => value !== option.value)
      : [...current, option.value];
    this.setValue(next);
    this.inputEl().nativeElement.focus();
  }

  protected removeChip(event: Event, value: string): void {
    event.stopPropagation();
    this.setValue(this.value().filter((v) => v !== value));
    this.inputEl().nativeElement.focus();
  }

  private setValue(next: string[]): void {
    this.value.set(next);
    this.query.set('');
    this.activeIndex.set(-1);
    this._onChange(next);
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
      'w-full overflow-auto overscroll-contain rounded-xl border border-default bg-surface p-1.5 shadow-pop animate-scale-in',
    );
  }

  protected optionClasses(index: number): string {
    const opt = this.filteredOptions()[index];
    return cn(
      'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      opt?.disabled && 'cursor-not-allowed opacity-50',
      index === this.activeIndex() ? 'bg-surface-2 text-fg' : 'text-fg',
    );
  }

  protected boxClasses(value: string): string {
    return cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150',
      this.isSelected(value) ? 'border-brand-500 bg-brand-500' : 'border-default bg-surface',
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
    this.query.set('');
    this.closing = false;
  }

  private onOverlayDetached(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.activeIndex.set(-1);
      this.query.set('');
      if (this.overlayRef) {
        this.overlayRef.overlayElement.removeEventListener('click', this.onPanelClick);
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }
  }
}
