import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ComboboxComponent } from './combobox.component';

const OPTIONS = [
  { label: 'Angular', value: 'angular' },
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
];

@Component({
  selector: 'combobox-host',
  standalone: true,
  imports: [ComboboxComponent, FormsModule],
  template: `
    <ui-combobox
      [options]="options()"
      [name]="name()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class ComboboxHost {
  readonly options = signal(OPTIONS);
  readonly name = signal('');
  readonly value = signal<string | null>(null);
}

describe('ComboboxComponent', () => {
  let fixture: ComponentFixture<ComboboxHost>;
  let host: ComboboxHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComboboxHost] }).compileComponents();
    fixture = TestBed.createComponent(ComboboxHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
  }

  function comp(): ComboboxComponent {
    return fixture.debugElement.query(By.directive(ComboboxComponent))
      .componentInstance as ComboboxComponent;
  }

  function listboxOptions(): HTMLLIElement[] {
    return Array.from(
      document.querySelectorAll('ul[role="listbox"] li[role="option"]'),
    ) as HTMLLIElement[];
  }

  it('starts empty with all options available', () => {
    expect(input().value).toBe('');
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    expect(listboxOptions().length).toBe(4);
  });

  it('keeps the listbox open when clicking the trigger again', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    expect(listboxOptions().length).toBe(4);
  });

  it('clears value on empty input blur', () => {
    host.value.set('angular');
    fixture.detectChanges();
    input().value = '';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(input().value).toBe('');
  });

  it('clears value on partial match blur', () => {
    host.value.set('angular');
    fixture.detectChanges();
    input().value = 'Ang';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('keeps value on exact match blur', () => {
    host.value.set('angular');
    fixture.detectChanges();
    input().value = 'Angular';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('angular');
    expect(input().value).toBe('Angular');
  });

  it('filters options while typing', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().value = 're';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(listboxOptions().map((o) => o.textContent?.trim())).toEqual(['React']);
  });

  it('selects an option on click', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    listboxOptions()[0].click();
    fixture.detectChanges();
    expect(host.value()).toBe('angular');
    expect(input().value).toBe('Angular');
  });

  it('reflects a programmatic value', () => {
    comp().writeValue('vue');
    fixture.detectChanges();
    expect(input().value).toBe('Vue');
  });

  it('shows "Sin resultados" when nothing matches', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().value = 'zzz';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const listbox = document.querySelector('ul[role="listbox"]');
    expect(listbox?.textContent).toContain('Sin resultados');
  });

  it('forwards name and disables autofill on the search input', () => {
    host.name.set('framework');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('framework');
    expect(input().getAttribute('autocomplete')).toBe('off');
    expect(input().classList.contains('focus-visible:outline-none')).toBe(true);
  });

  it('renders a focus-within ring on the field wrapper', () => {
    const wrapper = Array.from(fixture.nativeElement.querySelectorAll('div')).find((d) =>
      (d as HTMLElement).classList.contains('focus-within:ring-4'),
    );
    expect(wrapper).toBeTruthy();
  });
});
