import { Component, contentChildren, model, input, effect } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { cn } from '../utils/cn';
import { TabComponent } from './tab.component';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div
      role="tablist"
      class="flex gap-1 border-b border-default"
      [attr.aria-label]="label() || null"
    >
      @for (tab of tabs(); track $index) {
        <button
          type="button"
          role="tab"
          [id]="tabId(tab)"
          [attr.aria-selected]="activeIndex() === $index"
          [attr.aria-controls]="panelId(tab)"
          [attr.aria-disabled]="tab.disabled() || null"
          [disabled]="tab.disabled()"
          [class]="tabClasses($index)"
          (click)="select($index)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    <div class="pt-4">
      @for (tab of tabs(); track $index) {
        <div
          role="tabpanel"
          [id]="panelId(tab)"
          [attr.aria-labelledby]="tabId(tab)"
          [hidden]="activeIndex() !== $index"
        >
          <ng-container [ngTemplateOutlet]="tab.contentTpl()" />
        </div>
      }
    </div>
  `,
})
export class TabsComponent {
  readonly label = input('');
  readonly activeIndex = model(0);
  readonly defaultIndex = input(0);

  readonly tabs = contentChildren(TabComponent);

  protected tabId = (tab: TabComponent) => `ui-tab-${tab.id()}`;
  protected panelId = (tab: TabComponent) => `ui-tabpanel-${tab.id()}`;

  protected readonly tabClasses = (index: number) =>
    cn(
      'px-4 py-2 text-sm font-medium rounded-t-xl transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.activeIndex() === index
        ? 'text-brand-700 dark:text-brand-400 border-b-2 border-brand-500 -mb-px'
        : 'text-muted hover:text-fg',
    );

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length > 0 && this.activeIndex() >= tabs.length) {
        this.activeIndex.set(tabs.length - 1);
      }
    });
  }

  protected select(index: number): void {
    const tab = this.tabs()[index];
    if (tab && !tab.disabled()) {
      this.activeIndex.set(index);
    }
  }
}
