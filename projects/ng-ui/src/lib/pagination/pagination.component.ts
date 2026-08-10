import { Component, computed, input, model } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { cn } from '../utils/cn';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [ButtonComponent, LucideChevronLeft, LucideChevronRight],
  template: `
    <nav [attr.aria-label]="ariaLabel()" class="flex flex-wrap items-center gap-2">
      @if (showInfo()) {
        <span class="mr-2 text-sm text-muted">
          Mostrando {{ from() }}–{{ to() }} de {{ total() }}
        </span>
      }
      <ui-button
        variant="ghost"
        size="sm"
        [disabled]="page() <= 1"
        (click)="go(page() - 1)"
        [ariaLabel]="'Página anterior'"
      >
        <svg lucideChevronLeft [size]="16" [strokeWidth]="2" aria-hidden="true" />
      </ui-button>

      @for (item of pageItems(); track $index) {
        @if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          <span class="px-1 text-sm text-muted" aria-hidden="true">…</span>
        } @else {
          <ui-button
            variant="ghost"
            size="sm"
            [class]="item === page() ? pageButtonActiveClass() : ''"
            [ariaCurrent]="item === page() ? 'page' : null"
            (click)="go(item)"
          >
            {{ item }}
          </ui-button>
        }
      }

      <ui-button
        variant="ghost"
        size="sm"
        [disabled]="page() >= totalPages()"
        (click)="go(page() + 1)"
        [ariaLabel]="'Página siguiente'"
      >
        <svg lucideChevronRight [size]="16" [strokeWidth]="2" aria-hidden="true" />
      </ui-button>
    </nav>
  `,
})
export class PaginationComponent {
  readonly page = model(1);
  readonly pageSize = input(10);
  readonly total = input(0);
  readonly siblingCount = input(1);
  readonly showInfo = input(true);
  readonly ariaLabel = input('Paginación');

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  protected readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected readonly pageItems = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const siblings = this.siblingCount();
    const items: PageItem[] = [];

    const visibleRange = new Set<number>();
    for (let i = Math.max(1, current - siblings); i <= Math.min(total, current + siblings); i++) {
      visibleRange.add(i);
    }
    visibleRange.add(1);
    visibleRange.add(total);

    const sorted = [...visibleRange].sort((a, b) => a - b);
    let prev = 0;
    for (const pageNum of sorted) {
      if (pageNum - prev > 1) {
        items.push('ellipsis-start');
      }
      items.push(pageNum);
      prev = pageNum;
    }
    return items;
  });

  protected pageButtonActiveClass(): string {
    return cn(
      'bg-brand-500/10 text-brand-600 dark:text-brand-400',
      'focus-visible:ring-brand-500/50',
    );
  }

  protected go(pageNum: number): void {
    const next = Math.min(Math.max(pageNum, 1), this.totalPages());
    if (next !== this.page()) {
      this.page.set(next);
    }
  }
}
