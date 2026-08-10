import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MenuItemComponent } from './menu-item.component';
import { MenuDividerComponent } from './menu-divider.component';

@Component({
  selector: 'menu-host',
  standalone: true,
  imports: [MenuItemComponent, MenuDividerComponent],
  template: `
    <ui-menu-item [danger]="danger()">Editar</ui-menu-item>
    <ui-menu-divider />
    <ui-menu-item>Eliminar</ui-menu-item>
  `,
})
class MenuHost {
  readonly danger = signal(false);
}

describe('MenuItemComponent', () => {
  let fixture: ComponentFixture<MenuHost>;
  let host: MenuHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuHost] }).compileComponents();
    fixture = TestBed.createComponent(MenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a menuitem button with projected content', () => {
    const btn = fixture.nativeElement.querySelector('button[role="menuitem"]') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Editar');
  });

  it('uses neutral hover styles by default', () => {
    const btn = fixture.nativeElement.querySelector('button[role="menuitem"]') as HTMLButtonElement;
    expect(btn.classList.contains('text-fg')).toBe(true);
    expect(btn.classList.contains('hover:bg-surface-2')).toBe(true);
  });

  it('applies danger styles when enabled', () => {
    host.danger.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[role="menuitem"]') as HTMLButtonElement;
    expect(btn.classList.contains('text-red-600')).toBe(true);
  });
});

describe('MenuDividerComponent', () => {
  let fixture: ComponentFixture<MenuHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuHost] }).compileComponents();
    fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();
  });

  it('renders a divider', () => {
    const divider = fixture.nativeElement.querySelector('ui-menu-divider div') as HTMLElement;
    expect(divider.classList.contains('border-t')).toBe(true);
  });
});
