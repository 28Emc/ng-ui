import {
  Component,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  output,
  viewChildren,
  type ElementRef,
} from '@angular/core';

function clampLength(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 6;
  return Math.max(1, Math.min(32, Math.trunc(n)));
}

@Component({
  selector: 'ui-otp-input',
  standalone: true,
  template: `
    <div role="group" [attr.aria-label]="ariaLabel()" class="flex gap-2">
      @for (i of positions(); track i) {
        <input
          #box
          data-otp-box
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          [attr.maxlength]="1"
          [attr.inputmode]="numeric() ? 'numeric' : 'text'"
          [attr.aria-label]="ariaLabel() + ', posición ' + (i + 1)"
          [value]="charAt(i)"
          [disabled]="disabled()"
          (input)="onInput(i, $event)"
          (keydown)="onKeydown(i, $event)"
          (paste)="onPaste(i, $event)"
          class="h-12 w-12 rounded-xl border border-default bg-surface text-center text-lg font-semibold text-fg outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
      }
    </div>
  `,
})
export class OtpInputComponent {
  readonly value = model('');
  readonly length = input(6, { transform: clampLength });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly numeric = input(true, { transform: booleanAttribute });
  readonly autoFocus = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Código de verificación');
  readonly complete = output<string>();

  protected readonly positions = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  constructor() {
    afterNextRender(() => {
      if (this.autoFocus() && !this.disabled()) {
        const list = this.boxes();
        const index = Math.min(Math.max(0, this.value().length), list.length - 1);
        list[index]?.nativeElement.focus();
      }
    });

    effect(() => {
      const current = this.value();
      if (current.length === this.length()) {
        this.complete.emit(current);
      }
    });
  }

  protected charAt(index: number): string {
    return this.value()[index] ?? '';
  }

  protected onInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const last = target.value.slice(-1);
    const allowed = this.numeric() ? /^\d$/.test(last) : last.length === 1;
    if (!allowed) {
      target.value = this.charAt(index);
      return;
    }
    this.setChar(index, last);
    target.value = last;
    if (index < this.length() - 1) this.focusBox(index + 1);
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.charAt(index) !== '') {
        this.setChar(index, '');
        this.focusBox(index);
      } else if (index > 0) {
        this.setChar(index - 1, '');
        this.focusBox(index - 1);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusBox(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      event.preventDefault();
      this.focusBox(index + 1);
    }
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const allowed = this.numeric() ? text.replace(/\D/g, '') : text;
    const chars = this.value().split('');
    for (let k = 0; k < allowed.length && index + k < this.length(); k++) {
      chars[index + k] = allowed[k];
    }
    this.value.set(chars.join(''));
    this.focusBox(Math.min(index + allowed.length, this.length() - 1));
  }

  private setChar(index: number, char: string): void {
    const chars = this.value().split('');
    chars[index] = char;
    this.value.set(chars.join(''));
  }

  private focusBox(index: number): void {
    this.boxes()[index]?.nativeElement.focus();
  }
}
