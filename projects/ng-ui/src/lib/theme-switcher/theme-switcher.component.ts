import { Component, computed, inject, input, output, OnInit } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { ButtonComponent, ButtonSize, ButtonVariant } from '../button/button.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { ThemeService, UiTheme } from './theme.service';

@Component({
  selector: 'ui-theme-switcher',
  standalone: true,
  imports: [ButtonComponent, TooltipDirective, LucideMoon, LucideSun],
  template: `
    <ui-button
      type="button"
      [variant]="variant()"
      [size]="size()"
      [ariaLabel]="label()"
      [uiTooltip]="label()"
      (click)="toggle()"
    >
      @if (theme.dark()) {
        <svg lucideSun [size]="iconSize()" [strokeWidth]="2" />
      } @else {
        <svg lucideMoon [size]="iconSize()" [strokeWidth]="2" />
      }
    </ui-button>
  `,
})
export class ThemeSwitcherComponent implements OnInit {
  readonly storageKey = input('emc-ui-theme');
  readonly defaultTheme = input<UiTheme>('light');
  readonly variant = input<ButtonVariant>('ghost');
  readonly size = input<ButtonSize>('icon');
  readonly labelLight = input('Cambiar a tema oscuro');
  readonly labelDark = input('Cambiar a tema claro');
  readonly themeChange = output<UiTheme>();

  protected readonly theme = inject(ThemeService);
  protected readonly label = computed(() =>
    this.theme.dark() ? this.labelDark() : this.labelLight(),
  );
  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'icon-sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  });

  ngOnInit(): void {
    const stored = localStorage.getItem(this.storageKey());
    const theme = stored === 'dark' || stored === 'light' ? stored : this.defaultTheme();
    this.theme.setDark(theme === 'dark');
  }

  protected toggle(): void {
    const next = this.theme.toggle();
    localStorage.setItem(this.storageKey(), next);
    this.themeChange.emit(next);
  }
}
