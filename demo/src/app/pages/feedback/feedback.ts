import { Component } from '@angular/core';
import { LucidePlus, LucideInbox } from '@lucide/angular';
import {
  AvatarComponent,
  AvatarGroupComponent,
  BadgeComponent,
  ButtonComponent,
  EmptyStateActionDirective,
  EmptyStateComponent,
  PageLoaderComponent,
  SkeletonComponent,
  SpinnerComponent,
} from '@emc-dev/ng-ui';

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [
    AvatarComponent,
    AvatarGroupComponent,
    BadgeComponent,
    ButtonComponent,
    EmptyStateActionDirective,
    EmptyStateComponent,
    PageLoaderComponent,
    SkeletonComponent,
    SpinnerComponent,
    LucidePlus,
  ],
  template: `
    <h1 class="mb-8 text-xl font-semibold text-fg">Feedback</h1>

    <h2 class="mb-4 text-lg font-semibold text-fg">Spinner</h2>
    <p class="mb-2 text-sm font-medium text-muted">size: 16 / 20 / 28</p>
    <div class="flex flex-wrap items-center gap-6 rounded-xl border border-default bg-surface p-4">
      <ui-spinner [size]="16" />
      <ui-spinner [size]="20" />
      <ui-spinner [size]="28" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Badge</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      variant: default / brand / green / amber / gray
    </p>
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4">
      <ui-badge variant="default">default</ui-badge>
      <ui-badge variant="brand">brand</ui-badge>
      <ui-badge variant="green">green</ui-badge>
      <ui-badge variant="amber">amber</ui-badge>
      <ui-badge variant="gray">gray</ui-badge>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Avatar</h2>
    <p class="mb-2 text-sm font-medium text-muted">size: sm / md / lg · color custom</p>
    <div class="flex flex-wrap items-center gap-4 rounded-xl border border-default bg-surface p-4">
      <ui-avatar name="Ana López" size="sm" />
      <ui-avatar name="Juan Pérez" size="md" />
      <ui-avatar name="María García" size="lg" />
      <ui-avatar name="Carlos Ruiz" color="#7e6cc0" size="lg" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">AvatarGroup</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      superpuestos · tooltip con nombres · contador +N
    </p>
    <div class="flex flex-wrap items-center gap-10 rounded-xl border border-default bg-surface p-4">
      <ui-avatar-group [avatars]="team" [max]="5" size="md" />
      <ui-avatar-group [avatars]="team" [max]="3" size="sm" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Skeleton</h2>
    <p class="mb-2 text-sm font-medium text-muted">pulso animado con bg-surface-2</p>
    <div class="space-y-3 rounded-xl border border-default bg-surface p-6">
      <div class="flex items-center gap-4">
        <ui-skeleton class="h-12 w-12 rounded-full" />
        <div class="flex-1 space-y-2">
          <ui-skeleton class="h-4 w-2/5" />
          <ui-skeleton class="h-4 w-3/5" />
        </div>
      </div>
      <ui-skeleton class="h-4 w-full" />
      <ui-skeleton class="h-4 w-4/5" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">PageLoader</h2>
    <p class="mb-2 text-sm font-medium text-muted">inline: [fullScreen]="false"</p>
    <div class="rounded-xl border border-default bg-surface p-6">
      <ui-page-loader [fullScreen]="false" label="Cargando proyectos…" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">EmptyState</h2>
    <div class="rounded-2xl border border-dashed border-default bg-surface">
      <ui-empty-state
        [icon]="LucideInbox"
        title="Sin proyectos todavía"
        description="Crea tu primer proyecto para empezar a construir formularios con Inteligencia Artificial."
      >
        <div uiEmptyStateAction>
          <ui-button variant="primary">
            <svg lucidePlus [size]="16" [strokeWidth]="2" /> Nuevo proyecto
          </ui-button>
        </div>
      </ui-empty-state>
    </div>
  `,
})
export class FeedbackPage {
  protected readonly LucideInbox = LucideInbox;
  protected readonly team = [
    { name: 'Ana López', color: '#15a18b' },
    { name: 'Juan Pérez', color: '#6f86c9' },
    { name: 'María García', color: '#c2706a' },
    { name: 'Carlos Ruiz', color: '#7e6cc0' },
    { name: 'Lucía Gómez' },
    { name: 'Pedro Sánchez', color: '#bfa23a' },
    { name: 'Sofía Herrera' },
  ];
}
