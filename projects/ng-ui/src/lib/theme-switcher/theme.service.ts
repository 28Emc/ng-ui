import { Injectable, signal } from '@angular/core';

export type UiTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(false);

  setDark(dark: boolean): void {
    this.dark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
  }

  toggle(): UiTheme {
    this.setDark(!this.dark());
    return this.dark() ? 'dark' : 'light';
  }
}
