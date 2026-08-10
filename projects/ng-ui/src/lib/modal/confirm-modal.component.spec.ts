import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ConfirmModalComponent } from './confirm-modal.component';

@Component({
  selector: 'confirm-modal-host',
  standalone: true,
  imports: [ConfirmModalComponent],
  template: `
    <ui-confirm-modal
      [open]="open()"
      (openChange)="open.set($event)"
      [title]="title()"
      [description]="description()"
      [confirmLabel]="confirmLabel()"
      [cancelLabel]="cancelLabel()"
      [danger]="danger()"
      (confirm)="onConfirm()"
      (cancelled)="onCancel()"
    >
      Contenido extra
    </ui-confirm-modal>
  `,
})
class ConfirmModalHost {
  readonly open = signal(false);
  readonly title = signal('Eliminar');
  readonly description = signal('Esta acción es irreversible');
  readonly confirmLabel = signal('Eliminar');
  readonly cancelLabel = signal('Cancelar');
  readonly danger = signal(false);
  confirmed = 0;
  cancelled = 0;

  onConfirm(): void {
    this.confirmed++;
  }

  onCancel(): void {
    this.cancelled++;
  }
}

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalHost>;
  let host: ConfirmModalHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmModalHost] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmModalHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  const dialog = () =>
    document.querySelector('.cdk-overlay-container [role="dialog"]') as HTMLElement | null;
  const footerButtons = () =>
    Array.from(dialog()?.querySelectorAll('footer button') ?? []) as HTMLButtonElement[];

  it('opens with title, description and projected content', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(dialog()?.textContent).toContain('Eliminar');
    expect(dialog()?.textContent).toContain('Esta acción es irreversible');
    expect(dialog()?.textContent).toContain('Contenido extra');
  });

  it('emits confirm and closes', () => {
    host.open.set(true);
    fixture.detectChanges();
    footerButtons()[1].click();
    fixture.detectChanges();
    expect(host.confirmed).toBe(1);
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('emits cancelled and closes', () => {
    host.open.set(true);
    fixture.detectChanges();
    footerButtons()[0].click();
    fixture.detectChanges();
    expect(host.cancelled).toBe(1);
    expect(host.open()).toBe(false);
  });

  it('uses custom button labels', () => {
    host.confirmLabel.set('Sí, borrar');
    host.cancelLabel.set('Volver');
    host.open.set(true);
    fixture.detectChanges();
    const text = dialog()?.textContent ?? '';
    expect(text).toContain('Sí, borrar');
    expect(text).toContain('Volver');
  });

  it('switches the confirm button to the danger variant', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(footerButtons()[1].classList.contains('bg-brand-gradient')).toBe(true);
    host.open.set(false);
    fixture.detectChanges();
    host.danger.set(true);
    host.open.set(true);
    fixture.detectChanges();
    expect(footerButtons()[1].classList.contains('bg-red-500')).toBe(true);
  });
});
