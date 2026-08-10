import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import type { UiSidebarItem } from './sidebar-item';

const TEST_ITEMS: UiSidebarItem[] = [
  { key: 'inicio', label: 'Inicio', routerLink: ['/'] },
  {
    key: 'proyectos',
    label: 'Proyectos',
    children: [
      { key: 'activos', label: 'Activos', routerLink: ['/proyectos/activos'] },
      { key: 'archivo', label: 'Archivo', href: '/proyectos/archivo' },
    ],
  },
  { key: 'reportes', label: 'Reportes', onClick: () => undefined },
];

@Component({
  selector: 'sidebar-host',
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <ui-sidebar
      [items]="items()"
      [activeKey]="activeKey()"
      (activeKeyChange)="activeKey.set($event)"
      [collapsed]="collapsed()"
      (collapsedChange)="collapsed.set($event)"
      [openKeys]="openKeys()"
      (openKeysChange)="openKeys.set($event)"
      ariaLabel="Menú de prueba"
    />
  `,
})
class SidebarHost {
  readonly items = signal<UiSidebarItem[]>(TEST_ITEMS);
  readonly activeKey = signal<string | null>(null);
  readonly collapsed = signal(false);
  readonly openKeys = signal<string[]>([]);
}

@Component({ selector: 'dummy-page', standalone: true, template: '' })
class DummyPage {}

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarHost>;
  let host: SidebarHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHost],
      providers: [provideRouter([{ path: '**', component: DummyPage }])],
    }).compileComponents();
    fixture = TestBed.createComponent(SidebarHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function rows(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-sidebar-row]'),
    ) as HTMLElement[];
  }

  function row(key: string): HTMLElement {
    const found = rows().find((el) => el.dataset['key'] === key);
    expect(found).toBeTruthy();
    return found as HTMLElement;
  }

  it('renders the nav with the aria-label', () => {
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Menú de prueba');
  });

  it('renders a routerLink item as a link', () => {
    const link = fixture.debugElement.query(By.directive(RouterLink));
    expect(link).toBeTruthy();
    expect((link.nativeElement as HTMLElement).textContent?.trim()).toBe('Inicio');
  });

  it('renders an href child and sets the active key on click', () => {
    row('proyectos').click();
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector(
      'a[href="/proyectos/archivo"]',
    ) as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    anchor.click();
    fixture.detectChanges();
    expect(host.activeKey()).toBe('archivo');
  });

  it('renders a plain item as a button and calls onClick', () => {
    const spy = vi.fn();
    host.items.set([{ key: 'accion', label: 'Acción', onClick: spy }]);
    fixture.detectChanges();
    const button = rows()[0] as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent?.trim()).toBe('Acción');
    button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('toggles a parent submenu on click', () => {
    row('proyectos').click();
    fixture.detectChanges();
    expect(row('proyectos').getAttribute('aria-expanded')).toBe('true');
    expect(row('activos')).toBeTruthy();
    row('proyectos').click();
    fixture.detectChanges();
    expect(row('proyectos').getAttribute('aria-expanded')).toBe('false');
    expect(rows().find((el) => el.dataset['key'] === 'activos')).toBeUndefined();
  });

  it('auto-opens ancestors of the active item', () => {
    host.activeKey.set('archivo');
    fixture.detectChanges();
    expect(host.openKeys()).toContain('proyectos');
    expect(row('archivo')).toBeTruthy();
  });

  it('highlights the active item', () => {
    host.activeKey.set('inicio');
    fixture.detectChanges();
    expect(row('inicio').className).toContain('bg-brand-500/10');
    expect(host.openKeys()).toEqual([]);
  });

  it('renders a badge', () => {
    host.items.set([{ key: 'bandeja', label: 'Bandeja', badge: 3 }]);
    fixture.detectChanges();
    const spans = Array.from(
      fixture.nativeElement.querySelectorAll('[data-sidebar-row] span'),
    ) as HTMLElement[];
    const badge = spans[spans.length - 1];
    expect(badge.textContent?.trim()).toBe('3');
  });

  it('disables an item', () => {
    host.items.set([{ key: 'bloqueado', label: 'Bloqueado', href: '/bloqueado', disabled: true }]);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a[href="/bloqueado"]') as HTMLAnchorElement;
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    const event = new MouseEvent('click', { cancelable: true });
    anchor.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('collapses the rail and hides labels, emitting the new collapsed value', () => {
    const toggle = fixture.nativeElement.querySelector(
      'button[aria-label="Colapsar barra lateral"]',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(host.collapsed()).toBe(true);
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('nav [data-sidebar-row] span.truncate'),
    ) as HTMLElement[];
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((el) => el.classList.contains('hidden'))).toBe(true);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Expandir barra lateral"]'),
    ).toBeTruthy();
  });

  it('opens a flyout menu in collapsed mode and activates a child', () => {
    host.collapsed.set(true);
    fixture.detectChanges();
    row('proyectos').click();
    fixture.detectChanges();
    const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).toBeTruthy();
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    expect(items.map((el) => el.textContent?.trim())).toEqual(['Activos', 'Archivo']);
    items[0].click();
    fixture.detectChanges();
    expect(host.activeKey()).toBe('activos');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it('moves focus with arrow keys (roving tabindex)', () => {
    const first = row('inicio');
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect((document.activeElement as HTMLElement | null)?.dataset['key']).toBe('proyectos');
  });
});
