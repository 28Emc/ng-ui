import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InfiniteScrollTableComponent } from './infinite-scroll-table.component';
import { TableColumn, TableSort } from '../table/table.component';

interface Row {
  id: number;
  name: string;
  age: number;
}

function makeRows(count: number, start = 0): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    name: `Usuario ${start + i}`,
    age: 20 + ((start + i) % 40),
  }));
}

@Component({
  selector: 'ist-host',
  standalone: true,
  imports: [InfiniteScrollTableComponent],
  template: `
    <ui-infinite-scroll-table
      [columns]="columns()"
      [data]="data()"
      [loading]="loading()"
      [hasMore]="hasMore()"
      [height]="height()"
      [striped]="striped()"
      [(sortState)]="sort"
      (loadMore)="onLoadMore()"
      (rowClick)="clicked.set($event)"
    />
  `,
})
class IstHost {
  readonly columns = signal<TableColumn[]>([
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'age', label: 'Edad', sortable: true, align: 'right' },
  ]);
  readonly data = signal<Row[]>(makeRows(5));
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly height = signal(400);
  readonly striped = signal(false);
  readonly sort = signal<TableSort>({ column: '', direction: 'asc' });
  readonly clicked = signal<unknown>(null);
  loadCount = 0;

  onLoadMore(): void {
    this.loadCount++;
    this.loading.set(true);
    this.data.update((d) => [...d, ...makeRows(20, d.length)]);
    this.loading.set(false);
  }
}

describe('InfiniteScrollTableComponent', () => {
  let fixture: ComponentFixture<IstHost>;
  let host: IstHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IstHost] }).compileComponents();
    fixture = TestBed.createComponent(IstHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const container = (): HTMLElement =>
    fixture.nativeElement.querySelector('ui-infinite-scroll-table > div') as HTMLElement;
  const rows = (): HTMLTableRowElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
  const firstCell = (r: HTMLTableRowElement): string =>
    r.querySelector('td')?.textContent?.trim() ?? '';

  it('renders column headers', () => {
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('th') as NodeListOf<HTMLElement>,
    ).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Nombre', 'Edad']);
  });

  it('renders the provided rows', () => {
    expect(rows().length).toBe(5);
    expect(firstCell(rows()[0])).toBe('Usuario 0');
  });

  it('keeps the header sticky', () => {
    const thead = fixture.nativeElement.querySelector('thead') as HTMLElement;
    expect(thead.classList.contains('sticky')).toBe(true);
    expect(thead.classList.contains('top-0')).toBe(true);
  });

  it('emits loadMore when the data does not fill the container', () => {
    expect(host.loadCount).toBe(1);
  });

  it('does not auto-emit again until data changes', () => {
    fixture.detectChanges();
    expect(host.loadCount).toBe(1);
  });

  it('emits loadMore on scroll when near the bottom', () => {
    const before = host.loadCount;
    container().dispatchEvent(new Event('scroll'));
    expect(host.loadCount).toBe(before + 1);
  });

  it('does not emit loadMore when hasMore is false', () => {
    host.hasMore.set(false);
    fixture.detectChanges();
    const before = host.loadCount;
    container().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(host.loadCount).toBe(before);
  });

  it('does not emit loadMore while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();
    const before = host.loadCount;
    container().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(host.loadCount).toBe(before);
  });

  it('renders a loading row while loading', () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando…');
    expect(container().getAttribute('aria-busy')).toBe('true');
    expect(container().querySelector('ui-spinner')).toBeTruthy();
  });

  it('sorts ascending on column click', () => {
    const ageTh = fixture.nativeElement.querySelectorAll('th')[1];
    ageTh.click();
    fixture.detectChanges();
    expect(host.sort().column).toBe('age');
    expect(host.sort().direction).toBe('asc');
    expect(ageTh.getAttribute('aria-sort')).toBe('ascending');
  });

  it('toggles to descending on second click', () => {
    const ageTh = fixture.nativeElement.querySelectorAll('th')[1];
    ageTh.click();
    fixture.detectChanges();
    ageTh.click();
    fixture.detectChanges();
    expect(host.sort().direction).toBe('desc');
    expect(host.sort().column).toBe('age');
  });

  it('applies striped classes', () => {
    host.striped.set(true);
    fixture.detectChanges();
    const tr = fixture.nativeElement.querySelector('tbody tr') as HTMLElement;
    expect(tr.classList.contains('even:bg-surface-2')).toBe(true);
  });

  it('shows the empty message when there is no data', () => {
    host.data.set([]);
    host.hasMore.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay datos');
  });

  it('emits rowClick on row click', () => {
    rows()[0].click();
    expect(host.clicked()).toEqual({ id: 0, name: 'Usuario 0', age: 20 });
  });
});
