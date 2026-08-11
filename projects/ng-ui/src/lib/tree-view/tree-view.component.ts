import {
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
  type TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideChevronRight } from '@lucide/angular';
import { cn } from '../utils/cn';

export interface UiTreeNode<T = unknown> {
  id: string;
  label: string;
  children?: readonly UiTreeNode<T>[];
  disabled?: boolean;
  initiallyExpanded?: boolean;
  data?: T;
}

export interface UiTreeItemContext<T> {
  $implicit: UiTreeNode<T>;
  depth: number;
}

export interface UiTreeFlatNode<T> {
  node: UiTreeNode<T>;
  depth: number;
}

function collectInitiallyExpanded<T>(nodes: readonly UiTreeNode<T>[]): string[] {
  const out: string[] = [];
  const walk = (list: readonly UiTreeNode<T>[]): void => {
    for (const node of list) {
      if (node.initiallyExpanded) out.push(node.id);
      if (node.children) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

function hasChildren<T>(node: UiTreeNode<T>): boolean {
  return !!node.children && node.children.length > 0;
}

function buildParentMap<T>(nodes: readonly UiTreeNode<T>[]): Map<string, string | null> {
  const map = new Map<string, string | null>();
  const walk = (list: readonly UiTreeNode<T>[], parent: string | null): void => {
    for (const node of list) {
      map.set(node.id, parent);
      if (node.children) walk(node.children, node.id);
    }
  };
  walk(nodes, null);
  return map;
}

@Component({
  selector: 'ui-tree-view',
  standalone: true,
  imports: [NgTemplateOutlet, LucideChevronRight],
  template: `
    <div
      data-tree
      role="tree"
      [attr.aria-label]="ariaLabel()"
      tabindex="0"
      class="rounded-xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      (keydown)="onKeydown($event)"
    >
      @if (visibleNodes().length === 0) {
        <div class="p-3 text-sm text-muted">{{ emptyText() }}</div>
      } @else {
        @for (entry of visibleNodes(); track entry.node.id) {
          <div
            role="treeitem"
            [attr.data-node-id]="entry.node.id"
            [attr.data-selected]="isSelected(entry.node.id) ? 'true' : null"
            [attr.data-focused]="focusedId() === entry.node.id ? 'true' : null"
            [attr.aria-level]="entry.depth + 1"
            [attr.aria-expanded]="hasChildren(entry.node) ? isExpanded(entry.node.id) : null"
            [attr.aria-selected]="selectable() ? isSelected(entry.node.id) : null"
            [attr.aria-disabled]="entry.node.disabled ? 'true' : null"
            [attr.tabindex]="focusedId() === entry.node.id ? 0 : -1"
            [style.padding-left.px]="8 + entry.depth * 18"
            [class]="itemClasses(entry.node)"
            (click)="onNodeClick(entry.node)"
            (keydown)="onItemKeydown($event)"
          >
            @if (hasChildren(entry.node)) {
              <button
                type="button"
                data-toggle
                [attr.aria-label]="
                  (isExpanded(entry.node.id) ? 'Colapsar' : 'Expandir') + ' ' + entry.node.label
                "
                [attr.aria-expanded]="isExpanded(entry.node.id)"
                (click)="onToggle($event, entry.node.id)"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-surface-2"
              >
                <svg
                  lucideChevronRight
                  [size]="16"
                  [strokeWidth]="2"
                  class="transition-transform"
                  [class]="isExpanded(entry.node.id) ? 'rotate-90' : ''"
                />
              </button>
            } @else {
              <span class="w-6 shrink-0" aria-hidden="true"></span>
            }

            <div data-node-label class="min-w-0 flex-1 truncate text-sm">
              @if (itemTemplate(); as tpl) {
                <ng-container
                  *ngTemplateOutlet="tpl; context: { $implicit: entry.node, depth: entry.depth }"
                />
              } @else {
                <span class="truncate">{{ entry.node.label }}</span>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class TreeViewComponent<T = any> {
  readonly nodes = input<UiTreeNode<T>[]>([]);
  readonly selection = model<string[]>([]);
  readonly expandedIds = model<string[]>([]);
  readonly multiSelect = input(false, { transform: booleanAttribute });
  readonly selectable = input(true, { transform: booleanAttribute });
  readonly itemTemplate = input<TemplateRef<UiTreeItemContext<T>> | null>(null);
  readonly emptyText = input('No hay elementos');
  readonly ariaLabel = input('Árbol de navegación');

  protected readonly focusedId = signal<string | null>(null);

  private readonly initiallyExpandedSet = computed(
    () => new Set(collectInitiallyExpanded(this.nodes())),
  );

  private readonly parentById = computed(() => buildParentMap(this.nodes()));

  protected readonly visibleNodes = computed<UiTreeFlatNode<T>[]>(() => {
    const out: UiTreeFlatNode<T>[] = [];
    const walk = (list: readonly UiTreeNode<T>[], depth: number): void => {
      for (const node of list) {
        out.push({ node, depth });
        if (hasChildren(node) && this.isExpanded(node.id)) {
          walk(node.children as readonly UiTreeNode<T>[], depth + 1);
        }
      }
    };
    walk(this.nodes(), 0);
    return out;
  });

  protected isExpanded(id: string): boolean {
    const current = this.expandedIds();
    if (current.length > 0) return current.includes(id);
    return this.initiallyExpandedSet().has(id);
  }

  protected isSelected(id: string): boolean {
    return this.selection().includes(id);
  }

  protected hasChildren(node: UiTreeNode<T>): boolean {
    return hasChildren(node);
  }

  protected itemClasses(node: UiTreeNode<T>): string {
    return cn(
      'flex items-center gap-1 rounded-md py-1 pr-2 text-fg transition-colors',
      node.disabled && 'cursor-not-allowed opacity-50',
      this.selectable() && !node.disabled && 'cursor-pointer hover:bg-surface-2',
      this.isSelected(node.id) && 'bg-brand-500/15 text-brand-700',
    );
  }

  protected onNodeClick(node: UiTreeNode<T>): void {
    this.selectNode(node);
  }

  protected onToggle(event: Event, id: string): void {
    event.stopPropagation();
    this.toggleExpanded(id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.onKeydownInternal(event);
  }

  protected onItemKeydown(event: KeyboardEvent): void {
    this.onKeydownInternal(event);
  }

  private onKeydownInternal(event: KeyboardEvent): void {
    const flat = this.visibleNodes();
    if (flat.length === 0) return;

    const current = this.focusedId();
    const index = current ? flat.findIndex((entry) => entry.node.id === current) : -1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedId.set(flat[(index + 1) % flat.length].node.id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedId.set(flat[index <= 0 ? flat.length - 1 : index - 1].node.id);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const entry = flat[Math.max(0, index)];
      if (entry && hasChildren(entry.node) && !this.isExpanded(entry.node.id)) {
        this.toggleExpanded(entry.node.id);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const entry = flat[Math.max(0, index)];
      if (entry && hasChildren(entry.node) && this.isExpanded(entry.node.id)) {
        this.toggleExpanded(entry.node.id);
      } else if (entry) {
        const parent = this.parentById().get(entry.node.id) ?? null;
        if (parent) this.focusedId.set(parent);
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const entry = flat[Math.max(0, index)];
      if (entry) this.selectNode(entry.node);
    }
  }

  private toggleExpanded(id: string): void {
    const current =
      this.expandedIds().length > 0 ? this.expandedIds() : collectInitiallyExpanded(this.nodes());
    this.expandedIds.set(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  private selectNode(node: UiTreeNode<T>): void {
    if (!this.selectable() || node.disabled) return;
    const current = this.selection();
    if (this.multiSelect()) {
      this.selection.set(
        current.includes(node.id) ? current.filter((x) => x !== node.id) : [...current, node.id],
      );
    } else {
      this.selection.set([node.id]);
    }
  }
}
