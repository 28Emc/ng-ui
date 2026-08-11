import { Component, computed, input, model, output } from '@angular/core';
import {
  LucideArrowUp,
  LucideArrowDown,
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { cn } from '../utils/cn';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => string | number;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [LucideArrowUp, LucideArrowDown, LucideChevronLeft, LucideChevronRight, ButtonComponent],
  template: `
    <div class="@container overflow-x-auto rounded-xl border border-default">
      <table class="w-full text-sm @narrow:text-xs">
        <thead class="bg-surface-2">
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
          @if (pagedData().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length" class="py-8 text-center text-muted">
                {{ emptyMessage() }}
              </td>
            </tr>
          } @else {
            @for (row of pagedData(); track $index) {
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
          }
        </tbody>
      </table>
    </div>

    @if (showPagination()) {
      <div
        class="@container flex flex-col items-start gap-3 px-1 mt-4 @wide:flex-row @wide:items-center @wide:justify-between"
      >
        <div class="text-sm text-muted">
          Mostrando {{ (page() - 1) * pageSize() + 1 }}–{{
            Math.min(page() * pageSize(), total())
          }}
          de {{ total() }}
        </div>
        <div class="flex items-center gap-2">
          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="page() === 1"
            (click)="prevPage()"
            [attr.aria-label]="'Página anterior'"
          >
            <svg lucideChevronLeft [size]="16" [strokeWidth]="2" />
          </ui-button>
          @for (p of pages(); track p) {
            <ui-button
              variant="ghost"
              size="sm"
              [class]="p === page() ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : ''"
              (click)="goToPage(p)"
              [attr.aria-current]="p === page() ? 'page' : null"
            >
              {{ p }}
            </ui-button>
          }
          <ui-button
            variant="ghost"
            size="sm"
            [disabled]="page() === totalPages()"
            (click)="nextPage()"
            [attr.aria-label]="'Página siguiente'"
          >
            <svg lucideChevronRight [size]="16" [strokeWidth]="2" />
          </ui-button>
        </div>
      </div>
    }
  `,
})
export class TableComponent<T = any> {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input<T[]>([]);
  readonly trackBy = input<(row: T) => string | number>((row: any) => row.id ?? row);
  readonly emptyMessage = input('No hay datos');

  readonly page = model(1);
  readonly pageSize = input(10);
  readonly sortState = model<TableSort>({ column: '', direction: 'asc' });
  readonly showPagination = input(true);
  readonly striped = input(false);

  readonly rowClick = output<T>();

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

  protected readonly pagedData = computed(() => {
    const d = this.sortedData();
    const start = (this.page() - 1) * this.pageSize();
    return d.slice(start, start + this.pageSize());
  });

  protected readonly total = computed(() => this.sortedData().length);
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  protected readonly pages = computed(() => {
    const tp = this.totalPages();
    const cur = this.page();
    const arr: number[] = [];
    const maxVisible = 5;
    if (tp <= maxVisible) {
      for (let i = 1; i <= tp; i++) arr.push(i);
    } else {
      let start = Math.max(1, cur - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
      if (end > tp) {
        end = tp;
        start = tp - maxVisible + 1;
      }
      for (let i = start; i <= end; i++) arr.push(i);
    }
    return arr;
  });

  protected getValue(row: T, key: string): string {
    const val = (row as any)[key];
    return val ?? '';
  }

  protected sort(colKey: string): void {
    const { column, direction } = this.sortState();
    if (column === colKey) {
      this.sortState.set({ column: colKey, direction: direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sortState.set({ column: colKey, direction: 'asc' });
    }
    this.page.set(1);
  }

  protected sortIconClass(dir: 'asc' | 'desc'): string {
    const { column, direction } = this.sortState();
    return cn(
      'text-muted transition-colors',
      column === this.sortState().column && direction === dir ? 'text-brand-600' : '',
    );
  }

  protected sortAria(): string {
    return this.sortState().direction === 'asc' ? 'ascending' : 'descending';
  }

  protected goToPage(p: number): void {
    this.page.set(p);
  }

  protected prevPage(): void {
    if (this.page() > 1) this.page.update((v) => v - 1);
  }

  protected nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((v) => v + 1);
  }

  protected thClasses(col: TableColumn): string {
    return cn(
      'px-4 py-3 text-left font-medium text-muted @narrow:px-3 @narrow:py-2 @wide:px-6',
      col.sortable && 'cursor-pointer select-none hover:text-fg',
      col.align && `text-${col.align}`,
    );
  }

  protected tdClasses(col: TableColumn): string {
    return cn('px-4 py-3 @narrow:px-3 @narrow:py-2 @wide:px-6', col.align && `text-${col.align}`);
  }

  protected trClasses(): string {
    return cn('transition-colors', this.striped() && 'even:bg-surface-2');
  }

  protected Math = Math;
}
