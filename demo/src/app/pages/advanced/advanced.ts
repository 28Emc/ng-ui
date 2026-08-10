import { Component, signal, inject, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  CheckboxComponent,
  CopyToClipboardButtonComponent,
  ThemeSwitcherComponent,
  DragDropListComponent,
  SparklineComponent,
  VirtualScrollListComponent,
  InfiniteScrollTableComponent,
  RadioGroupComponent,
  RadioComponent,
  ProgressComponent,
  TooltipDirective,
  ScreenReaderOnlyComponent,
  ToastService,
  ToastHostComponent,
  TabsComponent,
  TabComponent,
  AccordionComponent,
  AccordionItemComponent,
  StepperComponent,
  TableComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  PaginationComponent,
  BreadcrumbComponent,
  SidebarComponent,
  type UiBreadcrumbItem,
  type UiSidebarItem,
  type TableColumn,
} from '@emc-dev/ng-ui';
import {
  LucideBarChart3,
  LucideBell,
  LucideHome,
  LucideLayoutDashboard,
  LucideSettings,
  LucideTrash2,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-advanced-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    CheckboxComponent,
    CopyToClipboardButtonComponent,
    ThemeSwitcherComponent,
    DragDropListComponent,
    SparklineComponent,
    VirtualScrollListComponent,
    InfiniteScrollTableComponent,
    RadioGroupComponent,
    RadioComponent,
    ProgressComponent,
    TooltipDirective,
    ScreenReaderOnlyComponent,
    ToastHostComponent,
    TabsComponent,
    TabComponent,
    AccordionComponent,
    AccordionItemComponent,
    StepperComponent,
    TableComponent,
    PaginationComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BreadcrumbComponent,
    SidebarComponent,
    LucideTrash2,
  ],
  template: `
    <h1 class="mb-8 text-xl font-semibold text-fg">Advanced Components</h1>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Checkbox & RadioGroup</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <ui-card>
          <ui-card-header title="Checkbox" subtitle="ControlValueAccessor" />
          <ui-card-body class="space-y-3">
            <ui-checkbox label="Acepto los términos" [(ngModel)]="check1" />
            <ui-checkbox
              label="Suscribirme al newsletter"
              description="Opcional"
              [(ngModel)]="check2"
            />
            <ui-checkbox label="Deshabilitado" [disabled]="true" />
          </ui-card-body>
        </ui-card>
        <ui-card>
          <ui-card-header title="RadioGroup" subtitle="Selección única" />
          <ui-card-body>
            <ui-radio-group [(ngModel)]="radioValue" label="Plan">
              <ui-radio value="free" label="Gratis" description="1 proyecto, 1 GB" />
              <ui-radio value="pro" label="Pro" description="Proyectos ilimitados, 50 GB" />
              <ui-radio
                value="enterprise"
                label="Enterprise"
                description="Personalizado, soporte 24/7"
              />
            </ui-radio-group>
          </ui-card-body>
        </ui-card>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Progress</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <ui-card>
          <ui-card-header title="Determinado" subtitle="Valores 0-100" />
          <ui-card-body class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Progreso</span><span>{{ progressVal() }}%</span>
              </div>
              <ui-progress [value]="progressVal" />
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Completado</span><span>100%</span>
              </div>
              <ui-progress [value]="100" size="lg" />
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Pequeño</span><span>30%</span>
              </div>
              <ui-progress [value]="30" size="sm" />
            </div>
          </ui-card-body>
        </ui-card>
        <ui-card>
          <ui-card-header title="Indeterminado" subtitle="Carga indefinida" />
          <ui-card-body class="space-y-4">
            <ui-progress [indeterminate]="true" size="lg" />
          </ui-card-body>
        </ui-card>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Tooltip</h2>
      <div
        class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-10"
      >
        <ui-button variant="secondary" uiTooltip="Tooltip arriba" placement="top"
          >Hover arriba</ui-button
        >
        <ui-button variant="secondary" uiTooltip="Tooltip abajo" placement="bottom"
          >Hover abajo</ui-button
        >
        <ui-button variant="secondary" uiTooltip="Tooltip izquierda" placement="left"
          >Hover izq.</ui-button
        >
        <ui-button variant="secondary" uiTooltip="Tooltip derecha" placement="right"
          >Hover der.</ui-button
        >
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">ScreenReaderOnly</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        oculta visualmente · mantiene el contenido accesible para lectores de pantalla
      </p>
      <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
        <div class="flex flex-wrap items-center gap-3">
          <ui-button variant="danger">
            <svg lucideTrash2 [size]="16" [strokeWidth]="2" />
            <ui-screen-reader-only>Eliminar usuario</ui-screen-reader-only>
          </ui-button>
          <span class="text-sm text-muted">Botón de solo icono con etiqueta invisible</span>
        </div>
        <p class="text-sm text-muted">
          Este párrafo es visible e incluye
          <ui-screen-reader-only
            >un mensaje de ayuda solo para lectores de pantalla</ui-screen-reader-only
          >
          dentro del mismo flujo de texto.
        </p>
        <ui-screen-reader-only>
          <h3 class="text-sm font-semibold text-fg">Atajos de teclado</h3>
        </ui-screen-reader-only>
        <p class="text-sm text-muted">
          El encabezado superior está oculto visualmente; los lectores de pantalla lo anuncian como
          "Atajos de teclado".
        </p>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">CopyToClipboardButton</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        copia al portapapeles · feedback visual · fallback execCommand
      </p>
      <div
        class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4"
      >
        <div class="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
          <code class="text-sm text-fg">pnpm add emc-ui</code>
          <ui-copy-button text="pnpm add emc-ui" />
        </div>
        <ui-copy-button
          text="npm i emc-ui"
          label="Copiar comando"
          copiedLabel="¡Copiado!"
          variant="secondary"
          size="sm"
        />
        <ui-copy-button text="texto" size="md" />
        <ui-copy-button text="no copia" [disabled]="true" />
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">ThemeSwitcher</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        alterna claro/oscuro · persiste en localStorage · sincronizado entre instancias
      </p>
      <div
        class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4"
      >
        <ui-theme-switcher />
        <ui-theme-switcher variant="secondary" />
        <ui-theme-switcher variant="outline" size="icon-sm" />
        <ui-theme-switcher labelLight="Activar modo oscuro" labelDark="Activar modo claro" />
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">DragDropList</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        lista ordenable por arrastre · soporte de teclado (Espacio + ↑/↓) · modelo en tiempo real
      </p>
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-default bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-fg">Lista simple</h3>
          <ui-drag-drop-list
            [items]="dragItems()"
            (itemsChange)="dragItems.set($event)"
            handleLabel="Mover tarea"
          />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-fg">Template personalizado</h3>
          <ui-drag-drop-list
            [items]="dragTodos()"
            (itemsChange)="dragTodos.set($event)"
            [itemTemplate]="row"
            [trackBy]="trackTodoById"
            handleLabel="Mover tarea"
          >
            <ng-template #row let-item>
              <div class="flex flex-1 items-center gap-3">
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-600"
                >
                  {{ todoInitials(item.title) }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-fg">{{ item.title }}</p>
                  <p class="truncate text-xs text-muted">{{ item.status }}</p>
                </div>
              </div>
            </ng-template>
          </ui-drag-drop-list>
        </div>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Sparkline</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        mini-gráfico de tendencia · SVG puro · sin dependencias de charting · 3 estáticas + 3 en
        tiempo real (mock: llega data nueva y se limpia la ventana antigua)
      </p>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">Visitas mensuales</p>
          <ui-sparkline [data]="sparkUp()" label="Visitas mensuales" />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">Área + suave</p>
          <ui-sparkline [data]="sparkUp()" [fill]="true" [smooth]="true" />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">Escala compartida (0-100)</p>
          <ui-sparkline
            [data]="sparkScale()"
            [width]="200"
            [smooth]="true"
            [min]="0"
            [max]="100"
            color="var(--color-accent-blue)"
          />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">CPU en vivo · ventana 24 · tick 900ms</p>
          <ui-sparkline [data]="liveCpu()" [fill]="true" [smooth]="true" label="CPU en vivo" />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">Latencia en vivo · ventana 40 · tick 450ms</p>
          <ui-sparkline
            [data]="liveLatency()"
            [width]="200"
            [height]="50"
            [smooth]="true"
            color="var(--color-accent-coral)"
            label="Latencia en vivo"
          />
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <p class="mb-1 text-xs text-muted">
            Ventas en vivo · ventana 20 · escala 0-100 · tick 1200ms
          </p>
          <ui-sparkline
            [data]="liveSales()"
            [smooth]="true"
            [min]="0"
            [max]="100"
            color="var(--color-accent-blue)"
            label="Ventas en vivo"
          />
        </div>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">VirtualScrollList</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        lista virtual · renderiza solo los ítems visibles · ventana [start-end] · selección múltiple
        con teclado
      </p>
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-default bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-fg">10.000 registros</h3>
          <ui-virtual-scroll-list
            [items]="bigList()"
            [height]="320"
            [itemHeight]="40"
            ariaLabel="Registros virtuales"
            (rangeChange)="vsRange.set($event)"
            (endReached)="vsEnds = vsEnds + 1"
          />
          <p class="mt-2 text-xs text-muted">
            Ventana [{{ vsRange().start }} – {{ vsRange().end }}] · fin alcanzado:
            {{ vsEnds }} vez(es)
          </p>
        </div>
        <div class="rounded-xl border border-default bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-fg">Selección múltiple</h3>
          <ui-virtual-scroll-list
            [items]="vsProjects()"
            [height]="320"
            [selectable]="true"
            [(selection)]="vsSelection"
            ariaLabel="Proyectos"
          />
          <p class="mt-2 text-xs text-muted">Seleccionados: {{ vsSelection().length }}</p>
        </div>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Toast (servicio)</h2>
      <ui-toast-host />
      <div class="flex flex-wrap items-center gap-3">
        <ui-button (click)="toast.info('Info', 'Operación completada')">Info</ui-button>
        <ui-button (click)="toast.success('Éxito', 'Datos guardados')">Success</ui-button>
        <ui-button (click)="toast.warning('Advertencia', 'Revisa los datos')">Warning</ui-button>
        <ui-button (click)="toast.error('Error', 'No se pudo guardar')">Error</ui-button>
        <ui-button variant="secondary" (click)="toastWithAction()">Con acción</ui-button>
        <ui-button variant="secondary" (click)="toastBurst()">Ráfaga (máx 3)</ui-button>
        <ui-button variant="ghost" (click)="toastCyclePosition()">Posición</ui-button>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Tabs</h2>
      <ui-tabs [defaultIndex]="0" [(activeIndex)]="activeTab">
        <ui-tab label="Cuenta" disabled="false">
          <p class="p-4 text-muted">Contenido de la pestaña Cuenta</p>
        </ui-tab>
        <ui-tab label="Perfil">
          <p class="p-4 text-muted">Contenido de la pestaña Perfil</p>
        </ui-tab>
        <ui-tab label="Notificaciones">
          <p class="p-4 text-muted">Contenido de Notificaciones</p>
        </ui-tab>
        <ui-tab label="Deshabilitada" disabled="true">
          <p class="p-4 text-muted">No se muestra</p>
        </ui-tab>
      </ui-tabs>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Accordion</h2>
      <ui-accordion [multiple]="false">
        <ui-accordion-item title="¿Qué es emc-ui?" description="Pregunta frecuente">
          <p class="text-sm text-muted">
            emc-ui es un design system Angular basado en Tailwind CSS v4 y CDK.
          </p>
        </ui-accordion-item>
        <ui-accordion-item title="¿Cómo instalar?">
          <pre class="bg-surface-2 p-4 rounded-lg text-xs overflow-x-auto">pnpm add emc-ui</pre>
        </ui-accordion-item>
        <ui-accordion-item title="¿Soporta dark mode?" disabled="true">
          <p class="text-sm text-muted">Sí, añadiendo .dark al html.</p>
        </ui-accordion-item>
      </ui-accordion>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Stepper</h2>
      <ui-stepper
        [steps]="3"
        [labels]="['Paso 1', 'Paso 2', 'Paso 3']"
        [(activeIndex)]="stepperIndex"
      />
      <div class="mt-4 flex gap-2">
        <ui-button variant="secondary" (click)="prevStep()" [disabled]="stepperIndex() === 0"
          >Anterior</ui-button
        >
        <ui-button (click)="nextStep()" [disabled]="stepperIndex() === 2">Siguiente</ui-button>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Table (ordenable + paginable)</h2>
      <ui-table
        [columns]="tableColumns"
        [data]="tableData"
        [pageSize]="5"
        [striped]="true"
        [trackBy]="trackById"
        (rowClick)="onRowClick($event)"
      />
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">InfiniteScrollTable (carga bajo demanda)</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        scroll infinito · sticky header · sorting · fila de carga · 1000 registros en lotes de 30
      </p>
      <div class="rounded-xl border border-default bg-surface p-4">
        <ui-infinite-scroll-table
          [columns]="istColumns"
          [data]="istRows()"
          [loading]="istLoading()"
          [hasMore]="istHasMore()"
          [height]="380"
          [striped]="true"
          (loadMore)="istLoadMore()"
          (rowClick)="onRowClick($event)"
        />
        <p class="mt-2 text-xs text-muted">
          Cargadas: {{ istRows().length }} de {{ istTotal }} ·
          {{ istHasMore() ? 'hay más…' : 'sin más datos' }}
        </p>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Pagination</h2>
      <ui-card>
        <ui-card-header title="Paginación" subtitle="120 ítems, 10 por página" />
        <ui-card-body class="flex flex-wrap items-center justify-between gap-3">
          <ui-pagination [(page)]="paginationPage" [total]="120" [pageSize]="10" />
          <span class="text-sm text-muted">Página {{ paginationPage() }}</span>
        </ui-card-body>
      </ui-card>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Breadcrumb</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        rutas con enlaces · colapso responsivo (maxItems)
      </p>
      <ui-card>
        <ui-card-header
          title="Breadcrumb"
          subtitle="Primero y último visibles, el resto en el menú ⋯"
        />
        <ui-card-body class="space-y-6">
          <ui-breadcrumb [items]="breadcrumbItems" [maxItems]="3" />
          <ui-breadcrumb [items]="breadcrumbItems" />
        </ui-card-body>
      </ui-card>
    </section>

    <section class="mt-10">
      <h2 class="mb-4 text-lg font-semibold text-fg">Sidebar</h2>
      <p class="mb-2 text-sm font-medium text-muted">
        navegación lateral · sub-menús · modo mini con flyout · persistencia del estado
      </p>
      <ui-card>
        <ui-card-header
          title="Sidebar"
          subtitle="Colapsa con el botón inferior; el estado se guarda en localStorage"
        />
        <ui-card-body>
          <div class="flex h-[26rem] overflow-hidden rounded-xl border border-default bg-surface-2">
            <ui-sidebar
              [items]="sidebarItems"
              [collapsed]="sidebarCollapsed()"
              (collapsedChange)="onSidebarCollapsedChange($event)"
              [activeKey]="sidebarActiveKey()"
              (activeKeyChange)="onSidebarActiveKeyChange($event)"
              [openKeys]="sidebarOpenKeys()"
              (openKeysChange)="onSidebarOpenKeysChange($event)"
            />
            <div class="flex-1 bg-app p-6">
              <p class="text-sm text-muted">
                Contenido principal. Colapsa el sidebar para ver el modo mini con flyout en los
                grupos.
              </p>
            </div>
          </div>
        </ui-card-body>
      </ui-card>
    </section>
  `,
})
export class AdvancedPage {
  protected readonly check1 = signal(false);
  protected readonly check2 = signal(false);
  protected readonly radioValue = signal('free');
  protected readonly progressVal = signal(65);
  protected readonly activeTab = signal(0);
  protected readonly stepperIndex = signal(0);
  protected readonly paginationPage = signal(1);
  protected readonly toast = inject(ToastService);

