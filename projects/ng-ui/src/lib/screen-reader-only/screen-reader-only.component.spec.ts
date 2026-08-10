import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ScreenReaderOnlyComponent } from './screen-reader-only.component';

@Component({
  selector: 'screen-reader-only-host',
  standalone: true,
  imports: [ScreenReaderOnlyComponent],
  template: `
    <div>
      <p id="visible">Texto visible</p>
      <ui-screen-reader-only data-test="sr">Texto solo accesible</ui-screen-reader-only>
    </div>
  `,
})
class ScreenReaderOnlyHost {}

describe('ScreenReaderOnlyComponent', () => {
  let fixture: ComponentFixture<ScreenReaderOnlyHost>;
  let el: HTMLElement;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ScreenReaderOnlyHost] }).compileComponents();
    fixture = TestBed.createComponent(ScreenReaderOnlyHost);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    hostEl = el.querySelector('ui-screen-reader-only[data-test="sr"]') as HTMLElement;
  });

  it('renders as a ui-screen-reader-only element', () => {
    expect(hostEl.tagName.toLowerCase()).toBe('ui-screen-reader-only');
  });

  it('projects the content into the host', () => {
    expect(hostEl.textContent).toContain('Texto solo accesible');
  });

  it('keeps the content in the DOM (accessible to screen readers)', () => {
    expect(el.textContent).toContain('Texto solo accesible');
  });

  it('applies the sr-only utility class to the host', () => {
    expect(hostEl.classList.contains('sr-only')).toBe(true);
  });

  it('applies no other classes', () => {
    expect(Array.from(hostEl.classList)).toEqual(['sr-only']);
  });

  it('does not wrap content in an extra span', () => {
    expect(hostEl.children.length).toBe(0);
  });

  it('leaves sibling content untouched', () => {
    const visible = el.querySelector('#visible') as HTMLElement;
    expect(visible.textContent).toBe('Texto visible');
    expect(visible.classList.contains('sr-only')).toBe(false);
  });
});
