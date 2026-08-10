import { Component, computed, input, booleanAttribute } from '@angular/core';
import { SpinnerComponent } from './spinner.component';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-page-loader',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div [class]="classes()" role="status" aria-live="polite">
      <div class="flex flex-col items-center gap-3">
        <ui-spinner [size]="28" />
        @if (label()) {
          <p class="text-sm font-medium text-muted">{{ label() }}</p>
        }
      </div>
    </div>
  `,
})
export class PageLoaderComponent {
  readonly label = input('Cargando…');
  readonly fullScreen = input(true, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    cn(
      this.fullScreen()
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-surface/70 backdrop-blur-sm'
        : 'flex w-full items-center justify-center py-16',
    ),
  );
}
