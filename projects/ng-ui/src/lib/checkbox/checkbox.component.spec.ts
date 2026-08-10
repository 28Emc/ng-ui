import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

@Component({
  selector: 'checkbox-host',
  standalone: true,
  imports: [CheckboxComponent, FormsModule],
  template: `
    <ui-checkbox
      label="Acepto los términos"
      description="Obligatorio"
      [disabled]="disabled()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class CheckboxHost {
  readonly value = signal(false);
  readonly disabled = signal(false);
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxHost>;
  let host: CheckboxHost;
  let btn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckboxHost] }).compileComponents();
    fixture = TestBed.createComponent(CheckboxHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    btn = fixture.nativeElement.querySelector('button[role="checkbox"]') as HTMLButtonElement;
  });

  it('renders label and description', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('span, p') as NodeListOf<HTMLElement>,
    );
    const text = labels.map((n) => n.textContent?.trim()).join(' ');
    expect(text).toContain('Acepto los términos');
    expect(text).toContain('Obligatorio');
  });

  it('starts unchecked', () => {
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles the value on click', () => {
    btn.click();
    fixture.detectChanges();
    expect(host.value()).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');

    btn.click();
    fixture.detectChanges();
    expect(host.value()).toBe(false);
  });

  it('reflects a programmatic value', () => {
    const comp = fixture.debugElement.query(By.directive(CheckboxComponent))
      .componentInstance as CheckboxComponent;
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
    expect(host.value()).toBe(false);
  });

  it('renders a check icon when checked', () => {
    const comp = fixture.debugElement.query(By.directive(CheckboxComponent))
      .componentInstance as CheckboxComponent;
    comp.writeValue(true);
    fixture.detectChanges();
    expect(btn.querySelector('svg')).toBeTruthy();
  });
});
