import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

@Component({
  selector: 'pagination-host',
  standalone: true,
  imports: [PaginationComponent],
  template: `
    <ui-pagination
      [page]="page()"
      [pageSize]="pageSize()"
      [total]="total()"
      (pageChange)="page.set($event)"
    />
  `,
})
class PaginationHost {
  readonly page = signal(3);
  readonly pageSize = signal(10);
  readonly total = signal(120);
}

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationHost>;
  let host: PaginationHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationHost] }).compileComponents();
    fixture = TestBed.createComponent(PaginationHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function buttons(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('ui-button')) as HTMLElement[];
  }

  function infoText(): string {
    return (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
  }

  it('renders the range info', () => {
    expect(infoText()).toContain('Mostrando 21–30 de 120');
  });

  it('renders page buttons with an ellipsis', () => {
    const labels = buttons().map((b) => b.textContent?.trim());
    expect(labels).toEqual(['', '1', '2', '3', '4', '12', '']);
    expect(infoText()).toContain('…');
  });

  it('marks the current page', () => {
    const root = fixture.nativeElement as HTMLElement;
    const current = root.querySelector('ui-button button[aria-current="page"]') as HTMLElement;
    expect(current?.textContent?.trim()).toBe('3');
  });

  it('goes to the previous page', () => {
    const root = fixture.nativeElement as HTMLElement;
    const prev = Array.from(root.querySelectorAll('ui-button button')).find(
      (b) => b.getAttribute('aria-label') === 'Página anterior',
    ) as HTMLButtonElement | undefined;
    prev?.click();
    fixture.detectChanges();
    expect(host.page()).toBe(2);
  });

  it('goes to the last page', () => {
    const last = buttons().find((b) => b.textContent?.trim() === '12');
    last?.click();
    fixture.detectChanges();
    expect(host.page()).toBe(12);
  });

  it('keeps the current page when total is 0', () => {
    host.total.set(0);
    fixture.detectChanges();
    expect(infoText()).toContain('Mostrando 0–0 de 0');
    expect(host.page()).toBe(3);
  });
});
