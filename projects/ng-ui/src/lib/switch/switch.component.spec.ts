import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SwitchComponent } from './switch.component';

@Component({
  selector: 'switch-host',
  standalone: true,
  imports: [SwitchComponent, FormsModule],
  template: `
    <ui-switch
      [label]="label()"
      [description]="description()"
      [disabled]="disabled()"
      [(ngModel)]="value"
    />
  `,
})
class SwitchHost {
  readonly label = signal('');
  readonly description = signal('');
  readonly disabled = signal(false);
  value = false;
}

describe('SwitchComponent', () => {
  let fixture: ComponentFixture<SwitchHost>;
  let host: SwitchHost;
  let btn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SwitchHost] }).compileComponents();
    fixture = TestBed.createComponent(SwitchHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    btn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
  });

  it('renders the label and description', () => {
    host.label.set('Notificaciones');
    host.description.set('Recibe un correo');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Notificaciones');
    expect(text).toContain('Recibe un correo');
  });

  it('starts unchecked with aria-checked=false', () => {
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles the value and checked state on click', () => {
    btn.click();
    fixture.detectChanges();
    expect(host.value).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');

    btn.click();
    fixture.detectChanges();
    expect(host.value).toBe(false);
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('reflects a programmatic value', () => {
    const comp = fixture.debugElement.query(By.directive(SwitchComponent))
      .componentInstance as SwitchComponent;
    comp.writeValue(true);
    fixture.detectChanges();
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('does not toggle when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(btn.disabled).toBe(true);
    btn.click();
    fixture.detectChanges();
    expect(host.value).toBe(false);
  });

  it('labels the switch with aria-label when no label is present', () => {
    expect(btn.getAttribute('aria-label')).toBeNull();
    host.label.set('Notificaciones');
    fixture.detectChanges();
    expect(btn.getAttribute('aria-label')).toBe('Notificaciones');
  });

  it('tracks touched state on toggle', () => {
    const comp = fixture.debugElement.query(By.directive(SwitchComponent))
      .componentInstance as SwitchComponent;
    const touched = vi.fn();
    comp.registerOnTouched(touched);
    btn.click();
    expect(touched).toHaveBeenCalled();
  });
});
