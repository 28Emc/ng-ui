import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ContextMenuComponent, type UiContextMenuItem } from './context-menu.component';

@Component({
  selector: 'ctx-host',
  standalone: true,
  imports: [ContextMenuComponent],
  template: `
    <ui-context-menu [items]="items()" (itemSelected)="onItemSelected($event)">
      <div class="p-4">Zona del menú</div>
    </ui-context-menu>
  `,
})
class CtxHost {
  readonly items = signal<UiContextMenuItem[]>([
    { id: 'rename', label: 'Renombrar', shortcut: 'F2' },
    { id: 'copy', label: 'Copiar', icon: 'file-text', shortcut: 'Ctrl+C' },
    { id: 'sep', separator: true },
    { id: 'delete', label: 'Eliminar', danger: true, disabled: true },
  ]);
  readonly selected: UiContextMenuItem[] = [];

  onItemSelected(item: UiContextMenuItem): void {
    this.selected.push(item);
  }
}

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<CtxHost>;
  let host: CtxHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CtxHost] }).compileComponents();
    fixture = TestBed.createComponent(CtxHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-ctx-trigger]') as HTMLElement;
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.cdk-overlay-container [data-ctx-panel]') as HTMLElement | null;
  }

  function pane(): HTMLElement | null {
    return document.querySelector('.cdk-overlay-pane') as HTMLElement | null;
  }

  function menuItems(): HTMLButtonElement[] {
    const p = panel();
    if (!p) return [];
    return Array.from(p.querySelectorAll('[role="menuitem"]')) as HTMLButtonElement[];
  }

  function open(x = 100, y = 200): void {
    trigger().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, clientX: x, clientY: y }),
    );
    fixture.detectChanges();
  }

  it('shows no panel by default', () => {
    expect(panel()).toBeNull();
  });

  it('opens the panel with the items on contextmenu', () => {
    open();

    expect(panel()).not.toBeNull();
    expect(menuItems().map((b) => b.textContent?.trim())).toEqual([
      'RenombrarF2',
      'CopiarCtrl+C',
      'Eliminar',
    ]);
  });

  it('positions the panel at the pointer coordinates', () => {
    open(150, 250);

    expect(pane()!.style.marginLeft).toBe('150px');
    expect(pane()!.style.marginTop).toBe('250px');
  });

  it('emits itemSelected and closes the panel on item click', () => {
    open();
    menuItems()[0].click();
    fixture.detectChanges();

    expect(host.selected.map((i) => i.id)).toEqual(['rename']);
    expect(panel()).toBeNull();
  });

  it('does not emit for disabled items', () => {
    open();
    expect(menuItems()[1].disabled).toBe(false);
    const disabled = panel()!.querySelector(
      '[role="menuitem"][aria-disabled="true"]',
    ) as HTMLButtonElement;
    disabled.click();
    fixture.detectChanges();

    expect(host.selected).toEqual([]);
    expect(panel()).not.toBeNull();
  });

  it('renders separators and role menu', () => {
    open();

    expect(panel()!.querySelector('[role="separator"]')).not.toBeNull();
    expect(panel()!.getAttribute('role')).toBe('menu');
  });

  it('renders the item icon', () => {
    open();

    expect(panel()!.querySelector('[data-ctx-icon] svg')).not.toBeNull();
  });

  it('closes on Escape', () => {
    open();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });

  it('closes when clicking outside', () => {
    open();
    document.body.click();
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });

  it('opens on ArrowDown from the trigger and navigates with the keyboard', () => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(panel()).not.toBeNull();
    expect(document.activeElement).toBe(menuItems()[0]);
  });

  it('activates the focused item with Enter', () => {
    open();
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.selected.map((i) => i.id)).toEqual(['copy']);
    expect(panel()).toBeNull();
  });
});
