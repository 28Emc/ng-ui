import {
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { filter } from 'rxjs';
import { LucideX } from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { LocaleService, UiStringKey } from '../locale/locale.service';
import { cn } from '../utils/cn';
import { focusFirstFocusable } from '../utils/focus';
import { UiDrawerFooterDirective } from './drawer-footer.directive';

let drawerUid = 0;

@Component({
  selector: 'ui-drawer',
  standalone: true,
  imports: [ButtonComponent, LucideX, CdkTrapFocus],
  template: `
    <ng-template #panel>
      <div
        [class]="panelClasses()"
        role="dialog"
        aria-modal="true"
        cdkTrapFocus
        tabindex="-1"
        [attr.aria-labelledby]="title() ? titleId : null"
      >
        <header class="flex items-start justify-between gap-4 border-b border-default px-6 py-5">
          <div class="space-y-0.5">
            <h2 [id]="titleId" class="text-balance text-lg font-semibold text-fg">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="text-sm text-muted">{{ subtitle() }}</p>
            }
          </div>
          <ui-button
            variant="ghost"
            size="icon-sm"
            [attr.aria-label]="t('close')"
            (click)="requestClose()"
          >
            <svg lucideX [size]="16" [strokeWidth]="2" />
          </ui-button>
        </header>
        <div class="flex-1 overflow-y-auto overscroll-contain px-6 py-4 scrollbar-thin">
          <ng-content />
        </div>
        @if (hasFooter()) {
          <footer class="border-t border-default px-6 py-4">
            <ng-content select="[uiDrawerFooter]" />
          </footer>
        }
      </div>
    </ng-template>
  `,
})
export class DrawerComponent {
  readonly open = model(false);
  readonly title = input('');
  readonly subtitle = input('');
  readonly width = input('w-96');
  readonly autoFocus = input(true, { transform: booleanAttribute });

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly localeService = inject(LocaleService);

  private overlayRef: OverlayRef | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private readonly uid = ++drawerUid;
  protected readonly titleId = `ui-drawer-title-${this.uid}`;

  private readonly footerSlot = contentChildren(UiDrawerFooterDirective);
  protected readonly hasFooter = computed(() => this.footerSlot().length > 0);

  protected readonly panelClasses = computed(() =>
    cn(
      'flex h-dvh flex-col border-l border-default bg-surface text-fg shadow-pop animate-slide-in-right',
      this.width(),
    ),
  );

  private readonly openEffect = effect(() => {
    if (this.open()) {
      this.attach();
    } else {
      this.detach();
    }
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.detach());
  }

  private attach(): void {
    if (this.overlayRef) {
      return;
    }
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().right('0px').top('0px'),
      hasBackdrop: true,
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    this.overlayRef.backdropClick().subscribe(() => this.requestClose());
    this.overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => this.requestClose());
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    const dialog = this.overlayRef.overlayElement.querySelector<HTMLElement>('[role="dialog"]');
    if (this.autoFocus()) {
      focusFirstFocusable(dialog ?? this.overlayRef.overlayElement);
    } else {
      dialog?.focus();
    }
  }

  private detach(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }

  protected requestClose(): void {
    this.open.set(false);
  }

  protected t(key: UiStringKey): string {
    return this.localeService.translate(key);
  }
}
