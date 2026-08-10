import { TestBed } from '@angular/core/testing';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from './toast.service';

describe('ToastHostComponent', () => {
  let fixture: any;
  let service: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastHostComponent] }).compileComponents();
    service = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    service.clear();
    vi.useRealTimers();
  });

  it('renders toasts from the service', () => {
    service.success('Guardado');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Guardado');
  });

  it('renders the action button and dismisses the toast when clicked', () => {
    const spy = vi.fn();
    const id = service.toast({ title: 'Borrado', action: { label: 'Deshacer', onClick: spy } });
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: any) => b.textContent?.trim() === 'Deshacer',
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    expect(spy).toHaveBeenCalledWith(id);
    fixture.detectChanges();
    expect(service.toasts().length).toBe(0);
  });

  it('pauses the auto-dismiss while hovered and resumes on leave', () => {
    vi.useFakeTimers();
    service.toast({ title: 'A', duration: 1000 });
    fixture.detectChanges();
    const toastRoot = fixture.nativeElement.querySelector(
      'ui-toast [role="status"]',
    ) as HTMLElement;

    toastRoot.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);

    toastRoot.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1001);
    expect(service.toasts().length).toBe(0);
  });

  it('applies position classes from the service', () => {
    service.position.set('top-left');
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('.fixed') as HTMLElement;
    expect(host.className).toContain('top-4');
    expect(host.className).toContain('left-4');
  });
});
