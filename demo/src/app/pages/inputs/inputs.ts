import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { LucidePlus } from '@lucide/angular';
import {
  ButtonComponent,
  ButtonSize,
  ButtonVariant,
  ComboboxComponent,
  DatePickerComponent,
  DateRangePickerComponent,
  FieldComponent,
  FormSectionComponent,
  InputComponent,
  MaskedInputComponent,
  MultiSelectComponent,
  PasswordStrengthMeterComponent,
  RatingComponent,
  SelectComponent,
  SwitchComponent,
  TagInputComponent,
  TextareaComponent,
  TimePickerComponent,
} from '@emc-dev/ng-ui';

@Component({
  selector: 'app-inputs-page',
  standalone: true,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ComboboxComponent,
    DatePickerComponent,
    DateRangePickerComponent,
    FieldComponent,
    FormSectionComponent,
    InputComponent,
    MaskedInputComponent,
    MultiSelectComponent,
    PasswordStrengthMeterComponent,
    RatingComponent,
    SelectComponent,
    SwitchComponent,
    TagInputComponent,
    TextareaComponent,
    TimePickerComponent,
    LucidePlus,
  ],
  template: `
    <h1 class="mb-8 text-xl font-semibold text-fg">Inputs</h1>

    <h2 class="mb-4 text-lg font-semibold text-fg">Button</h2>
    <p class="mb-2 text-sm font-medium text-muted">variant × size (sm / md / lg)</p>
    <div class="space-y-3">
      @for (variant of variants; track variant) {
        <div
          class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4"
        >
          <span class="w-24 shrink-0 text-sm font-medium text-muted">{{ variant }}</span>
          <ui-button [variant]="variant" size="sm">Small</ui-button>
          <ui-button [variant]="variant" size="md">Medium</ui-button>
          <ui-button [variant]="variant" size="lg">Large</ui-button>
        </div>
      }
    </div>

    <p class="mb-2 mt-6 text-sm font-medium text-muted">Icon sizes</p>
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4">
      <span class="w-24 shrink-0 text-sm font-medium text-muted">icon-sm</span>
      <ui-button variant="secondary" size="icon-sm"
        ><svg lucidePlus [size]="14" [strokeWidth]="2"
      /></ui-button>
      <span class="w-24 shrink-0 text-sm font-medium text-muted">icon</span>
      <ui-button variant="secondary" size="icon"
        ><svg lucidePlus [size]="16" [strokeWidth]="2"
      /></ui-button>
    </div>

    <p class="mb-2 mt-6 text-sm font-medium text-muted">Estados (loading / disabled / type)</p>
    <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-surface p-4">
      <ui-button variant="primary" [loading]="true">Cargando</ui-button>
      <ui-button variant="primary" [disabled]="true">Deshabilitado</ui-button>
      <ui-button variant="danger" type="button" [loading]="true">Guardando…</ui-button>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Field + Input</h2>
    <p class="mb-2 text-sm font-medium text-muted">tipos: text / email / password / search / url</p>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Texto" hint="Hint visible">
        <ui-input placeholder="Escribe algo…" />
      </ui-field>
      <ui-field label="Email" [required]="true" error="Email inválido">
        <ui-input
          type="email"
          placeholder="you@example.com"
          value="no-un-correo"
          [invalid]="true"
        />
      </ui-field>
      <ui-field label="Contraseña">
        <ui-input type="password" placeholder="••••••••" />
      </ui-field>
      <ui-field label="Búsqueda">
        <ui-input type="search" placeholder="Buscar…" />
      </ui-field>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Textarea</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Notas" hint="rows: 3">
        <ui-textarea placeholder="Escribe algo…" [rows]="3" />
      </ui-field>
      <ui-field label="Descripción larga">
        <ui-textarea placeholder="rows: 5" [rows]="5" />
      </ui-field>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Select</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Plan" hint="Con placeholder">
        <ui-select placeholder="Selecciona…">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </ui-select>
      </ui-field>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">MaskedInput</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      máscara configurable · placeholder dinámico · el modelo guarda solo dígitos (o el valor
      enmascarado con emitMasked)
    </p>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Teléfono" hint="El modelo guarda solo los dígitos">
        <ui-masked-input mask="(###) ###-####" [(ngModel)]="phoneVal" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ phoneVal ?? '—' }}</p>
      <ui-field label="Tarjeta de crédito">
        <ui-masked-input mask="#### #### #### ####" [(ngModel)]="cardVal" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ cardVal ?? '—' }}</p>
      <ui-field label="SSN">
        <ui-masked-input mask="###-##-####" [(ngModel)]="ssnVal" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ ssnVal ?? '—' }}</p>
      <ui-field label="Emitir enmascarado" hint="emitMasked: el modelo guarda el valor con formato">
        <ui-masked-input mask="(###) ###-####" [emitMasked]="true" [(ngModel)]="maskedVal" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ maskedVal ?? '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">PasswordStrengthMeter</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      campo de contraseña · barra de fuerza · criterios visuales · toggle de visibilidad
    </p>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Contraseña" hint="Mínimo 8 caracteres con números y símbolos">
        <ui-password-strength-meter [(ngModel)]="passwordVal" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ passwordVal ?? '—' }}</p>
      <ui-field label="Sin criterios" hint="showCriteria: false">
        <ui-password-strength-meter [showCriteria]="false" [(ngModel)]="passwordNoCriteriaVal" />
      </ui-field>
      <ui-field label="Deshabilitado" hint="Valor inicial predefinido">
        <ui-password-strength-meter [ngModel]="'Tr0b4dor!2026'" [disabled]="true" />
      </ui-field>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Switch</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-switch label="Activar notificaciones" description="Email semanal con el resumen" />
      <ui-switch label="Sin descripción" />
      <ui-switch label="Deshabilitado" description="No se puede cambiar" [disabled]="true" />
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Rating</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <div>
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="text-muted">Calidad del servicio</span>
          <span class="font-medium text-fg">{{ ratingVal }} / 5</span>
        </div>
        <ui-rating [(ngModel)]="ratingVal" label="Calidad del servicio" />
      </div>
      <div>
        <div class="mb-1 text-sm text-muted">Solo lectura</div>
        <ui-rating [(ngModel)]="ratingReadonly" label="Solo lectura" [readonly]="true" />
      </div>
      <div>
        <div class="mb-1 text-sm text-muted">Deshabilitado</div>
        <ui-rating [(ngModel)]="ratingVal" label="Deshabilitado" [disabled]="true" />
      </div>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Combobox</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Framework" hint="Filtra mientras escribes">
        <ui-combobox
          [options]="frameworkOptions"
          placeholder="Buscar framework…"
          [(ngModel)]="frameworkVal"
        />
      </ui-field>
      <p class="text-sm text-muted">Seleccionado: {{ frameworkVal || '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">DatePicker</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Fecha de nacimiento" hint="Se guarda en formato ISO">
        <ui-datepicker
          placeholder="Elige una fecha"
          [min]="minDate"
          [max]="maxDate"
          [(ngModel)]="dateVal"
        />
      </ui-field>
      <p class="text-sm text-muted">Valor ISO: {{ dateVal || '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">TimePicker</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Hora de inicio" hint="Se guarda en formato HH:mm (24h)">
        <ui-timepicker
          placeholder="Elige una hora"
          [min]="minTime"
          [max]="maxTime"
          [(ngModel)]="timeVal"
        />
      </ui-field>
      <ui-field label="Formato 12h" hint="Con toggle AM/PM">
        <ui-timepicker placeholder="hh:mm" format="h:mm a" [(ngModel)]="time12Val" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ timeVal || '—' }} · 12h: {{ time12Val || '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">DateRangePicker</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Rango de fechas" hint="Se guarda como [inicio, fin] ISO">
        <ui-daterangepicker
          placeholder="Elige un rango"
          [min]="minDateRange"
          [max]="maxDateRange"
          [(ngModel)]="dateRangeVal"
        />
      </ui-field>
      <p class="text-sm text-muted">
        Inicio: {{ dateRangeVal?.[0] || '—' }} · Fin: {{ dateRangeVal?.[1] || '—' }}
      </p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">MultiSelect</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Frameworks" hint="Selección múltiple con búsqueda y chips">
        <ui-multiselect
          placeholder="Elige frameworks…"
          [options]="frameworks"
          [(ngModel)]="multiVal"
        />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ multiVal?.length ? multiVal.join(', ') : '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">TagInput</h2>
    <div class="max-w-xl space-y-4 rounded-xl border border-default bg-surface p-4">
      <ui-field label="Etiquetas" hint="Enter o coma para agregar, ✕ para quitar">
        <ui-taginput placeholder="Escribe y presiona Enter…" [(ngModel)]="tagVal" [maxTags]="8" />
      </ui-field>
      <p class="text-sm text-muted">Valor: {{ tagVal?.length ? tagVal.join(', ') : '—' }}</p>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">FormSection</h2>
    <p class="mb-2 text-sm font-medium text-muted">
      agrupa campos · estado de error · espaciado consistente
    </p>
    <div class="grid gap-6 lg:grid-cols-2">
      <ui-form-section title="Datos personales" description="Tu información de contacto">
        <div class="space-y-4">
          <ui-field label="Nombre completo">
            <ui-input placeholder="Ana López" />
          </ui-field>
          <ui-field label="Email">
            <ui-input type="email" placeholder="you@example.com" />
          </ui-field>
        </div>
      </ui-form-section>

      <ui-form-section
        title="Dirección"
        description="Datos de facturación"
        [invalid]="true"
        error="El código postal es obligatorio."
      >
        <div class="space-y-4">
          <ui-field label="Calle">
            <ui-input placeholder="Av. Siempreviva 742" />
          </ui-field>
          <ui-field label="Código postal">
            <ui-input placeholder="1000" [invalid]="true" />
          </ui-field>
        </div>
      </ui-form-section>
    </div>

    <h2 class="mb-4 mt-10 text-lg font-semibold text-fg">Reactive Forms (ControlValueAccessor)</h2>
    <form class="max-w-xl space-y-5" [formGroup]="form" (ngSubmit)="submit()">
      <ui-field label="Email" [required]="true" [error]="emailError">
        <ui-input
          type="email"
          placeholder="you@example.com"
          formControlName="email"
          [invalid]="emailInvalid"
        />
      </ui-field>

      <ui-field label="Plan" hint="Elige un plan de suscripción">
        <ui-select formControlName="plan" placeholder="Selecciona…">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </ui-select>
      </ui-field>

      <ui-field label="Notas" hint="Opcional">
        <ui-textarea formControlName="notes" placeholder="Escribe algo…" [rows]="3" />
      </ui-field>

      <ui-switch
        label="Enviar resumen semanal"
        description="Recibirás un email cada lunes"
        formControlName="digest"
      />

      <div class="flex items-center gap-3">
        <ui-button type="submit" [disabled]="form.invalid">Enviar</ui-button>
        <span class="text-sm text-muted">Valid: {{ form.valid }}</span>
      </div>

      @if (submitted) {
        <pre class="rounded-xl bg-surface-2 p-4 text-xs text-fg">{{ submitted | json }}</pre>
      }
    </form>
  `,
})
export class InputsPage {
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
    'danger',
    'outline',
    'subtle',
  ];
  protected readonly sizes: ButtonSize[] = ['sm', 'md', 'lg'];

  protected readonly ratingVal = 3;
  protected readonly ratingReadonly = 5;

  protected readonly phoneVal: string | null = null;
  protected readonly cardVal: string | null = null;
  protected readonly ssnVal: string | null = null;
  protected readonly maskedVal: string | null = null;

  protected readonly passwordVal: string | null = null;
  protected readonly passwordNoCriteriaVal: string | null = null;

  protected readonly frameworkOptions = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'SolidJS', value: 'solid' },
    { label: 'Astro', value: 'astro' },
  ];
  protected readonly frameworkVal: string | null = null;
  protected readonly frameworks = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'SolidJS', value: 'solid' },
    { label: 'Astro', value: 'astro' },
  ];
  protected readonly multiVal: string[] | null = null;
  protected readonly tagVal: string[] | null = null;
  protected readonly dateVal: string | null = null;
  protected readonly minDate = '2026-01-01';
  protected readonly maxDate = '2026-12-31';
  protected readonly timeVal: string | null = null;
  protected readonly time12Val: string | null = null;
  protected readonly minTime = '08:00';
  protected readonly maxTime = '18:00';
  protected readonly dateRangeVal: [string, string] | null = null;
  protected readonly minDateRange = '1900-01-01';
  protected readonly maxDateRange = '9999-12-31';

  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    plan: new FormControl('free'),
    notes: new FormControl(''),
    digest: new FormControl(false),
  });

  protected submitted: Record<string, unknown> | null = null;

  protected get emailError(): string | null {
    const control = this.form.controls.email;
    if (control.invalid && control.touched) {
      return control.hasError('required') ? 'El email es obligatorio' : 'Email inválido';
    }
    return null;
  }

  protected get emailInvalid(): boolean {
    const control = this.form.controls.email;
    return control.invalid && control.touched;
  }

  protected submit(): void {
    this.submitted = this.form.value;
  }
}
