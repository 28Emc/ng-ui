import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { run, type Result } from 'axe-core';

import { ModalComponent } from '../modal/modal.component';
import { UiModalFooterDirective } from '../modal/modal-footer.directive';
import { ConfirmModalComponent } from '../modal/confirm-modal.component';
import { DrawerComponent } from '../drawer/drawer.component';
import { TabsComponent } from '../tabs/tabs.component';
import { TabComponent } from '../tabs/tab.component';
import { StepperComponent } from '../stepper/stepper.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { PopoverComponent } from '../popover/popover.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { MenuItemComponent } from '../dropdown/menu-item.component';
import { MenuDividerComponent } from '../dropdown/menu-divider.component';
import { ToastComponent } from '../toast/toast.component';
import { DatePickerComponent } from '../datepicker/datepicker.component';
import { ComboboxComponent } from '../combobox/combobox.component';
import { MultiSelectComponent } from '../multiselect/multiselect.component';
import { InputComponent } from '../input/input.component';
import { FieldComponent } from '../input/field.component';
import { SelectComponent } from '../input/select.component';
import { MaskedInputComponent } from '../input/masked-input.component';
import { RadioGroupComponent } from '../radio/radio-group.component';
import { RadioComponent } from '../radio/radio.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { SwitchComponent } from '../switch/switch.component';
import { ProgressComponent } from '../progress/progress.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { AccordionComponent } from '../accordion/accordion.component';
import { AccordionItemComponent } from '../accordion/accordion-item.component';
import { ExpandableCardComponent } from '../expandable-card/expandable-card.component';
import { BadgeComponent } from '../feedback/badge.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { AvatarGroupComponent } from '../avatar/avatar-group.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { EmptyStateComponent } from '../feedback/empty-state.component';
import { StatCardComponent } from '../card/stat-card.component';
import { PageLoaderComponent } from '../feedback/page-loader.component';
import { SparklineComponent } from '../sparkline/sparkline.component';
import { ScreenReaderOnlyComponent } from '../screen-reader-only/screen-reader-only.component';
import { FormSectionComponent } from '../form-section/form-section.component';
import { SkeletonComponent } from '../feedback/skeleton.component';
import { SpinnerComponent } from '../feedback/spinner.component';
import { SkipLinkComponent } from '../feedback/skip-link.component';
import { TagInputComponent } from '../taginput/taginput.component';
import { RatingComponent } from '../rating/rating.component';

interface A11yViolation {
  id: string;
  impact: Result['impact'];
  help: string;
  nodes: string[];
}

function formatViolations(violations: A11yViolation[]): string {
  return violations
    .map((v) => `  - ${v.id} (${v.impact ?? 'n/a'}): ${v.help} @ ${v.nodes.join(', ')}`)
    .join('\n');
}

async function getViolations(scope: string | Element): Promise<A11yViolation[]> {
  const results = await run(scope, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  });
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
}

async function expectClean(scope: string | Element, label: string): Promise<void> {
  const violations = await getViolations(scope);
  expect(
    violations,
    `${label} should have no a11y violations\n${formatViolations(violations)}`,
  ).toEqual([]);
}

function createHost<T>(cls: new () => T): ComponentFixture<T> {
  const fixture = TestBed.createComponent(cls);
  fixture.detectChanges();
  return fixture;
}

