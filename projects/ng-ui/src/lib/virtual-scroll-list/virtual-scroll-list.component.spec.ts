import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VirtualScrollListComponent } from './virtual-scroll-list.component';

interface Item {
  id: number;
  label: string;
}

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, label: `Ítem ${i}` }));
}

@Component({
  selector: 'vs-host',
  standalone: true,
  imports: [VirtualScrollListComponent],
  template: `
    <ui-virtual-scroll-list
      [items]="items()"
      [height]="320"
      [itemHeight]="40"
      [selectable]="selectable()"
      [selection]="selection()"
      (selectionChange)="selection.set($event)"
      [emptyText]="emptyText()"
      (rangeChange)="ranges.push($event)"
      (endReached)="reached = reached + 1"
    />
  `,
})
class VsHost {
  readonly items = signal<Item[]>(makeItems(1000));
  readonly selectable = signal(true);
  readonly selection = signal<Item[]>([]);
  readonly emptyText = signal('Vacío');
  readonly ranges: { start: number; end: number }[] = [];
  reached = 0;
}

@Component({
  selector: 'vs-template-host',
  standalone: true,
  imports: [VirtualScrollListComponent],
  template: `
    <ui-virtual-scroll-list
      [items]="items()"
      [height]="160"
      [itemHeight]="40"
      [itemTemplate]="row"
      [trackBy]="trackById"
    >
      <ng-template #row let-item let-index="index">
        <div class="flex h-full items-center px-3 text-sm">
          <b>{{ index }} </b><span class="ml-2">{{ item.label }}</span>
        </div>
      </ng-template>
    </ui-virtual-scroll-list>
  `,
})
class VsTemplateHost {
  readonly items = signal<Item[]>(makeItems(20));
  readonly trackById = (item: Item) => item.id;
}

describe('VirtualScrollListComponent', () => {
  let fixture: ComponentFixture<VsHost>;
  let host: VsHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VsHost, VsTemplateHost] }).compileComponents();
    fixture = TestBed.createComponent(VsHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function viewport(): HTMLElement {
    return fixture.nativeElement.querySelector('ui-virtual-scroll-list > div') as HTMLElement;
  }

  function rows(): HTMLElement[] {
    return Array.from(viewport().querySelectorAll('[data-vs-index]')) as HTMLElement[];
  }

  it('renders only the visible window of a large dataset', () => {
    expect(rows().length).toBeLessThanOrEqual(20);
    expect(rows().length).toBeGreaterThan(0);
    expect(rows()[0].getAttribute('data-vs-index')).toBe('0');
    const inner = viewport().firstElementChild as HTMLElement;
    const top = Number.parseFloat(inner.style.paddingTop) || 0;
    const bottom = Number.parseFloat(inner.style.paddingBottom) || 0;
    expect(top + rows().length * 40 + bottom).toBe(1000 * 40);
  });

  it('updates the window while scrolling', () => {
    viewport().scrollTop = 4000;
    viewport().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    const first = rows()[0].getAttribute('data-vs-index');
    expect(Number(first)).toBe(95);
    expect(Number(first)).toBeGreaterThan(0);
  });

  it('keeps a small dataset fully rendered', () => {
    host.items.set(makeItems(5));
    fixture.detectChanges();
    expect(rows().length).toBe(5);
    expect(rows().map((r) => r.getAttribute('data-vs-index'))).toEqual(['0', '1', '2', '3', '4']);
  });

  it('shows the empty text when there are no items', () => {
    host.items.set([]);
    fixture.detectChanges();
    expect(viewport().textContent?.trim()).toContain('Vacío');
    expect(rows().length).toBe(0);
  });

  it('toggles items in the selection model and mirrors aria-selected', () => {
    const row = rows()[0] as HTMLElement;
    expect(row.getAttribute('role')).toBe('option');
    expect(row.getAttribute('aria-selected')).toBe('false');

    row.click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([host.items()[0]]);
    expect(rows()[0].getAttribute('aria-selected')).toBe('true');

    row.click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([]);
  });

  it('does not toggle when selectable is false', () => {
    host.selectable.set(false);
    fixture.detectChanges();
    rows()[0].click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([]);
  });

  it('navigates with the keyboard and toggles with Enter', () => {
    const container = viewport();
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(rows()[0].getAttribute('tabindex')).toBe('-1');
    expect(rows()[1].getAttribute('tabindex')).toBe('0');

    rows()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(host.selection()).toEqual([host.items()[1]]);

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    const last = rows()[rows().length - 1];
    expect(last.getAttribute('tabindex')).toBe('0');

    last.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();
    expect(host.selection()).toEqual([host.items()[1], host.items()[999]]);
  });

  it('emits rangeChange and endReached while scrolling', () => {
    viewport().scrollTop = 4000;
    viewport().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    const last = host.ranges[host.ranges.length - 1];
    expect(last.start).toBe(95);
    expect(last.end).toBeGreaterThan(last.start);

    const maxScroll = 1000 * 40 - 320;
    viewport().scrollTop = maxScroll;
    viewport().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(host.ranges[host.ranges.length - 1].end).toBe(1000);
    expect(host.reached).toBeGreaterThanOrEqual(1);
  });

  it('renders items through a custom template', () => {
    const tFixture = TestBed.createComponent(VsTemplateHost);
    tFixture.detectChanges();
    const tViewport = tFixture.nativeElement.querySelector(
      'ui-virtual-scroll-list > div',
    ) as HTMLElement;
    const text = tViewport.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    expect(text).toContain('0 Ítem 0');
    expect(tViewport.querySelectorAll('[data-vs-index]').length).toBe(14);
  });

  it('exposes the component for direct use', () => {
    const comp = fixture.debugElement.query(By.directive(VirtualScrollListComponent))
      .componentInstance as VirtualScrollListComponent<Item>;
    expect(comp).toBeDefined();
    expect(comp.items().length).toBe(1000);
  });
});
