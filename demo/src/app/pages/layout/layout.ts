import { Component } from '@angular/core';
import { LucideDollarSign, LucideTrendingUp, LucideUsers, LucideBadgeCheck } from '@lucide/angular';
import {
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ExpandableCardComponent,
  StatCardComponent,
} from '@emc-dev/ng-ui';

@Component({
  selector: 'app-layout-page',
  standalone: true,
  imports: [
    BadgeComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ExpandableCardComponent,
    StatCardComponent,
  ],
  template: `
    <h1 class="mb-8 text-xl font-semibold text-fg">Layout</h1>

    <h2 class="mb-4 text-lg font-semibold text-fg">Card</h2>
    <p class="mb-2 text-sm font-medium text-muted">base · hover · con header + body</p>
    <div class="grid gap-6 md:grid-cols-3">
      <ui-card>
        <ui-card-header title="Ingresos" subtitle="Último trimestre">
          <ui-badge variant="green">+12%</ui-badge>
        </ui-card-header>
        <ui-card-body>
          <p class="text-sm text-muted">
            Contenido de ejemplo dentro de Card + CardHeader + CardBody.
          </p>
        </ui-card-body>
      </ui-card>

      <ui-card [hover]="true">
        <ui-card-body>
          <p class="text-sm font-medium text-fg">Card con hover</p>
          <p class="mt-1 text-sm text-muted">
            [hover]="true" eleva y traslada la tarjeta al pasar el cursor.
          </p>
        </ui-card-body>
      </ui-card>

      <ui-card>
        <ui-card-body>
          <p class="text-sm font-medium text-fg">Sin hover</p>
          <p class="mt-1 text-sm text-muted">Tarjeta base con shadow-soft, sin interacción.</p>
        </ui-card-body>
      </ui-card>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">ExpandableCard</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      colapsable · click / Enter · estado controlable
    </p>
    <div class="grid gap-6 md:grid-cols-2">
      <ui-expandable-card
        title="Detalles del pedido"
        subtitle="Haz clic para expandir"
        [(open)]="orderOpen"
      >
        <p class="text-sm text-muted">
          Contenido expandible: número de pedido, estado, total y notas del cliente.
        </p>
      </ui-expandable-card>

      <ui-expandable-card
        title="Configuración avanzada"
        subtitle="Esta tarjeta inicia expandida"
        [open]="true"
      >
        <p class="text-sm text-muted">
          Configuración de notificaciones, zona horaria y preferencias de seguridad.
        </p>
      </ui-expandable-card>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">StatCard</h2>
    <p class="mb-2 text-sm font-medium text-muted">accent: brand / green / amber / pink</p>
    <div class="grid gap-6 md:grid-cols-4">
      <ui-stat-card
        [icon]="LucideDollarSign"
        label="Ingresos"
        value="$12,480"
        sublabel="vs $9,300 el mes pasado"
        accent="brand"
      />
      <ui-stat-card
        [icon]="LucideTrendingUp"
        label="Conversión"
        value="3.2%"
        sublabel="+0.4% este mes"
        accent="green"
      />
      <ui-stat-card
        [icon]="LucideUsers"
        label="Usuarios activos"
        value="1,284"
        sublabel="+86 esta semana"
        accent="amber"
      />
      <ui-stat-card
        [icon]="LucideBadgeCheck"
        label="Formularios completados"
        value="892"
        sublabel="98% de precisión"
        accent="pink"
      />
    </div>
  `,
})
export class LayoutPage {
  protected readonly LucideDollarSign = LucideDollarSign;
  protected readonly LucideTrendingUp = LucideTrendingUp;
  protected readonly LucideUsers = LucideUsers;
  protected readonly LucideBadgeCheck = LucideBadgeCheck;
  protected orderOpen = false;
}
