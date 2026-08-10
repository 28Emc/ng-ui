import { Component, input, model, TemplateRef, booleanAttribute } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { LucideGripVertical } from '@lucide/angular';

export interface UiDragDropItemContext<T> {
  $implicit: T;
  index: number;
}

export function reorderItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function defaultItemLabel(item: unknown): string {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    return String(obj['label'] ?? obj['name'] ?? obj['title'] ?? '');
  }
  return String(item);
}

@Component({
  selector: 'ui-drag-drop-list',
  standalone: true,
  imports: [DragDropModule, NgTemplateOutlet, LucideGripVertical],
  template: `
    <div
      cdkDropList
      [cdkDropListDisabled]="disabled()"
      (cdkDropListDropped)="onDrop($event)"
      [class.cursor-not-allowed]="disabled()"
      class="flex flex-col gap-2"
    >
      @for (item of items(); track trackBy()(item)) {
        <div
          cdkDrag
          [cdkDragDisabled]="disabled()"
          [class.opacity-50]="disabled()"
          class="group flex items-center gap-3 rounded-xl border border-default bg-surface p-3 shadow-soft transition-colors hover:border-brand-400/60"
        >
          <span class="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-muted">
            {{ $index + 1 }}
          </span>
          @if (itemTemplate(); as tpl) {
            <ng-container *ngTemplateOutlet="tpl; context: { $implicit: item, index: $index }" />
          } @else {
            <span class="flex-1 truncate text-sm text-fg">{{ getLabel()(item) }}</span>
          }
          <button
            type="button"
            cdkDragHandle
            [attr.aria-label]="handleLabel() + ': ' + getLabel()(item)"
            [attr.aria-disabled]="disabled() || null"
            class="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-brand-500/50 active:cursor-grabbing"
          >
            <svg lucideGripVertical [size]="16" [strokeWidth]="2" />
          </button>
        </div>
      }
    </div>
  `,
})
export class DragDropListComponent<T = any> {
  readonly items = model<T[]>([]);
  readonly itemTemplate = input<TemplateRef<UiDragDropItemContext<T>> | null>(null);
  readonly getLabel = input<(item: T) => string>(defaultItemLabel);
  readonly trackBy = input<(item: T) => string | number>((item: any) => item.id ?? item);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly handleLabel = input('Arrastrar');

  protected onDrop(event: CdkDragDrop<T>): void {
    if (this.disabled() || event.previousIndex === event.currentIndex) return;
    const next = reorderItem(this.items(), event.previousIndex, event.currentIndex);
    this.items.set(next);
  }
}
