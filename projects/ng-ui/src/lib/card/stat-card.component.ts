import { Component, computed, input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { cn } from '../utils/cn';

export type StatCardAccent = 'brand' | 'green' | 'amber' | 'pink';

const ACCENT_CLASSES: Record<StatCardAccent, string> = {
  brand: 'bg-brand-500/10 text-brand-700 dark:text-brand-300',
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  pink: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
};

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <div class="rounded-2xl border border-default bg-surface p-6 shadow-soft">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1.5">
          <p class="text-sm text-muted">{{ label() }}</p>
          <p class="text-2xl font-semibold tracking-tight text-fg">{{ value() }}</p>
          @if (sublabel()) {
            <p class="text-xs text-muted">{{ sublabel() }}</p>
          }
        </div>
        @if (icon()) {
          <span [class]="iconClasses()">
            <ng-container
              [ngComponentOutlet]="icon()"
              [ngComponentOutletInputs]="{ size: 20, strokeWidth: 2 }"
            />
          </span>
        }
      </div>
    </div>
  `,
})
export class StatCardComponent {
  readonly icon = input<Type<unknown> | null>(null);
  readonly label = input('');
  readonly value = input('');
  readonly sublabel = input('');
  readonly accent = input<StatCardAccent>('brand');

  protected readonly iconClasses = computed(() =>
    cn(
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
      ACCENT_CLASSES[this.accent()],
    ),
  );
}
