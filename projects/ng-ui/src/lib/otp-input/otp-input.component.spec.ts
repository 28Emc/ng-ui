import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OtpInputComponent } from './otp-input.component';

@Component({
  selector: 'otp-host',
  standalone: true,
  imports: [OtpInputComponent],
  template: `
    <ui-otp-input
      [value]="value()"
      (valueChange)="onValueChange($event)"
      [length]="length()"
      [disabled]="disabled()"
      [numeric]="numeric()"
      [autoFocus]="autoFocus()"
    />
  `,
})
class OtpHost {
  readonly value = signal('');
  readonly length = signal(4);
  readonly disabled = signal(false);
  readonly numeric = signal(true);
  readonly autoFocus = signal(true);

  onValueChange(value: string): void {
    this.value.set(value);
  }
}

describe('OtpInputComponent', () => {
  let fixture: ComponentFixture<OtpHost>;
  let host: OtpHost;
  let component: OtpInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OtpHost] }).compileComponents();
    fixture = TestBed.createComponent(OtpHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(OtpInputComponent)).componentInstance;
  });

  function boxes(): HTMLInputElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-otp-box]'),
    ) as HTMLInputElement[];
  }

  function typeInto(box: HTMLInputElement, value: string): void {
    box.value = value;
    box.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('renders one box per digit according to length', () => {
    expect(boxes()).toHaveLength(4);
    host.length.set(6);
    fixture.detectChanges();
    expect(boxes()).toHaveLength(6);
  });

  it('distributes the initial value across the boxes', () => {
    host.value.set('1234');
    fixture.detectChanges();

    expect(boxes().map((b) => b.value)).toEqual(['1', '2', '3', '4']);
  });

  it('writes a digit, updates the model and advances the focus', () => {
    typeInto(boxes()[0], '7');
    fixture.detectChanges();

    expect(host.value()).toBe('7');
    expect(document.activeElement).toBe(boxes()[1]);
  });

  it('replaces an existing digit in place', () => {
    host.value.set('1234');
    fixture.detectChanges();
    typeInto(boxes()[2], '9');
    fixture.detectChanges();

    expect(host.value()).toBe('1294');
  });

  it('ignores non-digit characters when numeric is enabled', () => {
    typeInto(boxes()[0], 'a');
    fixture.detectChanges();

    expect(host.value()).toBe('');
    expect(boxes()[0].value).toBe('');
  });

  it('allows alphanumeric characters when numeric is disabled', () => {
    host.numeric.set(false);
    fixture.detectChanges();
    typeInto(boxes()[0], 'A');
    fixture.detectChanges();

    expect(host.value()).toBe('A');
  });

  it('clears the current digit and keeps focus on backspace', () => {
    host.value.set('1234');
    fixture.detectChanges();
    boxes()[3].focus();
    fixture.detectChanges();

    boxes()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();

    expect(host.value()).toBe('123');
    expect(document.activeElement).toBe(boxes()[3]);
  });

  it('moves back and clears the previous digit when the current box is empty', () => {
    host.value.set('123');
    fixture.detectChanges();
    boxes()[3].focus();
    fixture.detectChanges();

    boxes()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();

    expect(host.value()).toBe('12');
    expect(document.activeElement).toBe(boxes()[2]);
  });

  it('fills the boxes and emits complete on paste', () => {
    const completeSpy = vi.fn();
    component.complete.subscribe(completeSpy);
    const event = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '9' },
    });
    boxes()[0].dispatchEvent(event);
    fixture.detectChanges();

    expect(host.value()).toBe('9');
    expect(boxes()[0].value).toBe('9');
    expect(completeSpy).not.toHaveBeenCalled();
  });

  it('emits complete when every box has a digit', () => {
    const completeSpy = vi.fn();
    component.complete.subscribe(completeSpy);
    host.value.set('1234');
    fixture.detectChanges();

    expect(completeSpy).toHaveBeenCalledWith('1234');
  });

  it('disables every box when disabled is true', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(boxes().every((b) => b.disabled)).toBe(true);
  });

  it('focuses the first empty box on mount when autoFocus is enabled', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(boxes()[0]);
  });
});
