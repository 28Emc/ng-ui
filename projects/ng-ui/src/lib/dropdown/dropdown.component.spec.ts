import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DropdownComponent } from './dropdown.component';
import { MenuItemComponent } from './menu-item.component';
import { MenuDividerComponent } from './menu-divider.component';

@Component({
  selector: 'dropdown-host',
  standalone: true,
  imports: [DropdownComponent, MenuItemComponent, MenuDividerComponent],
  template: `
    <ui-dropdown [label]="label()" [align]="align()">
      <ui-menu-item>Editar</ui-menu-item>
      <ui-menu-divider />
      <ui-menu-item danger>Eliminar</ui-menu-item>
    </ui-dropdown>
  `,
})
class DropdownHost {
  readonly label = signal('Acciones');
  readonly align = signal<'left' | 'right'>('right');
}

describe('DropdownComponent', () => {
  let fixture: ComponentFixture<DropdownHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DropdownHost] }).compileComponents();
    fixture = TestBed.createComponent(DropdownHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  const trigger = () =>
    fixture.nativeElement.querySelector('ui-dropdown > ui-button button') as HTMLButtonElement;
  const menu = () =>
    document.querySelector('.cdk-overlay-container [role="menu"]') as HTMLElement | null;
  const items = () =>
    Array.from(menu()?.querySelectorAll('[role="menuitem"]') ?? []) as HTMLButtonElement[];

  it('renders the trigger with the label', () => {
    expect(trigger().textContent).toContain('Acciones');
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
  });

  it('opens the menu on click and focuses the first item', () => {
    expect(menu()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    const el = menu();
    expect(el).toBeTruthy();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(items()[0].textContent).toContain('Editar');
    expect(document.activeElement).toBe(items()[0]);
  });

  it('closes when a menu item is clicked', () => {
    trigger().click();
    fixture.detectChanges();
    items()[1].click();
    fixture.detectChanges();
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and re-focuses the trigger', () => {
    trigger().click();
    fixture.detectChanges();
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('opens with ArrowDown', () => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeTruthy();
  });

  it('moves focus with arrow keys', () => {
    trigger().click();
    fixture.detectChanges();
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(items()[1]);
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(items()[0]);
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(items()[1]);
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(items()[0]);
    menu()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(items()[1]);
  });

  it('closes on an outside click', () => {
    trigger().click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });

  it('toggles closed when the trigger is clicked again', () => {
    trigger().click();
    fixture.detectChanges();
    expect(menu()).toBeTruthy();
    trigger().click();
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });
});
