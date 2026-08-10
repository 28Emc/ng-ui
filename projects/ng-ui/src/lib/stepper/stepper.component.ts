import { Component, computed, input, model } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-stepper',
  standalone: true,
  imports: [LucideCheck],
  template: `
    <div class="flex items-center gap-1">
      @for (idx of indices(); track idx) {
        <div class="flex items-center gap-1">
          <div
            [class]="stepClasses(idx)"
            [attr.aria-current]="activeIndex() === idx ? 'step' : null"
          >
            @if (activeIndex() > idx) {
              <svg lucideCheck [size]="14" [strokeWidth]="2.5" class="text-white" />
            } @else if (activeIndex() === idx) {
              <span class="text-sm font-semibold text-white">{{ idx + 1 }}</span>
            } @else {
              <span class="text-sm font-medium">{{ idx + 1 }}</span>
            }
          </div>
          @if (labels().length > idx) {
            <span class="hidden md:block text-xs text-muted px-1">{{ labels()[idx] }}</span>
          }
          @if (idx < indices().length - 1) {
            <div [class]="lineClasses(idx)"></div>
          }
        </div>
      }
    </div>
  `,
})
export class StepperComponent {
  readonly steps = input<number>(3);
  readonly labels = input<string[]>([]);
  readonly activeIndex = model(0);

  protected readonly indices = computed(() => Array.from({ length: this.steps() }, (_, i) => i));

  protected readonly stepClasses = (index: number) =>
    cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
      'transition-[background-color,color,box-shadow] duration-200',
      index < this.activeIndex()
        ? 'bg-brand-500 text-white'
        : index === this.activeIndex()
          ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
          : 'bg-surface-2 text-muted',
    );

  protected readonly lineClasses = (index: number) =>
    cn(
      'h-1 w-8 flex-1 transition-colors duration-200',
      index < this.activeIndex() ? 'bg-brand-500' : 'bg-surface-2',
    );
}
