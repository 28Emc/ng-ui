import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TableComponent, TableColumn, TableSort } from './table.component';

@Component({
  selector: 'table-host',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns()"
      [data]="data()"
      [showPagination]="showPagination()"
      [(page)]="page"
      [(sortState)]="sort"
      (rowClick)="clicked.set($event)"
    />
  `,
})
class TableHost {
  readonly columns = signal<TableColumn[]>([
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'age', label: 'Edad', sortable: true },
  ]);
  readonly data = signal<{ name: string; age: number }[]>([
    { name: 'Ana', age: 30 },
    { name: 'Luis', age: 25 },
    { name: 'Carlos', age: 35 },
    { name: 'Diana', age: 28 },
    { name: 'Eva', age: 22 },
    { name: 'Fran', age: 40 },
    { name: 'Gaby', age: 33 },
    { name: 'Hugo', age: 27 },
    { name: 'Iris', age: 31 },
    { name: 'Juan', age: 29 },
    { name: 'Kira', age: 24 },
  ]);
  readonly page = signal(1);
  readonly sort = signal<TableSort>({ column: '', direction: 'asc' });
  readonly showPagination = signal(true);
  readonly clicked = signal<unknown>(null);
}

describe('TableComponent', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableHost] }).compileComponents();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  it('paginates to the first 10 rows', () => {
    expect(rows().length).toBe(10);
    expect(firstCell(rows()[0])).toBe('Ana');
  });

  it('shows pagination info', () => {
    expect(fixture.nativeElement.textContent).toContain('Mostrando 1–10 de 11');
  });

  it('sorts ascending on column click', () => {
    const ageTh = fixture.nativeElement.querySelectorAll('th')[1];
    ageTh.click();
    fixture.detectChanges();
    expect(host.sort().column).toBe('age');
    expect(host.sort().direction).toBe('asc');
    expect(firstCell(rows()[0])).toBe('Eva');
    expect(ageTh.getAttribute('aria-sort')).toBe('ascending');
  });

  it('toggles to descending on second click', () => {
    const ageTh = fixture.nativeElement.querySelectorAll('th')[1];
    ageTh.click();
    fixture.detectChanges();
    ageTh.click();
    fixture.detectChanges();
    expect(host.sort().direction).toBe('desc');
    expect(firstCell(rows()[0])).toBe('Fran');
  });

  it('moves to the next page', () => {
    const next = fixture.nativeElement.querySelector(
      '[aria-label="Página siguiente"]',
    ) as HTMLButtonElement;
    next.click();
    fixture.detectChanges();
    expect(host.page()).toBe(2);
    expect(rows().length).toBe(1);
    expect(firstCell(rows()[0])).toBe('Kira');
    expect(fixture.nativeElement.textContent).toContain('Mostrando 11–11 de 11');
  });

  it('goes back to the previous page', () => {
    const next = fixture.nativeElement.querySelector(
      '[aria-label="Página siguiente"]',
    ) as HTMLButtonElement;
    const prev = fixture.nativeElement.querySelector(
      '[aria-label="Página anterior"]',
    ) as HTMLButtonElement;
    next.click();
    fixture.detectChanges();
    prev.click();
    fixture.detectChanges();
    expect(host.page()).toBe(1);
    expect(firstCell(rows()[0])).toBe('Ana');
  });

  it('shows the empty message when there is no data', () => {
    host.data.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay datos');
  });

  it('emits rowClick on row click', () => {
    rows()[0].click();
    expect(host.clicked()).toEqual({ name: 'Ana', age: 30 });
  });

  it('resets to page 1 when sorting', () => {
    const next = fixture.nativeElement.querySelector(
      '[aria-label="Página siguiente"]',
    ) as HTMLButtonElement;
    next.click();
    fixture.detectChanges();
    expect(host.page()).toBe(2);
    const ageTh = fixture.nativeElement.querySelectorAll('th')[1];
    ageTh.click();
    fixture.detectChanges();
    expect(host.page()).toBe(1);
  });

  it('sets up the scroll wrapper as a query container', () => {
    const wrapper = fixture.nativeElement.querySelector('div.overflow-x-auto') as HTMLElement;
    expect(wrapper.classList.contains('@container')).toBe(true);
  });

  it('adds container-query sizing to cells', () => {
    const th = fixture.nativeElement.querySelector('th') as HTMLElement;
    const td = fixture.nativeElement.querySelector('td') as HTMLElement;
    expect(th.classList.contains('@narrow:px-3')).toBe(true);
    expect(th.classList.contains('@wide:px-6')).toBe(true);
    expect(td.classList.contains('@narrow:px-3')).toBe(true);
    expect(td.classList.contains('@wide:px-6')).toBe(true);
  });

  it('stacks the pagination bar and widens it at container wide', () => {
    const prevBtn = fixture.nativeElement.querySelector(
      '[aria-label="Página anterior"]',
    ) as HTMLElement;
    const bar = prevBtn.closest('.\\@container') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.classList.contains('flex-col')).toBe(true);
    expect(bar.classList.contains('@wide:flex-row')).toBe(true);
  });
});
