import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TimePickerComponent } from './timepicker.component';

@Component({
  selector: 'timepicker-host',
  standalone: true,
  imports: [TimePickerComponent, FormsModule],
  template: `
    <ui-timepicker
      [placeholder]="placeholder()"
      [min]="min()"
      [max]="max()"
      [format]="format()"
      [minuteStep]="minuteStep()"
      [name]="name()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class TimePickerHost {
  readonly value = signal<string | null>(null);
  readonly placeholder = signal('Elige una hora');
  readonly min = signal('');
  readonly max = signal('');
  readonly format = signal('');
  readonly minuteStep = signal(1);
  readonly name = signal('');
}

describe('TimePickerComponent', () => {
  let fixture: ComponentFixture<TimePickerHost>;
  let host: TimePickerHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TimePickerHost] }).compileComponents();
    fixture = TestBed.createComponent(TimePickerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function comp(): TimePickerComponent {
    return fixture.debugElement.query(By.directive(TimePickerComponent))
      .componentInstance as TimePickerComponent;
  }

  function hourButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[data-role="hour"]')) as HTMLButtonElement[];
  }

  function minuteButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[data-role="minute"]')) as HTMLButtonElement[];
  }

  it('shows the placeholder when empty', () => {
    expect(input().placeholder).toBe('Elige una hora');
    expect(input().value).toBe('');
  });

  it('forwards name, numeric inputmode and disables autofill', () => {
    host.name.set('startTime');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('startTime');
    expect(input().getAttribute('inputmode')).toBe('numeric');
    expect(input().getAttribute('autocomplete')).toBe('off');
  });

  it('reflects a programmatic value as HH:mm', () => {
    comp().writeValue('14:30');
    fixture.detectChanges();
    expect(input().value).toBe('14:30');
  });

  it('renders 12h format when requested', () => {
    comp().writeValue('14:30');
    host.format.set('h:mm a');
    fixture.detectChanges();
    expect(input().value).toBe('02:30 PM');
  });

  it('opens the overlay on focus and selects hour + minute', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    const hour = hourButtons().find((b) => b.textContent?.trim() === '14');
    expect(hour).toBeTruthy();
    hour?.click();
    fixture.detectChanges();
    const minute = minuteButtons().find((b) => b.textContent?.trim() === '30');
    minute?.click();
    fixture.detectChanges();
    expect(host.value()).toBe('14:30');
  });

  it('commits a typed HH:mm on blur', () => {
    input().value = '14:30';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('14:30');
    expect(input().value).toBe('14:30');
  });

  it('auto-masks typed digits into HH:mm', () => {
    const el = input();
    el.value = '1430';
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    fixture.detectChanges();
    expect(el.value).toBe('14:30');
  });

  it('commits a 12h typed time with period', () => {
    host.format.set('h:mm a');
    fixture.detectChanges();
    input().value = '2:30 PM';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('14:30');
  });

  it('rejects an invalid typed time on blur', () => {
    input().value = '25:99';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('rejects a typed time outside min/max', () => {
    host.min.set('08:00');
    host.max.set('18:00');
    fixture.detectChanges();
    input().value = '20:00';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('clears on empty input blur', () => {
    input().value = '';
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('disables out-of-range hour buttons', () => {
    host.min.set('08:00');
    host.max.set('18:00');
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const early = hourButtons().find((b) => b.textContent?.trim() === '06');
    const late = hourButtons().find((b) => b.textContent?.trim() === '20');
    expect(early?.disabled).toBe(true);
    expect(late?.disabled).toBe(true);
  });

  it('toggles AM/PM and converts the value in 12h mode', () => {
    host.format.set('h:mm a');
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const pm = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'PM',
    );
    pm?.click();
    fixture.detectChanges();
    expect(host.value()).toBe('21:00'); // default preview 09:00 AM → PM
  });

  it('clears the value when writeValue receives null', () => {
    comp().writeValue('14:30');
    fixture.detectChanges();
    comp().writeValue(null);
    fixture.detectChanges();
    expect(input().value).toBe('');
  });
});
