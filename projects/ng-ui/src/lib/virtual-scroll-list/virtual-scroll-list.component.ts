import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideCheck } from '@lucide/angular';
import { cn } from '../utils/cn';
import { defaultItemLabel } from '../drag-drop-list/drag-drop-list.component';

export interface UiVirtualScrollItemContext<T> {
  $implicit: T;
  index: number;
}

export interface UiVirtualScrollRange {
  readonly start: number;
  readonly end: number;
}

const DEFAULT_HEIGHT = 320;
const DEFAULT_ITEM_HEIGHT = 40;
const DEFAULT_BUFFER = 5;

function positiveNumber(fallback: number) {
  return (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
}

@Component({
  selector: 'ui-virtual-scroll-list',
  standalone: true,
  imports: [NgTemplateOutlet, LucideCheck],
  template: `
    <div
      #viewport
      [attr.role]="selectable() ? 'listbox' : null"
      [attr.aria-label]="selectable() ? ariaLabel() : null"
      [attr.aria-multiselectable]="selectable() ? 'true' : null"
      [attr.tabindex]="selectable() ? 0 : null"
      [style.height.px]="height()"
      class="overflow-y-auto rounded-xl border border-default bg-surface shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      (scroll)="onScroll()"
      (keydown)="onKeydown($event)"
    >
      @if (items().length === 0) {
        <div class="flex h-full items-center justify-center p-4 text-sm text-muted">
          {{ emptyText() }}
        </div>
      } @else {
        <div
          [style.paddingTop.px]="range().paddingTop"
          [style.paddingBottom.px]="range().paddingBottom"
        >
          @for (index of range().indices; track trackBy()(items()[index])) {
            <div
              [attr.data-vs-index]="index"
              [attr.role]="selectable() ? 'option' : null"
              [attr.aria-selected]="selectable() ? isSelected(items()[index]) : null"
              [attr.tabindex]="selectable() ? (focusedIndex() === index ? 0 : -1) : null"
              [style.height.px]="itemHeight()"
              [class]="rowClasses(index)"
              (mousedown)="onRowMousedown(index)"
              (click)="onRowClick(index)"
              (keydown)="onRowKeydown($event, index)"
              (focus)="onRowFocus(index)"
            >
              @if (itemTemplate(); as tpl) {
                <ng-container
                  *ngTemplateOutlet="tpl; context: { $implicit: items()[index], index }"
                />
              } @else {
                <div class="flex h-full items-center gap-2.5 px-3.5 text-sm text-fg">
                  @if (selectable()) {
                    <span
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                      [class]="
                        isSelected(items()[index])
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-default bg-surface-2'
                      "
                    >
                      @if (isSelected(items()[index])) {
                        <svg lucideCheck [size]="12" [strokeWidth]="3" />
                      }
                    </span>
                  }
                  <span class="flex-1 truncate">{{ getLabel()(items()[index]) }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class VirtualScrollListComponent<T = any> {
  readonly items = input<T[]>([]);
  readonly itemHeight = input(DEFAULT_ITEM_HEIGHT, {
    transform: positiveNumber(DEFAULT_ITEM_HEIGHT),
  });
  readonly height = input(DEFAULT_HEIGHT, { transform: positiveNumber(DEFAULT_HEIGHT) });
  readonly buffer = input(DEFAULT_BUFFER, { transform: positiveNumber(DEFAULT_BUFFER) });
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selection = model<T[]>([]);
  readonly itemTemplate = input<TemplateRef<UiVirtualScrollItemContext<T>> | null>(null);
  readonly getLabel = input<(item: T) => string>(defaultItemLabel);
  readonly trackBy = input<(item: T) => unknown>(
    (item) => (item as { id?: unknown })?.['id'] ?? item,
  );
  readonly emptyText = input('No hay elementos');
  readonly ariaLabel = input('Lista');
  readonly rangeChange = output<UiVirtualScrollRange>();
  readonly endReached = output<void>();

  protected readonly viewportEl = viewChild<ElementRef<HTMLDivElement>>('viewport');
  protected readonly scrollTop = signal(0);
  protected readonly focusedIndex = signal(0);

  protected readonly range = computed(() => {
    const count = this.items().length;
    const ih = this.itemHeight();
    if (count === 0 || ih <= 0) {
      return { start: 0, end: 0, indices: [] as number[], paddingTop: 0, paddingBottom: 0 };
    }
    const visible = Math.max(1, Math.ceil(this.height() / ih));
    const firstVisible = Math.max(0, Math.min(count - 1, Math.floor(this.scrollTop() / ih)));
    const start = Math.max(0, firstVisible - this.buffer());
    const end = Math.min(count, start + visible + this.buffer() * 2);
    const indices: number[] = [];
    for (let i = start; i < end; i++) {
      indices.push(i);
    }
    return {
      start,
      end,
      indices,
      paddingTop: start * ih,
      paddingBottom: (count - end) * ih,
    };
  });

  protected readonly selectedSet = computed(() => new Set(this.selection()));

  constructor() {
    afterNextRender(() => this.emitRange());
  }

  protected isSelected(item: T): boolean {
    return this.selectedSet().has(item);
  }

  protected rowClasses(index: number): string {
    return cn(
      'box-border w-full transition-colors hover:bg-surface-2',
      this.selectable() && 'cursor-pointer',
      this.selectable() && this.isSelected(this.items()[index]) && 'bg-brand-500/10',
    );
  }

  protected onScroll(): void {
    const el = this.viewportEl()?.nativeElement;
    if (el) {
      this.scrollTop.set(el.scrollTop);
    }
    this.emitRange();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.selectable()) return;
    const count = this.items().length;
    if (count === 0) return;
    const index = this.focusedIndex();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem(Math.min(count - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem(Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(count - 1);
        break;
    }
  }

  protected onRowKeydown(event: KeyboardEvent, index: number): void {
    if (!this.selectable()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleItem(index);
    }
  }

  protected onRowMousedown(index: number): void {
    this.focusedIndex.set(index);
  }

  protected onRowClick(index: number): void {
    this.focusedIndex.set(index);
    this.toggleItem(index);
  }

  protected onRowFocus(index: number): void {
    this.focusedIndex.set(index);
  }

  protected toggleItem(index: number): void {
    if (!this.selectable()) return;
    const item = this.items()[index];
    if (item === undefined) return;
    const next = new Set(this.selection());
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    this.selection.set([...next]);
  }

  private focusItem(index: number): void {
    this.focusedIndex.set(index);
    this.scrollItemIntoView(index);
    requestAnimationFrame(() => this.focusRowElement(index));
  }

  private scrollItemIntoView(index: number): void {
    const el = this.viewportEl()?.nativeElement;
    if (!el) return;
    const ih = this.itemHeight();
    const top = index * ih;
    const bottom = top + ih;
    const current = el.scrollTop;
    const viewportHeight = el.clientHeight;
    let next = current;
    if (top < current) {
      next = top;
    } else if (bottom > current + viewportHeight) {
      next = bottom - viewportHeight;
    }
    if (next !== current) {
      el.scrollTop = next;
      this.scrollTop.set(next);
      this.emitRange();
    }
  }

  private focusRowElement(index: number): void {
    const el = this.viewportEl()?.nativeElement;
    if (!el) return;
    const r = this.range();
    const row = el.querySelector<HTMLElement>(`[data-vs-index="${index}"]`);
    if (row && index >= r.start && index < r.end) {
      row.focus();
    }
  }

  private emitRange(): void {
    const r = this.range();
    this.rangeChange.emit({ start: r.start, end: r.end });
    if (r.end === this.items().length && this.items().length > 0) {
      this.endReached.emit();
    }
  }
}
