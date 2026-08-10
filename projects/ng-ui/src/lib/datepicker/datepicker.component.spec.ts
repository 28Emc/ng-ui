import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from './datepicker.component';

@Component({
  selector: 'datepicker-host',
  standalone: true,
  imports: [DatePickerComponent, FormsModule],
  template: `
    <ui-datepicker
      [placeholder]="placeholder()"
      [locale]="locale() || null"
      [min]="min()"
      [max]="max()"
      [name]="name()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class DatePickerHost {
  readonly value = signal<string | null>(null);
  readonly placeholder = signal('Elige una fecha');
  readonly locale = signal('');
  readonly min = signal('');
  readonly max = signal('');
  readonly name = signal('');
}

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<DatePickerHost>;
  let host: DatePickerHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(DatePickerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function comp(): DatePickerComponent {
    return fixture.debugElement.query(By.directive(DatePickerComponent))
      .componentInstance as DatePickerComponent;
  }

  function dayButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  }

  it('shows the placeholder when empty', () => {
    expect(input().placeholder).toBe('Elige una fecha');
    expect(input().value).toBe('');
  });

  it('forwards name, numeric inputmode and disables autofill', () => {
    host.name.set('birthDate');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('birthDate');
    expect(input().getAttribute('inputmode')).toBe('numeric');
    expect(input().getAttribute('autocomplete')).toBe('off');
  });

  it('reflects a programmatic value as dd/mm/yyyy', () => {
    comp().writeValue('2026-08-15');
    fixture.detectChanges();
    expect(input().value).toBe('15/08/2026');
  });

  it('opens the calendar on focus and selects a day', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    const day = dayButtons().find((b) => b.textContent?.trim() === '15');
    expect(day).toBeTruthy();
    day?.click();
    fixture.detectChanges();
    expect(host.value()).toBe(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
    );
    expect((comp() as any).isOpen()).toBe(false);
  });

  it('keeps the calendar open when clicking the trigger again', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
  });

  it('commits a typed date in dd/MM/yyyy on blur', () => {
    input().value = '15/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('2026-08-15');
    expect(input().value).toBe('15/08/2026');
  });

  it('commits a typed ISO date on blur', () => {
    input().value = '2026-08-15';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('2026-08-15');
  });

  it('reverts an invalid typed date on blur', () => {
    input().value = '99/99/9999';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('rejects a typed date outside min/max', () => {
    host.min.set('2026-08-10');
    host.max.set('2026-08-20');
    fixture.detectChanges();
    input().value = '05/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('accepts dd/MM/yyyy format (es-PE locale)', () => {
    input().value = '10/02/1991';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('1991-02-10');
    expect(input().value).toBe('10/02/1991');
  });

  it('uses the locale input override to switch to MM/DD/yyyy', () => {
    host.placeholder.set('');
    host.locale.set('en-US');
    fixture.detectChanges();
    expect(input().placeholder).toBe('mm/dd/yyyy');
    input().value = '02/10/1991';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('1991-02-10');
    expect(input().value).toBe('02/10/1991');
  });

  it('localizes calendar month names and action labels', () => {
    host.locale.set('en-US');
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const panelText = document.body.textContent ?? '';
    expect(panelText).toContain('August');
    expect(panelText).toContain('Today');
    expect(input().getAttribute('aria-label')).toBe('Select date');
  });

  it('commits typed dd/MM/yyyy and updates calendar view', () => {
    input().value = '10/02/1991';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('1991-02-10');
    const compInstance = comp();
    expect((compInstance as any).view().month).toBe(1); // Feb (0-indexed)
    expect((compInstance as any).view().year).toBe(1991);
  });

  it('clears on invalid typed date', () => {
    input().value = '10/01/100';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('clears on empty input blur', () => {
    input().value = '';
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('does not emit when the selected day is out of range', () => {
    host.min.set('2026-08-10');
    host.max.set('2026-08-20');
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const outOfRange = dayButtons().find((b) => b.textContent?.trim() === '5');
    expect(outOfRange?.disabled).toBe(true);
  });

  it('clears the value when writeValue receives null', () => {
    comp().writeValue('2026-08-15');
    fixture.detectChanges();
    comp().writeValue(null);
    fixture.detectChanges();
    expect(input().value).toBe('');
  });

  it('auto-masks typed digits into dd/MM/yyyy format', () => {
    const el = input();
    el.value = '10022026';
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    fixture.detectChanges();
    expect(el.value).toBe('10/02/2026');
  });

  it('does not force re-inserting slash on backspace deletion', () => {
    const el = input();
    el.value = '10/';
    el.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }));
    fixture.detectChanges();
    expect(el.value).toBe('10');
  });
});
