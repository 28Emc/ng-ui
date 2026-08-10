import { Component, signal } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { Toast } from './toast.service';

@Component({
  selector: 'toast-host',
  standalone: true,
  imports: [ToastComponent],
  template: `
    <ui-toast
      [toast]="toast()"
      (dismiss)="onDismiss($event)"
      (pauseToast)="onPause($event)"
      (resumeToast)="onResume($event)"
    />
  `,
})
class ToastHost {
  readonly toast = signal<Toast>({
    id: 't1',
    title: 'Guardado',
    description: 'Cambios aplicados',
    variant: 'success',
    duration: 5000,
  });
  readonly dismissed: string[] = [];
  readonly paused: string[] = [];
  readonly resumed: string[] = [];

  onDismiss(id: string): void {
    this.dismissed.push(id);
  }
  onPause(id: string): void {
    this.paused.push(id);
  }
  onResume(id: string): void {
    this.resumed.push(id);
  }
}

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastHost>;
  let host: ToastHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ToastHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const root = () => fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;

  it('renders the toast title and description', () => {
    const text = root().textContent ?? '';
    expect(text).toContain('Guardado');
    expect(text).toContain('Cambios aplicados');
  });

  it('applies the variant attribute and classes', () => {
    expect(root().getAttribute('data-variant')).toBe('success');
    host.toast.set({ id: 't2', title: 'Error', variant: 'error', duration: 5000 });
    fixture.detectChanges();
    expect(root().getAttribute('data-variant')).toBe('error');
  });

  it('emits dismiss when the close button is clicked', () => {
    const close = root().querySelector('button[aria-label="Cerrar Guardado"]') as HTMLButtonElement;
    close.click();
    expect(host.dismissed).toEqual(['t1']);
  });

  it('runs the action and dismisses when the action button is clicked', () => {
    const onClick = vi.fn();
    host.toast.set({
      id: 't2',
      title: 'Borrado',
      variant: 'default',
      duration: 5000,
      action: { label: 'Deshacer', onClick },
    });
    fixture.detectChanges();
    const action = Array.from(root().querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Deshacer',
    ) as HTMLButtonElement;
    action.click();
    expect(onClick).toHaveBeenCalledWith('t2');
    expect(host.dismissed).toEqual(['t2']);
  });

  it('emits pause and resume on hover', () => {
    root().dispatchEvent(new MouseEvent('mouseenter'));
    expect(host.paused).toEqual(['t1']);
    root().dispatchEvent(new MouseEvent('mouseleave'));
    expect(host.resumed).toEqual(['t1']);
  });
});
