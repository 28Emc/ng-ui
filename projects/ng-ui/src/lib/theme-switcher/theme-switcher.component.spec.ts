import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService, UiTheme } from './theme.service';

@Component({
  selector: 'theme-switcher-host',
  standalone: true,
  imports: [ThemeSwitcherComponent],
  template: `
    <ui-theme-switcher
      [storageKey]="storageKey()"
      [defaultTheme]="defaultTheme()"
      [variant]="variant()"
      [size]="size()"
      [labelLight]="labelLight()"
      [labelDark]="labelDark()"
      (themeChange)="onThemeChange($event)"
    />
    <ui-theme-switcher />
  `,
})
class ThemeSwitcherHost {
  readonly storageKey = signal('test-theme-key');
  readonly defaultTheme = signal<UiTheme>('light');
  readonly variant = signal<'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle'>(
    'ghost',
  );
  readonly size = signal<'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'>('icon');
  readonly labelLight = signal('Cambiar a tema oscuro');
  readonly labelDark = signal('Cambiar a tema claro');
  readonly themeEvents: UiTheme[] = [];

  onThemeChange(theme: UiTheme): void {
    this.themeEvents.push(theme);
  }
}

@Component({
  selector: 'single-theme-switcher-host',
  standalone: true,
  imports: [ThemeSwitcherComponent],
  template: ` <ui-theme-switcher [storageKey]="storageKey()" [defaultTheme]="defaultTheme()" /> `,
})
class SingleThemeSwitcherHost {
  readonly storageKey = signal('test-theme-key');
  readonly defaultTheme = signal<UiTheme>('light');
}

describe('ThemeSwitcherComponent', () => {
  let fixture: ComponentFixture<ThemeSwitcherHost>;
  let host: ThemeSwitcherHost;
  let buttons: HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ThemeSwitcherHost] }).compileComponents();
    fixture = TestBed.createComponent(ThemeSwitcherHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
  });

  afterEach(() => {
    TestBed.inject(ThemeService).setDark(false);
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  const hasSun = (btn: HTMLButtonElement) => !!btn.querySelector('svg.lucide-sun');
  const hasMoon = (btn: HTMLButtonElement) => !!btn.querySelector('svg.lucide-moon');

  it('renders an icon button that shows the moon in light mode', () => {
    expect(buttons[0].getAttribute('aria-label')).toBe('Cambiar a tema oscuro');
    expect(hasMoon(buttons[0])).toBe(true);
    expect(hasSun(buttons[0])).toBe(false);
  });

  it('toggles dark mode, persists and emits the new theme on click', () => {
    buttons[0].click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('test-theme-key')).toBe('dark');
    expect(host.themeEvents).toEqual(['dark']);
    expect(buttons[0].getAttribute('aria-label')).toBe('Cambiar a tema claro');
    expect(hasSun(buttons[0])).toBe(true);
    expect(hasMoon(buttons[0])).toBe(false);
  });

  it('toggles back to light mode on a second click', () => {
    buttons[0].click();
    buttons[0].click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('test-theme-key')).toBe('light');
    expect(host.themeEvents).toEqual(['dark', 'light']);
    expect(hasMoon(buttons[0])).toBe(true);
  });

  it('applies the stored dark theme on init', () => {
    localStorage.setItem('test-theme-key', 'dark');
    const singleFixture = TestBed.createComponent(SingleThemeSwitcherHost);
    singleFixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const singleButton = singleFixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(hasSun(singleButton)).toBe(true);
  });

  it('applies defaultTheme when nothing is stored', () => {
    localStorage.clear();
    const singleFixture = TestBed.createComponent(SingleThemeSwitcherHost);
    singleFixture.componentInstance.defaultTheme.set('dark');
    singleFixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('keeps all switchers in sync through the shared service', () => {
    buttons[0].click();
    fixture.detectChanges();

    expect(hasSun(buttons[0])).toBe(true);
    expect(hasSun(buttons[1])).toBe(true);

    buttons[1].click();
    fixture.detectChanges();

    expect(hasMoon(buttons[0])).toBe(true);
    expect(hasMoon(buttons[1])).toBe(true);
  });

  it('uses custom labels and sizes', () => {
    host.labelLight.set('Activar oscuro');
    host.labelDark.set('Activar claro');
    host.size.set('icon-sm');
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-label')).toBe('Activar oscuro');
    expect(buttons[0].querySelector('svg')?.getAttribute('width')).toBe('14');
  });
});
