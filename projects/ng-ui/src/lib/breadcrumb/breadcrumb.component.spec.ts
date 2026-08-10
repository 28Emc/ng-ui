import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';
import type { UiBreadcrumbItem } from './breadcrumb-item';

const TEST_ITEMS: UiBreadcrumbItem[] = [
  { label: 'Inicio', routerLink: ['/'] },
  { label: 'Proyectos', href: '/projects' },
  { label: 'Detalle', onClick: () => undefined },
];

@Component({
  selector: 'breadcrumb-host',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <ui-breadcrumb [items]="items()" [maxItems]="maxItems()" ariaLabel="Ruta de prueba" />
  `,
})
class BreadcrumbHost {
  readonly items = signal<UiBreadcrumbItem[]>(TEST_ITEMS);
  readonly maxItems = signal<number | null>(null);
}

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbHost>;
  let host: BreadcrumbHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbHost],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BreadcrumbHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function labels(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('nav a, nav button, nav span'))
      .map((el) => (el as HTMLElement).textContent?.trim() ?? '')
      .filter((text) => text.length > 0);
  }

  function visibleLabels(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('nav [data-crumb]') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim() ?? '');
  }

  it('renders all items in order', () => {
    expect(labels()).toEqual(['Inicio', 'Proyectos', 'Detalle']);
  });

  it('sets the nav aria-label', () => {
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Ruta de prueba');
  });

  it('renders a routerLink item as a link', () => {
    const link = fixture.debugElement.query(By.directive(RouterLink));
    expect(link).toBeTruthy();
    expect((link.nativeElement as HTMLElement).textContent?.trim()).toBe('Inicio');
  });

  it('renders an href item as an anchor', () => {
    const anchor = fixture.nativeElement.querySelector('a[href="/projects"]') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('aria-disabled')).toBeNull();
  });

  it('marks the last item as the current page', () => {
    const spans = Array.from(fixture.nativeElement.querySelectorAll('nav span')) as HTMLElement[];
    const current = spans.find((s) => s.getAttribute('aria-current') === 'page') as HTMLElement;
    expect(current).toBeTruthy();
    expect(current.textContent?.trim()).toBe('Detalle');
  });

  it('calls onClick when a button item is clicked', () => {
    const spy = vi.fn();
    host.items.set([{ label: 'Inicio' }, { label: 'Acción', onClick: spy }, { label: 'Final' }]);
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('nav button'),
    ) as HTMLButtonElement[];
    const action = buttons.find((b) => b.textContent?.trim() === 'Acción') as HTMLButtonElement;
    action.click();
    expect(spy).toHaveBeenCalled();
  });

  it('prevents navigation on a disabled item', () => {
    host.items.set([
      { label: 'Inicio' },
      { label: 'Bloqueado', href: '/blocked', disabled: true },
      { label: 'Final' },
    ]);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a[href="/blocked"]') as HTMLAnchorElement;
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    const event = new MouseEvent('click', { cancelable: true });
    anchor.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('collapses the middle items with maxItems and opens the overflow menu', () => {
    const middleSpy = vi.fn();
    host.items.set([
      { label: 'Inicio', routerLink: ['/'] },
      { label: 'Oculto 1', onClick: middleSpy },
      { label: 'Oculto 2', onClick: () => undefined },
      { label: 'Oculto 3', onClick: () => undefined },
      { label: 'Actual' },
    ]);
    host.maxItems.set(2);
    fixture.detectChanges();

    expect(visibleLabels().join(',')).toBe('Inicio,Actual');
    const trigger = fixture.nativeElement.querySelector(
      'nav button[aria-label="Ver más niveles"]',
    ) as HTMLButtonElement;
    expect(trigger).toBeTruthy();

    trigger.click();
    fixture.detectChanges();
    const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).toBeTruthy();
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    expect(items.map((el) => el.textContent?.trim())).toEqual(['Oculto 1', 'Oculto 2', 'Oculto 3']);

    items[0].click();
    expect(middleSpy).toHaveBeenCalled();
  });

  it('collapses responsively when the content overflows', async () => {
    host.items.set([
      { label: 'Inicio', routerLink: ['/'] },
      { label: 'Uno', routerLink: ['/uno'] },
      { label: 'Dos', routerLink: ['/dos'] },
      { label: 'Tres', routerLink: ['/tres'] },
      { label: 'Actual' },
    ]);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    Object.defineProperty(nav, 'scrollWidth', { value: 1200, configurable: true });
    Object.defineProperty(nav, 'clientWidth', { value: 200, configurable: true });
    host.items.set([
      { label: 'Inicio', routerLink: ['/'] },
      { label: 'Uno', routerLink: ['/uno'] },
      { label: 'Dos', routerLink: ['/dos'] },
      { label: 'Tres', routerLink: ['/tres'] },
      { label: 'Actual' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(visibleLabels()).toEqual(['Inicio', 'Actual']);
    expect(
      fixture.nativeElement.querySelector('nav button[aria-label="Ver más niveles"]'),
    ).toBeTruthy();
  });
});
