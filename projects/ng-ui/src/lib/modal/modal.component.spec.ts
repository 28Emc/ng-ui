import { Component, signal } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ModalComponent, ModalSize } from './modal.component';
import { UiModalFooterDirective } from './modal-footer.directive';

@Component({
  selector: 'modal-host',
  standalone: true,
  imports: [ModalComponent, UiModalFooterDirective],
  template: `
    <ui-modal
      [open]="open()"
      (openChange)="open.set($event)"
      [title]="title()"
      [size]="size()"
      [autoFocus]="autoFocus()"
    >
      Contenido del modal
      <button type="button" uiModalFooter>Cancelar</button>
    </ui-modal>
  `,
})
class ModalHost {
  readonly open = signal(false);
  readonly title = signal('Confirmación');
  readonly size = signal<ModalSize>('md');
  readonly autoFocus = signal(true);
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalHost>;
  let host: ModalHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ModalHost);
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

  it('opens the modal with title and content', () => {
    host.open.set(true);
    fixture.detectChanges();
    const el = dialog();
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-modal')).toBe('true');
    expect(el?.textContent).toContain('Confirmación');
    expect(el?.textContent).toContain('Contenido del modal');
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
    expect(dialog()).toBeNull();
  });

  it('closes on backdrop click', () => {
    host.open.set(true);
    fixture.detectChanges();
    backdrop()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('renders the footer slot when a footer directive is present', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(dialog()?.textContent).toContain('Cancelar');
  });

  it('maps the size to a panel width', () => {
    host.size.set('xl');
    fixture.detectChanges();
    const comp = fixture.debugElement.query(By.directive(ModalComponent))
      .componentInstance as unknown as { widthStyle: () => string };
    expect(comp.widthStyle()).toContain('42rem');
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
