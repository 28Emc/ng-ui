import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DateRangePickerComponent, DateRangeValue } from './daterangepicker.component';

@Component({
  selector: 'daterangepicker-host',
  standalone: true,
  imports: [DateRangePickerComponent, FormsModule],
  template: `
    <ui-daterangepicker
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
class DateRangePickerHost {
  readonly value = signal<DateRangeValue>(null);
  readonly placeholder = signal('Elige un rango');
  readonly locale = signal('');
  readonly min = signal('');
  readonly max = signal('');
  readonly name = signal('');
}

describe('DateRangePickerComponent', () => {
  let fixture: ComponentFixture<DateRangePickerHost>;
  let host: DateRangePickerHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangePickerHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(DateRangePickerHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function comp(): DateRangePickerComponent {
    return fixture.debugElement.query(By.directive(DateRangePickerComponent))
      .componentInstance as DateRangePickerComponent;
  }

  function calendar(role: string): HTMLDivElement | null {
    return document.querySelector<HTMLDivElement>(`[data-calendar="${role}"]`);
  }

  function dayIn(role: string, day: number): HTMLButtonElement | undefined {
    const grid = calendar(role);
    return Array.from(grid?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.trim() === `${day}`,
    );
  }

  it('shows the placeholder when empty', () => {
    expect(input().placeholder).toBe('Elige un rango');
    expect(input().value).toBe('');
  });

  it('forwards name, numeric inputmode and disables autofill', () => {
    host.name.set('period');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('period');
    expect(input().getAttribute('inputmode')).toBe('numeric');
    expect(input().getAttribute('autocomplete')).toBe('off');
  });

  it('reflects a programmatic value as dd/mm/yyyy – dd/mm/yyyy', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
  });

  it('uses the locale input override to switch to MM/DD/yyyy', () => {
    host.placeholder.set('');
    host.locale.set('en-US');
    fixture.detectChanges();
    expect(input().placeholder).toBe('mm/dd/yyyy – mm/dd/yyyy');
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    expect(input().value).toBe('08/10/2026 – 08/20/2026');
  });

  it('opens two calendars on focus', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    expect(calendar('start')).toBeTruthy();
    expect(calendar('end')).toBeTruthy();
  });

  it('selects a range by clicking start then end', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    dayIn('start', 10)?.click();
    fixture.detectChanges();
    dayIn('start', 20)?.click();
    fixture.detectChanges();
    const value = host.value();
    expect(value).not.toBeNull();
    expect(value?.[0]).toBe('2026-08-10');
    expect(value?.[1]).toBe('2026-08-20');
    expect((comp() as any).isOpen()).toBe(false);
  });

  it('resets the start when clicking a day before the current start', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    dayIn('start', 5)?.click();
    fixture.detectChanges();
    expect((comp() as any).start()).toBe('2026-08-05');
    expect((comp() as any).end()).toBeNull();
    (comp() as any).close();
    fixture.detectChanges();
  });

  it('highlights the selected range cells', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const between = dayIn('start', 15);
    expect(between?.className).toContain('bg-brand-500/10');
    const startDay = dayIn('start', 10);
    expect(startDay?.className).toContain('bg-brand-500');
    (comp() as any).close();
    fixture.detectChanges();
  });

  it('commits a typed range on blur', () => {
    input().value = '10/08/2026 a 20/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    const value = host.value();
    expect(value?.[0]).toBe('2026-08-10');
    expect(value?.[1]).toBe('2026-08-20');
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
  });

  it('rejects an invalid typed range on blur', () => {
    input().value = '99/99/9999 a 20/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('rejects an out-of-order typed range on blur', () => {
    input().value = '20/08/2026 a 10/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('rejects a typed range outside min/max', () => {
    host.min.set('2026-08-10');
    host.max.set('2026-08-20');
    fixture.detectChanges();
    input().value = '01/08/2026 a 05/08/2026';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('clears the range via the Limpiar button', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const limpiar = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().startsWith('Limpiar'),
    );
    limpiar?.click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('clears on empty input blur', () => {
    input().value = '';
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('reverts an uncommitted selection when closing', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    dayIn('start', 5)?.click();
    fixture.detectChanges();
    (comp() as any).close();
    fixture.detectChanges();
    expect((comp() as any).start()).toBe('2026-08-10');
    expect((comp() as any).end()).toBe('2026-08-20');
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
  });

  it('masks the slashes and separator while typing', () => {
    const type = (value: string) => {
      input().value = value;
      input().dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }),
      );
      fixture.detectChanges();
    };
    type('10');
    expect(input().value).toBe('10/');
    type('10/08');
    expect(input().value).toBe('10/08/');
    type('10/08/2026');
    expect(input().value).toBe('10/08/2026 – ');
    type('10/08/2026 – 20');
    expect(input().value).toBe('10/08/2026 – 20/');
    type('10/08/2026 – 20/08');
    expect(input().value).toBe('10/08/2026 – 20/08/');
  });

  it('auto-commits when the full masked range is typed', () => {
    input().value = '1008202609102026';
    input().dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '1008202609102026' }),
    );
    fixture.detectChanges();
    const value = host.value();
    expect(value?.[0]).toBe('2026-08-10');
    expect(value?.[1]).toBe('2026-10-09');
    expect(input().value).toBe('10/08/2026 – 09/10/2026');
  });

  it('selects each complete date in the overlay while typing digit by digit', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const typeDigit = (ch: string) => {
      input().value = input().value + ch;
      input().dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch }),
      );
      fixture.detectChanges();
    };
    '10082026'.split('').forEach(typeDigit);
    expect((comp() as any).start()).toBe('2026-08-10');
    expect((comp() as any).startView()).toEqual({ year: 2026, month: 7 });
    expect((comp() as any).end()).toBeNull();
    '20082026'.split('').forEach(typeDigit);
    const value = host.value();
    expect(value?.[0]).toBe('2026-08-10');
    expect(value?.[1]).toBe('2026-08-20');
    expect((comp() as any).end()).toBe('2026-08-20');
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
  });

  it('keeps the committed range when pressing Enter after typing both dates', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().value = '1008202620082026';
    input().dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '1008202620082026' }),
    );
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-10', '2026-08-20']);
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-10', '2026-08-20']);
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
    expect((comp() as any).isOpen()).toBe(false);
  });

  it('keeps the committed range when blurring after typing both dates', () => {
    input().value = '1008202620082026';
    input().dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '1008202620082026' }),
    );
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-10', '2026-08-20']);
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-10', '2026-08-20']);
    expect(input().value).toBe('10/08/2026 – 20/08/2026');
  });

  it('replaces an existing value when typing and blurring', () => {
    comp().writeValue(['2026-08-10', '2026-08-20']);
    fixture.detectChanges();
    input().value = '1508202625082026';
    input().dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '1508202625082026' }),
    );
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-15', '2026-08-25']);
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toEqual(['2026-08-15', '2026-08-25']);
    expect(input().value).toBe('15/08/2026 – 25/08/2026');
  });

  it('navigates to year and month mode per calendar', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const label = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Agosto 2026',
    );
    label?.click();
    fixture.detectChanges();
    expect((comp() as any).startMode()).toBe('year');
    expect(
      Array.from(document.querySelectorAll('button')).some((b) => b.textContent?.trim() === '2026'),
    ).toBe(true);
    const year2026 = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '2026',
    );
    year2026?.click();
    fixture.detectChanges();
    expect((comp() as any).startMode()).toBe('month');
    const marzo = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Mar',
    );
    marzo?.click();
    fixture.detectChanges();
    expect((comp() as any).startMode()).toBe('day');
    expect((comp() as any).startView()).toEqual({ year: 2026, month: 2 });
    (comp() as any).close();
    fixture.detectChanges();
  });
});
