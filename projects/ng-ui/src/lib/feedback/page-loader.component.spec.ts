import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PageLoaderComponent } from './page-loader.component';

@Component({
  selector: 'page-loader-host',
  standalone: true,
  imports: [PageLoaderComponent],
  template: ` <ui-page-loader [label]="label()" [fullScreen]="fullScreen()" /> `,
})
class PageLoaderHost {
  readonly label = signal('Cargando…');
  readonly fullScreen = signal(true);
}

describe('PageLoaderComponent', () => {
  let fixture: ComponentFixture<PageLoaderHost>;
  let host: PageLoaderHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PageLoaderHost] }).compileComponents();
    fixture = TestBed.createComponent(PageLoaderHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const root = () => fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;

  it('is announced as status and renders a spinner plus label', () => {
    expect(root().getAttribute('aria-live')).toBe('polite');
    expect(root().querySelector('svg')).toBeTruthy();
    expect(root().textContent).toContain('Cargando…');
  });

  it('uses the full-screen classes by default', () => {
    expect(root().classList.contains('fixed')).toBe(true);
    expect(root().classList.contains('z-50')).toBe(true);
  });

  it('switches to inline layout when fullScreen is false', () => {
    host.fullScreen.set(false);
    fixture.detectChanges();
    expect(root().classList.contains('fixed')).toBe(false);
  });

  it('hides the label when empty', () => {
    host.label.set('');
    fixture.detectChanges();
    expect(root().textContent?.trim()).toBe('');
  });
});
