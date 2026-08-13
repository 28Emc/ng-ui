import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { LucideArrowDown, LucideArrowUp } from '@lucide/angular';
import { SpinnerComponent } from '../feedback/spinner.component';
import { cn } from '../utils/cn';
import { TableColumn, TableSort } from '../table/table.component';

const DEFAULT_HEIGHT = 400;
const DEFAULT_DISTANCE = 120;

function positiveNumber(fallback: number) {
  return (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
}

@Component({
  selector: 'ui-infinite-scroll-table',
  standalone: true,
  imports: [LucideArrowUp, LucideArrowDown, SpinnerComponent],
  template: `
    <div
      #container
      class="overflow-y-auto rounded-xl border border-default bg-surface"
      [style.maxHeight.px]="height()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (scroll)="onScroll()"
    >
      <table class="w-full text-sm">
        <thead class="sticky top-0 z-10 bg-surface-2">
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [class]="thClasses(col)"
                (click)="col.sortable && sort(col.key)"
                [attr.aria-sort]="sortState().column === col.key ? sortAria() : null"
                [attr.tabindex]="col.sortable ? 0 : null"
                (keydown.enter)="col.sortable && sort(col.key)"
                (keydown.space)="col.sortable && sort(col.key)"
              >
                <div class="flex items-center gap-1.5">
                  <span>{{ col.label }}</span>
                  @if (col.sortable) {
                    <div class="flex flex-col gap-0">
                      <svg
                        lucideArrowUp
                        [size]="12"
                        [strokeWidth]="2"
                        [class]="sortIconClass('asc')"
                      />
                      <svg
                        lucideArrowDown
                        [size]="12"
                        [strokeWidth]="2"
                        [class]="sortIconClass('desc')"
                      />
                    </div>
                  }
                </div>
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          @if (sortedData().length === 0 && !loading()) {
            <tr>
              <td [attr.colspan]="columns().length" class="py-8 text-center text-muted">
                {{ emptyMessage() }}
              </td>
            </tr>
          } @else {
            @for (row of sortedData(); track trackBy()(row)) {
              <tr [class]="trClasses()" (click)="rowClick.emit(row)">
                @for (col of columns(); track col.key) {
                  <td [class]="tdClasses(col)">
                    @if (col.render) {
                      {{ col.render(row) }}
                    } @else {
                      {{ getValue(row, col.key) }}
                    }
                  </td>
                }
              </tr>
            }
            @if (loading()) {
              <tr class="pointer-events-none">
                <td [attr.colspan]="columns().length" class="py-3 text-center">
                  <div class="flex items-center justify-center gap-2 text-sm text-muted">
                    <ui-spinner [size]="16" />
                    <span>Cargando…</span>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class InfiniteScrollTableComponent<T = any> {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input<T[]>([]);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly hasMore = input(false, { transform: booleanAttribute });
  readonly height = input(DEFAULT_HEIGHT, { transform: positiveNumber(DEFAULT_HEIGHT) });
  readonly loadMoreDistance = input(DEFAULT_DISTANCE, {
    transform: positiveNumber(DEFAULT_DISTANCE),
  });
  readonly trackBy = input<(row: T) => string | number>((row: any) => row.id ?? row);
  readonly emptyMessage = input('No hay datos');
  readonly striped = input(false, { transform: booleanAttribute });
  readonly sortState = model<TableSort>({ column: '', direction: 'asc' });

  readonly loadMore = output<void>();
  readonly rowClick = output<T>();

  protected readonly containerEl = viewChild<ElementRef<HTMLDivElement>>('container');

  protected readonly sortedData = computed(() => {
    const { column, direction } = this.sortState();
    if (!column) return this.data();
    return [...this.data()].sort((a, b) => {
      const av = this.getValue(a, column);
      const bv = this.getValue(b, column);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  constructor() {
    afterNextRender(() => this.checkAndLoad());
  }

  protected onScroll(): void {
    this.checkAndLoad();
  }

  protected checkAndLoad(): void {
    const el = this.containerEl()?.nativeElement;
    if (!el || this.loading() || !this.hasMore()) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= this.loadMoreDistance()) {
      this.loadMore.emit();
    }
  }

  protected sort(colKey: string): void {
    const { column, direction } = this.sortState();
    if (column === colKey) {
      this.sortState.set({ column: colKey, direction: direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sortState.set({ column: colKey, direction: 'asc' });
    }
    const el = this.containerEl()?.nativeElement;
    if (el) el.scrollTop = 0;
  }

  protected getValue(row: T, key: string): string {
    const val = (row as any)[key];
    return val ?? '';
  }

  protected sortIconClass(dir: 'asc' | 'desc'): string {
    const { column, direction } = this.sortState();
    return cn(
      'text-muted transition-colors',
      column === this.sortState().column && direction === dir ? 'text-brand-700' : '',
    );
  }

  protected sortAria(): string {
    return this.sortState().direction === 'asc' ? 'ascending' : 'descending';
  }

  protected thClasses(col: TableColumn): string {
    return cn(
      'px-4 py-3 text-left font-medium text-muted',
      col.sortable && 'cursor-pointer select-none hover:text-fg',
      col.align && `text-${col.align}`,
    );
  }

  protected tdClasses(col: TableColumn): string {
    return cn('px-4 py-3', col.align && `text-${col.align}`);
  }

  protected trClasses(): string {
    return cn('transition-colors', this.striped() && 'even:bg-surface-2');
  }
}
