import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, MultiSelectOption } from './multiselect.component';

const OPTIONS: MultiSelectOption[] = [
  { label: 'Angular', value: 'angular' },
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'SolidJS', value: 'solid' },
];

@Component({
  selector: 'multiselect-host',
  standalone: true,
  imports: [MultiSelectComponent, FormsModule],
  template: `
    <ui-multiselect
      [options]="options()"
      [name]="name()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class MultiSelectHost {
  readonly options = signal<MultiSelectOption[]>(OPTIONS);
  readonly name = signal('');
  readonly value = signal<string[]>([]);
}

describe('MultiSelectComponent', () => {
  let fixture: ComponentFixture<MultiSelectHost>;
  let host: MultiSelectHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MultiSelectHost] }).compileComponents();
    fixture = TestBed.createComponent(MultiSelectHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
  }

  function comp(): MultiSelectComponent {
    return fixture.debugElement.query(By.directive(MultiSelectComponent))
      .componentInstance as MultiSelectComponent;
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
    expect(listboxOptions().length).toBe(5);
  });

  it('renders a checkbox per option', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const boxes = document.querySelectorAll('ul[role="listbox"] li[role="option"] span');
    const checked = Array.from(boxes).filter((el) =>
      (el as HTMLElement).classList.contains('border-brand-500'),
    );
    expect(checked.length).toBe(0);
  });

  it('filters options while typing', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().value = 're';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(listboxOptions().map((o) => o.textContent?.trim())).toEqual(['React']);
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

  it('toggles a value when an option is clicked', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    listboxOptions()[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular']);
  });

  it('keeps the listbox open after selecting', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    listboxOptions()[0].click();
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    expect(listboxOptions().length).toBe(5);
  });

  it('selects multiple values', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    listboxOptions()[0].click();
    listboxOptions()[1].click();
    listboxOptions()[2].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular', 'react', 'vue']);
  });

  it('deselects a value on second click', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    listboxOptions()[0].click();
    fixture.detectChanges();
    listboxOptions()[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual([]);
  });

  it('renders a chip per selected value', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const chipButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button[aria-label^="Quitar"]'),
    ) as HTMLButtonElement[];
    expect(chipButtons.length).toBe(2);
    expect(chipButtons[0].getAttribute('aria-label')).toBe('Quitar Angular');
  });

  it('collapses chips beyond maxChips with a counter', async () => {
    host.value.set(['angular', 'react', 'vue', 'svelte']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const chipButtons = fixture.nativeElement.querySelectorAll('button[aria-label^="Quitar"]');
    const container = input().closest('div') as HTMLElement;
    expect(chipButtons.length).toBe(3);
    expect(container.textContent).toContain('+1');
  });

  it('removes a value when its chip button is clicked', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const chipButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button[aria-label^="Quitar"]'),
    ) as HTMLButtonElement[];
    chipButtons[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(['react']);
  });

  it('reflects a programmatic value', () => {
    comp().writeValue(['vue', 'solid']);
    fixture.detectChanges();
    const chipButtons = fixture.nativeElement.querySelectorAll('button[aria-label^="Quitar"]');
    expect(chipButtons.length).toBe(2);
    expect((chipButtons[0] as HTMLButtonElement).getAttribute('aria-label')).toBe('Quitar Vue');
  });

  it('removes the last value with Backspace on empty input', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular']);
  });

  it('limits the listbox height to maxVisibleOptions', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const listbox = document.querySelector('ul[role="listbox"]') as HTMLElement;
    expect(listbox.style.maxHeight).toBe(`${5 * 40 + 12}px`);
  });

  it('does not select a disabled option', () => {
    host.options.set([
      { label: 'Angular', value: 'angular' },
      { label: 'Bloqueado', value: 'blocked', disabled: true },
    ]);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    const options = listboxOptions();
    options[1].click();
    fixture.detectChanges();
    expect(host.value()).toEqual([]);
  });

  it('closes on Escape', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(true);
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect((comp() as any).isOpen()).toBe(false);
  });

  it('navigates with arrows and toggles with Enter', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular']);
    expect((comp() as any).isOpen()).toBe(true);
  });

  it('forwards name and disables autofill on the search input', () => {
    host.name.set('skills');
    fixture.detectChanges();
    expect(input().getAttribute('name')).toBe('skills');
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