  protected readonly dragItems = signal([
    'Comprar pan',
    'Enviar email',
    'Revisar PR',
    'Llamar al cliente',
  ]);

  protected readonly dragTodos = signal([
    { id: 1, title: 'Configurar CI', status: 'En progreso' },
    { id: 2, title: 'Escribir documentación', status: 'Pendiente' },
    { id: 3, title: 'Revisar diseño', status: 'Hecho' },
    { id: 4, title: 'Publicar release', status: 'Bloqueado' },
  ]);

  protected readonly sparkUp = signal([12, 18, 15, 22, 28, 25, 34, 31, 42]);
  protected readonly sparkScale = signal([55, 70, 62, 80, 75]);

  protected readonly liveCpu = signal<number[]>(this.seedWalk(23, 45, 6, 5, 95));
  protected readonly liveLatency = signal<number[]>(this.seedWalk(39, 100, 18, 30, 220));
  protected readonly liveSales = signal<number[]>(this.seedWalk(19, 40, 9, 0, 100));

  protected readonly bigList = signal(
    Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `Registro ${i + 1}` })),
  );
  protected readonly vsRange = signal({ start: 0, end: 0 });
  protected vsEnds = 0;

  protected readonly vsProjects = signal(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      name: `Proyecto ${i + 1}`,
      status: ['Activo', 'Pausado', 'Archivado'][i % 3],
    })),
  );
  protected readonly vsSelection = signal<{ id: number; name: string; status: string }[]>([]);

  constructor() {
    interval(900)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.pushLiveSample(this.liveCpu, 24, 6, 5, 95));
    interval(450)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.pushLiveSample(this.liveLatency, 40, 18, 30, 220));
    interval(1200)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.pushLiveSample(this.liveSales, 20, 9, 0, 100));
  }

  private nextWalk(prev: number, step: number, min: number, max: number): number {
    const v = prev + (Math.random() * 2 - 1) * step;
    return Math.round(Math.max(min, Math.min(max, v)));
  }

  private seedWalk(count: number, start: number, step: number, min: number, max: number): number[] {
    const arr: number[] = [];
    let v = start;
    for (let i = 0; i < count; i++) {
      arr.push(Math.round(v));
      v = this.nextWalk(v, step, min, max);
    }
    return arr;
  }

  private pushLiveSample(
    target: WritableSignal<number[]>,
    windowSize: number,
    step: number,
    min: number,
    max: number,
  ): void {
    target.update((current) => {
      const last = current[current.length - 1] ?? min + (max - min) / 2;
      const next = this.nextWalk(last, step, min, max);
      return current.length >= windowSize ? [...current.slice(1), next] : [...current, next];
    });
  }

  protected trackTodoById = (item: any) => item.id;

  protected todoInitials(title: string): string {
    return title
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  protected readonly breadcrumbItems: UiBreadcrumbItem[] = [
    { label: 'Inicio', routerLink: ['/'] },
    { label: 'Inputs', routerLink: ['/inputs'] },
    { label: 'Overlays', routerLink: ['/overlays'] },
    { label: 'Feedback', routerLink: ['/feedback'] },
    { label: 'Layout', routerLink: ['/layout'] },
    { label: 'Advanced', routerLink: ['/advanced'] },
    { label: 'Página actual' },
  ];

  protected readonly sidebarCollapsed = signal(
    localStorage.getItem('emc-ui-sidebar-collapsed') === 'true',
  );
  protected readonly sidebarActiveKey = signal<string | null>(
    localStorage.getItem('emc-ui-sidebar-active'),
  );
  protected readonly sidebarOpenKeys = signal<string[]>(
    JSON.parse(localStorage.getItem('emc-ui-sidebar-open') ?? '[]'),
  );

  protected readonly sidebarItems: UiSidebarItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LucideLayoutDashboard, routerLink: ['/'] },
    {
      key: 'proyectos',
      label: 'Proyectos',
      icon: LucideHome,
      badge: 5,
      children: [
        { key: 'todos', label: 'Todos', routerLink: ['/inputs'] },
        {
          key: 'activos',
          label: 'Activos',
          children: [
            { key: 'campañas', label: 'Campañas', routerLink: ['/overlays'] },
            { key: 'sitios', label: 'Sitios', routerLink: ['/feedback'] },
          ],
        },
        { key: 'archivados', label: 'Archivados', routerLink: ['/layout'] },
      ],
    },
    {
      key: 'equipo',
      label: 'Equipo',
      icon: LucideUsers,
      children: [
        { key: 'miembros', label: 'Miembros', routerLink: ['/layout'] },
        { key: 'roles', label: 'Roles', routerLink: ['/advanced'] },
      ],
    },
    { key: 'reportes', label: 'Reportes', icon: LucideBarChart3, routerLink: ['/feedback'] },
    {
      key: 'notificaciones',
      label: 'Notificaciones',
      icon: LucideBell,
      badge: 12,
      routerLink: ['/overlays'],
    },
    { key: 'ajustes', label: 'Ajustes', icon: LucideSettings, routerLink: ['/advanced'] },
  ];

  protected onSidebarCollapsedChange(value: boolean): void {
    this.sidebarCollapsed.set(value);
    localStorage.setItem('emc-ui-sidebar-collapsed', String(value));
  }

  protected onSidebarActiveKeyChange(value: string | null): void {
    this.sidebarActiveKey.set(value);
    if (value === null) {
      localStorage.removeItem('emc-ui-sidebar-active');
    } else {
      localStorage.setItem('emc-ui-sidebar-active', value);
    }
  }

  protected onSidebarOpenKeysChange(value: string[]): void {
    this.sidebarOpenKeys.set(value);
    localStorage.setItem('emc-ui-sidebar-open', JSON.stringify(value));
  }

  protected readonly tableColumns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rol', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
  ];

  protected readonly tableData = [
    { id: 1, name: 'Ana García', email: 'ana@empresa.com', role: 'Admin', status: 'Activo' },
    { id: 2, name: 'Carlos López', email: 'carlos@empresa.com', role: 'Editor', status: 'Activo' },
    { id: 3, name: 'María Ruiz', email: 'maria@empresa.com', role: 'Viewer', status: 'Inactivo' },
    { id: 4, name: 'Pedro Martín', email: 'pedro@empresa.com', role: 'Admin', status: 'Activo' },
    { id: 5, name: 'Laura Gómez', email: 'laura@empresa.com', role: 'Editor', status: 'Pendiente' },
    { id: 6, name: 'Jorge Díaz', email: 'jorge@empresa.com', role: 'Viewer', status: 'Activo' },
    { id: 7, name: 'Sofía Herrera', email: 'sofia@empresa.com', role: 'Admin', status: 'Inactivo' },
    { id: 8, name: 'Miguel Torres', email: 'miguel@empresa.com', role: 'Editor', status: 'Activo' },
  ];

  protected nextStep(): void {
    this.stepperIndex.update((v) => Math.min(v + 1, 2));
  }

  protected prevStep(): void {
    this.stepperIndex.update((v) => Math.max(v - 1, 0));
  }

  protected onRowClick(row: any): void {
    this.toast.info('Fila clickeada', row.name);
  }

  protected readonly istColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { key: 'amount', label: 'Monto', sortable: true, align: 'right' },
  ];
  protected readonly istTotal = 1000;
  protected readonly istRows = signal(Array.from({ length: 30 }, (_, i) => this.makeIstRow(i)));
  protected readonly istLoading = signal(false);
  protected readonly istHasMore = signal(true);

  protected makeIstRow(i: number): {
    id: number;
    name: string;
    email: string;
    role: string;
    amount: number;
  } {
    const names = ['Ana Torres', 'Carlos Pérez', 'Lucía Gómez', 'Marco Ruiz', 'Sofía Díaz'];
    const roles = ['Admin', 'Editor', 'Viewer'];
    return {
      id: i + 1,
      name: names[i % names.length],
      email: `usuario${i + 1}@empresa.com`,
      role: roles[i % roles.length],
      amount: Math.round(120 + ((i * 97) % 9800)),
    };
  }

  protected istLoadMore(): void {
    if (this.istLoading()) return;
    this.istLoading.set(true);
    setTimeout(() => {
      this.istRows.update((rows) => [
        ...rows,
        ...Array.from({ length: 30 }, (_, i) => this.makeIstRow(rows.length + i)),
      ]);
      this.istLoading.set(false);
      this.istHasMore.set(this.istRows().length < this.istTotal);
    }, 450);
  }

  protected toastWithAction(): void {
    this.toast.toast({
      title: 'Documento borrado',
      description: 'Se moverá a la papelera',
      variant: 'warning',
      action: {
        label: 'Deshacer',
        onClick: () => this.toast.success('Restaurado', 'El documento se recuperó.'),
      },
    });
  }

  protected toastBurst(): void {
    this.toast.maxToasts.set(3);
    for (let i = 1; i <= 4; i++) {
      this.toast.info(`Toast ${i}`, `Mensaje número ${i}`);
    }
  }

  protected toastCyclePosition(): void {
    const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
    const current = positions.indexOf(this.toast.position());
    const next = positions[(current + 1) % positions.length];
    this.toast.position.set(next);
    this.toast.info('Posición', `Moviendo la pila a ${next}`);
  }

  protected trackById = (row: any) => row.id;
}
