import { Component, signal } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SkipLinkComponent } from './skip-link.component';

@Component({
  selector: 'skip-link-default-host',
  standalone: true,
  imports: [SkipLinkComponent],
  template: ` <ui-skip-link /> `,
})
class SkipLinkDefaultHost {}

@Component({
  selector: 'skip-link-host',
  standalone: true,
  imports: [SkipLinkComponent],
  template: ` <ui-skip-link [target]="target()" [label]="label()" /> `,
})
class SkipLinkHost {
  readonly target = signal('#main');
  readonly label = signal('');
}

describe('SkipLinkComponent', () => {
  let fixture: ComponentFixture<SkipLinkHost>;
  let host: SkipLinkHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLinkHost, SkipLinkDefaultHost],
      providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }],
    }).compileComponents();
    fixture = TestBed.createComponent(SkipLinkHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const link = () => fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

  it('renders an anchor pointing to the target with the localized default label', () => {
    expect(link().getAttribute('href')).toBe('#main');
    expect(link().textContent?.trim()).toBe('Saltar al contenido');
  });

  it('defaults the target to #main and uses the localized label when not provided', () => {
    const defaultFixture = TestBed.createComponent(SkipLinkDefaultHost);
    defaultFixture.detectChanges();
    const el = defaultFixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(el.getAttribute('href')).toBe('#main');
    expect(el.textContent?.trim()).toBe('Saltar al contenido');
  });

  it('uses a custom label when provided', () => {
    host.label.set('Ir al contenido');
    fixture.detectChanges();
    expect(link().textContent?.trim()).toBe('Ir al contenido');
  });

  it('is visually hidden but focusable', () => {
    expect(link().classList.contains('opacity-0')).toBe(true);
    expect(link().classList.contains('focus:opacity-100')).toBe(true);
  });
});
