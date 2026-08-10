import { Component, signal } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DrawerComponent } from './drawer.component';
import { UiDrawerFooterDirective } from './drawer-footer.directive';

@Component({
  selector: 'drawer-host',
  standalone: true,
  imports: [DrawerComponent, UiDrawerFooterDirective],
  template: `
    <ui-drawer
      [open]="open()"
      (openChange)="open.set($event)"
      [title]="title()"
      [subtitle]="subtitle()"
      [width]="width()"
      [autoFocus]="autoFocus()"
    >
      Contenido del drawer
      <div uiDrawerFooter>Pie</div>
    </ui-drawer>
  `,
})
class DrawerHost {
  readonly open = signal(false);
  readonly title = signal('Ajustes');
  readonly subtitle = signal('Preferencias de cuenta');
  readonly width = signal('w-96');
  readonly autoFocus = signal(true);
}

describe('DrawerComponent', () => {
  let fixture: ComponentFixture<DrawerHost>;
  let host: DrawerHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(DrawerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  const dialog = () =>
    document.querySelector('.cdk-overlay-container [role="dialog"]') as HTMLElement | null;
  const backdrop = () => document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
  const closeButton = () =>
    dialog()?.querySelector('ui-button[aria-label="Cerrar"] button') as HTMLButtonElement | null;

  it('does not render the overlay when closed', () => {
    expect(dialog()).toBeNull();
  });

  it('opens with title, subtitle and content', () => {
    host.open.set(true);
    fixture.detectChanges();
    const el = dialog();
    expect(el).toBeTruthy();
    expect(el?.textContent).toContain('Ajustes');
    expect(el?.textContent).toContain('Preferencias de cuenta');
    expect(el?.textContent).toContain('Contenido del drawer');
  });

  it('applies the width class to the panel', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(dialog()?.classList.contains('w-96')).toBe(true);
  });

  it('renders the footer slot', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(dialog()?.textContent).toContain('Pie');
  });

  it('closes when the close button is clicked', () => {
    host.open.set(true);
    fixture.detectChanges();
    closeButton()?.click();
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('closes on Escape', () => {
    host.open.set(true);
    fixture.detectChanges();
    dialog()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });

  it('closes on backdrop click', () => {
    host.open.set(true);
    fixture.detectChanges();
    backdrop()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
  });

  it('focuses the first focusable element when autoFocus is true', () => {
    host.open.set(true);
    fixture.detectChanges();
    const close = closeButton();
    expect(close).toBeTruthy();
    expect(document.activeElement).toBe(close);
  });

  it('focuses the dialog when autoFocus is false', () => {
    host.autoFocus.set(false);
    host.open.set(true);
    fixture.detectChanges();
    expect(document.activeElement).toBe(dialog());
  });
});