describe('ng-ui a11y (axe-core, WCAG A/AA)', () => {
  afterEach(() => {
    const overlay = TestBed.inject(OverlayContainer, null, { optional: true });
    if (overlay) overlay.getContainerElement().innerHTML = '';
    document.body.innerHTML = '';
  });

  /* ---------------------------------- hosts ---------------------------------- */

  @Component({
    standalone: true,
    imports: [ModalComponent, UiModalFooterDirective],
    template: `
      <ui-modal [open]="true" title="Confirmación" subtitle="Revise la información">
        <p>¿Desea continuar con el proceso?</p>
        <div uiModalFooter>
          <button>Cancelar</button>
          <button>Aceptar</button>
        </div>
      </ui-modal>
    `,
  })
  class ModalHost {}

  @Component({
    standalone: true,
    imports: [ConfirmModalComponent],
    template: `
      <ui-confirm-modal
        [open]="true"
        title="Eliminar registro"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      ></ui-confirm-modal>
    `,
  })
  class ConfirmModalHost {}

  @Component({
    standalone: true,
    imports: [DrawerComponent],
    template: `
      <ui-drawer [open]="true" title="Detalles" subtitle="Información del pedido">
        <p>Contenido del panel lateral.</p>
      </ui-drawer>
    `,
  })
  class DrawerHost {}

  @Component({
    standalone: true,
    imports: [TabsComponent, TabComponent],
    template: `
      <ui-tabs label="Configuración">
        <ui-tab label="General">Contenido general</ui-tab>
        <ui-tab label="Avanzado">Contenido avanzado</ui-tab>
      </ui-tabs>
    `,
  })
  class TabsHost {}

  @Component({
    standalone: true,
    imports: [StepperComponent],
    template: `<ui-stepper [steps]="3" [labels]="['Datos', 'Pago', 'Listo']"></ui-stepper>`,
  })
  class StepperHost {}

  @Component({
    standalone: true,
    imports: [TooltipDirective],
    template: `<button [uiTooltip]="'Ayuda contextual'" placement="top">Hover</button>`,
  })
  class TooltipHost {}

  @Component({
    standalone: true,
    imports: [PopoverComponent],
    template: `
      <ui-popover label="Acciones" ariaLabel="Opciones de acciones">
        <p>Opciones del popover</p>
      </ui-popover>
    `,
  })
  class PopoverHost {}

  @Component({
    standalone: true,
    imports: [DropdownComponent, MenuItemComponent, MenuDividerComponent],
    template: `
      <ui-dropdown label="Acciones" ariaLabel="Menú de acciones">
        <ui-menu-item>Editar</ui-menu-item>
        <ui-menu-divider></ui-menu-divider>
        <ui-menu-item>Eliminar</ui-menu-item>
      </ui-dropdown>
    `,
  })
  class DropdownHost {}

  @Component({
    standalone: true,
    imports: [ToastComponent],
    template: `<ui-toast [toast]="toast()"></ui-toast>`,
  })
  class ToastHost {
    readonly toast = signal({
      id: 't1',
      title: 'Guardado',
      description: 'Los cambios se aplicaron',
      variant: 'success' as const,
      duration: 0,
    });
  }

  @Component({
    standalone: true,
    imports: [DatePickerComponent],
    template: `<ui-datepicker value="2026-08-10" placeholder="Seleccionar fecha"></ui-datepicker>`,
  })
  class DatePickerHost {}

  @Component({
    standalone: true,
    imports: [FieldComponent, ComboboxComponent],
    template: `
      <ui-field label="Buscar">
        <ui-combobox [options]="['Opción A', 'Opción B']" placeholder="Buscar…"></ui-combobox>
      </ui-field>
    `,
  })
  class ComboboxHost {}

  @Component({
    standalone: true,
    imports: [FieldComponent, MultiSelectComponent],
    template: `
      <ui-field label="Categorías">
        <ui-multiselect
          [options]="['Diseño', 'Código']"
          [value]="['Diseño']"
          placeholder="Elige…"
        ></ui-multiselect>
      </ui-field>
    `,
  })
  class MultiSelectHost {}

  @Component({
    standalone: true,
    imports: [FieldComponent, InputComponent],
    template: `
      <ui-field label="Nombre" hint="Solo letras">
        <ui-input placeholder="Escribe tu nombre"></ui-input>
      </ui-field>
    `,
  })
  class FieldInputHost {}

  @Component({
    standalone: true,
    imports: [FieldComponent, SelectComponent],
    template: `
      <ui-field label="Elige una opción">
        <ui-select>
          <option value="a">Opción A</option>
          <option value="b">Opción B</option>
        </ui-select>
      </ui-field>
    `,
  })
  class FieldSelectHost {}

  @Component({
    standalone: true,
    imports: [FieldComponent, MaskedInputComponent],
    template: `
      <ui-field label="CUIT">
        <ui-masked-input mask="##-########-#" placeholder="00-00000000-0"></ui-masked-input>
      </ui-field>
    `,
  })
  class FieldMaskedHost {}

  @Component({
    standalone: true,
    imports: [RadioGroupComponent, RadioComponent],
    template: `
      <ui-radio-group label="Medio de pago">
        <ui-radio value="card" label="Tarjeta"></ui-radio>
        <ui-radio value="cash" label="Efectivo"></ui-radio>
      </ui-radio-group>
    `,
  })
  class RadioHost {}

  @Component({
    standalone: true,
    imports: [CheckboxComponent],
    template: `<ui-checkbox label="Acepto los términos"></ui-checkbox>`,
  })
  class CheckboxHost {}

  @Component({
    standalone: true,
    imports: [SwitchComponent],
    template: `<ui-switch label="Notificaciones"></ui-switch>`,
  })
  class SwitchHost {}

  @Component({
    standalone: true,
    imports: [ProgressComponent],
    template: `<ui-progress [value]="60" [max]="100" label="Carga"></ui-progress>`,
  })
  class ProgressHost {}

  @Component({
    standalone: true,
    imports: [PaginationComponent],
    template: `<ui-pagination [total]="100" [pageSize]="10" [page]="1"></ui-pagination>`,
  })
  class PaginationHost {}

  @Component({
    standalone: true,
    imports: [AccordionComponent, AccordionItemComponent],
    template: `
      <ui-accordion>
        <ui-accordion-item title="¿Cómo funciona?" [open]="true">Respuesta aquí</ui-accordion-item>
      </ui-accordion>
    `,
  })
  class AccordionHost {}

  @Component({
    standalone: true,
    imports: [ExpandableCardComponent],
    template: `
      <ui-expandable-card title="Detalles" [open]="true">
        <p>Contenido expandido</p>
      </ui-expandable-card>
    `,
  })
  class ExpandableCardHost {}

  @Component({
    standalone: true,
    imports: [BadgeComponent],
    template: `<ui-badge variant="brand">Nuevo</ui-badge>`,
  })
  class BadgeHost {}

  @Component({
    standalone: true,
    imports: [AvatarComponent],
    template: `<ui-avatar name="Ana García"></ui-avatar>`,
  })
  class AvatarHost {}

  @Component({
    standalone: true,
    imports: [AvatarGroupComponent],
    template: `<ui-avatar-group [avatars]="avatars()"></ui-avatar-group>`,
  })
  class AvatarGroupHost {
    readonly avatars = signal([{ name: 'Ana García' }, { name: 'Luis Paz' }, { name: 'Mía Chen' }]);
  }

  @Component({
    standalone: true,
    imports: [BreadcrumbComponent],
    template: `<ui-breadcrumb [items]="items()"></ui-breadcrumb>`,
  })
  class BreadcrumbHost {
    readonly items = signal([{ label: 'Inicio', href: '/' }, { label: 'Actual' }]);
  }

  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `<ui-empty-state
      title="Sin datos"
      description="No hay registros disponibles"
    ></ui-empty-state>`,
  })
  class EmptyStateHost {}

  @Component({
    standalone: true,
    imports: [StatCardComponent],
    template: `<ui-stat-card label="Ventas" value="$1,234" sublabel="+12%"></ui-stat-card>`,
  })
  class StatCardHost {}

  @Component({
    standalone: true,
    imports: [PageLoaderComponent],
    template: `<ui-page-loader label="Cargando…" [fullScreen]="false"></ui-page-loader>`,
  })
  class PageLoaderHost {}

  @Component({
    standalone: true,
    imports: [SparklineComponent],
    template: `<ui-sparkline [data]="[1, 3, 2, 5, 4]" label="Tendencia"></ui-sparkline>`,
  })
  class SparklineHost {}

  @Component({
    standalone: true,
    imports: [ScreenReaderOnlyComponent],
    template: `<ui-screen-reader-only
      ><p>Texto para lectores de pantalla</p></ui-screen-reader-only
    >`,
  })
  class ScreenReaderOnlyHost {}

  @Component({
    standalone: true,
    imports: [FormSectionComponent],
    template: `<ui-form-section title="Datos personales"
      ><p>Contenido del formulario</p></ui-form-section
    >`,
  })
  class FormSectionHost {}

  @Component({
    standalone: true,
    imports: [SkeletonComponent],
    template: `<ui-skeleton class="h-4 w-24"></ui-skeleton>`,
  })
  class SkeletonHost {}

  @Component({
    standalone: true,
    imports: [SpinnerComponent],
    template: `<ui-spinner [size]="24"></ui-spinner>`,
  })
  class SpinnerHost {}

  @Component({
    standalone: true,
    imports: [SkipLinkComponent],
    template: `<ui-skip-link target="#main" label="Saltar al contenido"></ui-skip-link>`,
  })
  class SkipLinkHost {}

  @Component({
    standalone: true,
    imports: [TagInputComponent],
    template: `<ui-taginput
      [value]="['angular', 'tailwind']"
      placeholder="Añade tags"
    ></ui-taginput>`,
  })
  class TagInputHost {}

  @Component({
    standalone: true,
    imports: [RatingComponent],
    template: `<ui-rating [value]="3" [max]="5" label="Puntaje"></ui-rating>`,
  })
  class RatingHost {}

  /* ---------------------------------- tests ---------------------------------- */

  it('modal has no violations', async () => {
    await expectClean(createHost(ModalHost).nativeElement, 'ui-modal');
  });

  it('confirm-modal has no violations', async () => {
    await expectClean(createHost(ConfirmModalHost).nativeElement, 'ui-confirm-modal');
  });

  it('drawer has no violations', async () => {
    await expectClean(createHost(DrawerHost).nativeElement, 'ui-drawer');
  });

  it('tabs has no violations', async () => {
    await expectClean(createHost(TabsHost).nativeElement, 'ui-tabs');
  });

  it('stepper has no violations', async () => {
    await expectClean(createHost(StepperHost).nativeElement, 'ui-stepper');
  });

  it('tooltip trigger has no violations', async () => {
    await expectClean(createHost(TooltipHost).nativeElement, 'ui-tooltip');
  });

  it('popover (open) has no violations', async () => {
    const fixture = createHost(PopoverHost);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    await expectClean(document.body, 'ui-popover (open)');
  });

  it('dropdown (open) has no violations', async () => {
    const fixture = createHost(DropdownHost);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    await expectClean(document.body, 'ui-dropdown (open)');
  });

  it('toast has no violations', async () => {
    await expectClean(createHost(ToastHost).nativeElement, 'ui-toast');
  });

  it('datepicker (open) has no violations', async () => {
    const fixture = createHost(DatePickerHost);
    (fixture.nativeElement.querySelector('input') as HTMLInputElement).focus();
    fixture.detectChanges();
    await fixture.whenStable();
    await expectClean(document.body, 'ui-datepicker (open)');
  });

  it('combobox has no violations', async () => {
    await expectClean(createHost(ComboboxHost).nativeElement, 'ui-combobox');
  });

  it('multiselect has no violations', async () => {
    await expectClean(createHost(MultiSelectHost).nativeElement, 'ui-multiselect');
  });

  it('field + input has no violations', async () => {
    await expectClean(createHost(FieldInputHost).nativeElement, 'ui-field + ui-input');
  });

  it('field + select has no violations', async () => {
    await expectClean(createHost(FieldSelectHost).nativeElement, 'ui-field + ui-select');
  });

  it('field + masked-input has no violations', async () => {
    await expectClean(createHost(FieldMaskedHost).nativeElement, 'ui-field + ui-masked-input');
  });

  it('radio-group has no violations', async () => {
    await expectClean(createHost(RadioHost).nativeElement, 'ui-radio-group');
  });

  it('checkbox has no violations', async () => {
    await expectClean(createHost(CheckboxHost).nativeElement, 'ui-checkbox');
  });

  it('switch has no violations', async () => {
    await expectClean(createHost(SwitchHost).nativeElement, 'ui-switch');
  });

  it('progress has no violations', async () => {
    await expectClean(createHost(ProgressHost).nativeElement, 'ui-progress');
  });

  it('pagination has no violations', async () => {
    await expectClean(createHost(PaginationHost).nativeElement, 'ui-pagination');
  });

  it('accordion has no violations', async () => {
    await expectClean(createHost(AccordionHost).nativeElement, 'ui-accordion');
  });

  it('expandable-card has no violations', async () => {
    await expectClean(createHost(ExpandableCardHost).nativeElement, 'ui-expandable-card');
  });

  it('badge has no violations', async () => {
    await expectClean(createHost(BadgeHost).nativeElement, 'ui-badge');
  });

  it('avatar has no violations', async () => {
    await expectClean(createHost(AvatarHost).nativeElement, 'ui-avatar');
  });

  it('avatar-group has no violations', async () => {
    await expectClean(createHost(AvatarGroupHost).nativeElement, 'ui-avatar-group');
  });

  it('breadcrumb has no violations', async () => {
    await expectClean(createHost(BreadcrumbHost).nativeElement, 'ui-breadcrumb');
  });

  it('empty-state has no violations', async () => {
    await expectClean(createHost(EmptyStateHost).nativeElement, 'ui-empty-state');
  });

  it('stat-card has no violations', async () => {
    await expectClean(createHost(StatCardHost).nativeElement, 'ui-stat-card');
  });

  it('page-loader has no violations', async () => {
    await expectClean(createHost(PageLoaderHost).nativeElement, 'ui-page-loader');
  });

  it('sparkline has no violations', async () => {
    await expectClean(createHost(SparklineHost).nativeElement, 'ui-sparkline');
  });

  it('screen-reader-only has no violations', async () => {
    await expectClean(createHost(ScreenReaderOnlyHost).nativeElement, 'ui-screen-reader-only');
  });

  it('form-section has no violations', async () => {
    await expectClean(createHost(FormSectionHost).nativeElement, 'ui-form-section');
  });

  it('skeleton has no violations', async () => {
    await expectClean(createHost(SkeletonHost).nativeElement, 'ui-skeleton');
  });

  it('spinner has no violations', async () => {
    await expectClean(createHost(SpinnerHost).nativeElement, 'ui-spinner');
  });

  it('skip-link has no violations', async () => {
    await expectClean(createHost(SkipLinkHost).nativeElement, 'ui-skip-link');
  });

  it('taginput has no violations', async () => {
    await expectClean(createHost(TagInputHost).nativeElement, 'ui-taginput');
  });

  it('rating has no violations', async () => {
    await expectClean(createHost(RatingHost).nativeElement, 'ui-rating');
  });
});
