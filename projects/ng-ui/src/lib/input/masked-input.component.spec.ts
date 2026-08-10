import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MaskedInputComponent } from './masked-input.component';
import { cursorAtRawCount, extractMaskDigits, formatMask, placeholderFromMask } from './mask-utils';

@Component({
  selector: 'masked-host',
  standalone: true,
  imports: [MaskedInputComponent, FormsModule],
  template: `
    <ui-masked-input
      [mask]="mask()"
      [placeholder]="placeholder()"
      [name]="name()"
      [autocomplete]="autocomplete()"
      [emitMasked]="emitMasked()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class MaskedHost {
  readonly mask = signal('(###) ###-####');
  readonly placeholder = signal('');
  readonly name = signal('');
  readonly autocomplete = signal('');
  readonly emitMasked = signal(false);
  readonly value = signal('');
}

describe('MaskedInputComponent', () => {
  let fixture: ComponentFixture<MaskedHost>;
  let host: MaskedHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MaskedHost] }).compileComponents();
    fixture = TestBed.createComponent(MaskedHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  function type(value: string): void {
    const el = input();
    el.value = value;
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }),
    );
    fixture.detectChanges();
  }

  describe('mask-utils', () => {
    it('extracts only digits', () => {
      expect(extractMaskDigits('(12a) 34#')).toBe('1234');
    });

    it('formats raw digits against the mask', () => {
      expect(formatMask('1234567890', '(###) ###-####')).toBe('(123) 456-7890');
      expect(formatMask('123', '(###) ###-####')).toBe('(123');
      expect(formatMask('', '(###) ###-####')).toBe('');
      expect(formatMask('1234', '####-####')).toBe('1234');
    });

    it('passes raw through when the mask is empty', () => {
      expect(formatMask('abc', '')).toBe('abc');
    });

    it('derives a dynamic placeholder from the mask', () => {
      expect(placeholderFromMask('(###) ###-####')).toBe('(___) ___-____');
    });

    it('computes cursor positions from a raw digit count', () => {
      expect(cursorAtRawCount('(123) 456-7890', 3)).toBe(4);
      expect(cursorAtRawCount('(123) 456-7890', 6)).toBe(9);
      expect(cursorAtRawCount('(123', 0)).toBe(0);
      expect(cursorAtRawCount('(123', 99)).toBe(4);
    });
  });

  it('shows a dynamic placeholder derived from the mask', () => {
    expect(input().placeholder).toBe('(___) ___-____');
  });

  it('uses the provided placeholder instead of the derived one', () => {
    host.placeholder.set('Teléfono');
    fixture.detectChanges();
    expect(input().placeholder).toBe('Teléfono');
  });

  it('forwards name and autocomplete attributes', () => {
    host.name.set('phone');
    host.autocomplete.set('tel');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('phone');
    expect(input().getAttribute('autocomplete')).toBe('tel');
  });

  it('formats digits as they are typed and emits the raw value', () => {
    type('1234567890');
    expect(input().value).toBe('(123) 456-7890');
    expect(host.value()).toBe('1234567890');
  });

  it('filters out non-digit characters', () => {
    type('12a3 45@6');
    expect(input().value).toBe('(123) 456');
    expect(host.value()).toBe('123456');
  });

  it('emits the masked value when emitMasked is enabled', () => {
    host.emitMasked.set(true);
    fixture.detectChanges();
    type('1234567890');
    expect(host.value()).toBe('(123) 456-7890');
  });

  function comp(): MaskedInputComponent {
    return fixture.debugElement.query(By.directive(MaskedInputComponent))
      .componentInstance as MaskedInputComponent;
  }

  it('reflects a raw programmatic value as masked', () => {
    comp().writeValue('1234567890');
    fixture.detectChanges();
    expect(input().value).toBe('(123) 456-7890');
  });

  it('reflects a masked programmatic value as masked', () => {
    comp().writeValue('(987) 654-3210');
    fixture.detectChanges();
    expect(input().value).toBe('(987) 654-3210');
  });

  it('reformats the value when the mask changes at runtime', () => {
    type('1234567890');
    host.mask.set('###-##-####');
    fixture.detectChanges();
    expect(input().value).toBe('123-45-6789');
  });

  it('keeps the cursor after the typed digit when reformatting', () => {
    const el = input();
    el.value = '(1234';
    el.setSelectionRange(5, 5);
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: '4' }),
    );
    fixture.detectChanges();
    expect(el.value).toBe('(123) 4');
    expect(el.selectionStart).toBe(7);
  });

  it('positions the cursor after the previous digit when a char is filtered', () => {
    const el = input();
    el.value = '(123a';
    el.setSelectionRange(5, 5);
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'a' }),
    );
    fixture.detectChanges();
    expect(el.value).toBe('(123');
    expect(el.selectionStart).toBe(4);
  });

  it('deletes the digit before a literal when backspacing over it', () => {
    const el = input();
    el.value = '(123) 456';
    el.setSelectionRange(6, 6);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(el.value).toBe('(124) 56');
    expect(host.value()).toBe('12456');
  });

  it('leaves normal backspace behavior over digits untouched', () => {
    const el = input();
    el.value = '(123) 456';
    el.setSelectionRange(9, 9);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(el.value).toBe('(123) 456');
  });

  it('marks the control as touched on blur', () => {
    const touched = vi.fn();
    const comp = fixture.debugElement.query(By.directive(MaskedInputComponent))
      .componentInstance as MaskedInputComponent;
    comp.registerOnTouched(touched);
    input().dispatchEvent(new Event('blur'));
    expect(touched).toHaveBeenCalled();
  });
});
