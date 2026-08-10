import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TagInputComponent } from './taginput.component';

@Component({
  selector: 'taginput-host',
  standalone: true,
  imports: [TagInputComponent, FormsModule],
  template: `
    <ui-taginput
      [placeholder]="'Etiquetas'"
      [maxTags]="maxTags()"
      [validator]="validator()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class TagInputHost {
  readonly value = signal<string[]>([]);
  readonly maxTags = signal<number | null>(null);
  readonly validator = signal<((tag: string) => string | null) | null>(null);
}

describe('TagInputComponent', () => {
  let fixture: ComponentFixture<TagInputHost>;
  let host: TagInputHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TagInputHost] }).compileComponents();
    fixture = TestBed.createComponent(TagInputHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function comp(): TagInputComponent {
    return fixture.debugElement.query(By.directive(TagInputComponent))
      .componentInstance as TagInputComponent;
  }

  function chips(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('span button[aria-label^="Quitar"]'),
    ).map((b) => (b as HTMLButtonElement).getAttribute('aria-label')?.replace('Quitar ', '') ?? '');
  }

  function typeAndCommit(text: string, key = 'Enter'): void {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  it('starts empty', () => {
    expect(host.value()).toEqual([]);
    expect(chips()).toEqual([]);
  });

  it('adds a tag on Enter', () => {
    typeAndCommit('angular');
    expect(host.value()).toEqual(['angular']);
    expect(input().value).toBe('');
  });

  it('adds a tag on comma', () => {
    typeAndCommit('vue,');
    expect(host.value()).toEqual(['vue']);
  });

  it('adds multiple comma-separated tags via paste', () => {
    const event = {
      preventDefault: () => {},
      clipboardData: { getData: () => 'react, vue, svelte' },
    } as unknown as ClipboardEvent;
    (comp() as any).onPaste(event);
    fixture.detectChanges();
    expect(host.value()).toEqual(['react', 'vue', 'svelte']);
    expect(input().value).toBe('');
  });

  it('commits on blur', () => {
    input().value = 'solid';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.value()).toEqual(['solid']);
  });

  it('does not add empty or whitespace-only tags', () => {
    typeAndCommit('   ');
    expect(host.value()).toEqual([]);
  });

  it('rejects duplicates case-insensitively', () => {
    typeAndCommit('angular');
    typeAndCommit('Angular');
    expect(host.value()).toEqual(['angular']);
    expect((comp() as any).error()).toContain('ya existe');
  });

  it('removes a tag via its chip button', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button[aria-label^="Quitar"]');
    (buttons[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.value()).toEqual(['react']);
  });

  it('removes the last tag with Backspace on empty input', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular']);
  });

  it('applies a custom validator', () => {
    host.validator.set((tag) => (tag.startsWith('#') ? 'No se permiten "#"' : null));
    fixture.detectChanges();
    typeAndCommit('#hash');
    expect(host.value()).toEqual([]);
    expect((comp() as any).error()).toContain('No se permiten');
  });

  it('respects maxTags', () => {
    host.maxTags.set(2);
    fixture.detectChanges();
    typeAndCommit('a');
    typeAndCommit('b');
    typeAndCommit('c');
    expect(host.value()).toEqual(['a', 'b']);
    expect((comp() as any).error()).toContain('Máximo 2');
  });

  it('reflects a programmatic value', () => {
    comp().writeValue(['a', 'b', 'c']);
    fixture.detectChanges();
    expect(chips()).toEqual(['a', 'b', 'c']);
  });

  it('clears the draft with Escape', () => {
    input().value = 'pending';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(input().value).toBe('');
    expect(host.value()).toEqual([]);
  });

  it('clicking the field area does not remove tags and prevents default', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector('div.relative > div') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    field.dispatchEvent(event);
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular', 'react']);
    expect(event.defaultPrevented).toBe(true);
  });

  it('clicking a chip (not its remove button) keeps the tag', async () => {
    host.value.set(['angular', 'react']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('span[class*="rounded-md"]') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    chip.dispatchEvent(event);
    fixture.detectChanges();
    expect(host.value()).toEqual(['angular', 'react']);
    expect(event.defaultPrevented).toBe(true);
  });
});
