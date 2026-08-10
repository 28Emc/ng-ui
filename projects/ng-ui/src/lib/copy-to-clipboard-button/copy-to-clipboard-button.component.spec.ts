import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CopyToClipboardButtonComponent } from './copy-to-clipboard-button.component';
import { copyTextToClipboard } from './copy-to-clipboard';

@Component({
  selector: 'copy-button-host',
  standalone: true,
  imports: [CopyToClipboardButtonComponent],
  template: `
    <ui-copy-button
      [text]="text()"
      [label]="label()"
      [copiedLabel]="copiedLabel()"
      [disabled]="disabled()"
      [variant]="variant()"
      [size]="size()"
    />
  `,
})
class CopyButtonHost {
  readonly text = signal('texto a copiar');
  readonly label = signal('Copiar');
  readonly copiedLabel = signal('¡Copiado!');
  readonly disabled = signal(false);
  readonly variant = signal<'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle'>(
    'ghost',
  );
  readonly size = signal<'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'>('icon');
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function installClipboard(): ReturnType<typeof vi.fn> {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

function removeClipboard(): void {
  delete (navigator as { clipboard?: unknown }).clipboard;
}

function installSecureContext(): void {
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
}

function restoreSecureContext(): void {
  delete (window as { isSecureContext?: unknown }).isSecureContext;
}

function installExecCommand(result: boolean): ReturnType<typeof vi.fn> {
  const exec = vi.fn().mockReturnValue(result);
  (document as unknown as { execCommand: (cmd: string) => boolean }).execCommand = exec;
  return exec;
}

function removeExecCommand(): void {
  delete (document as unknown as { execCommand?: unknown }).execCommand;
}

describe('CopyToClipboardButtonComponent', () => {
  let fixture: ComponentFixture<CopyButtonHost>;
  let host: CopyButtonHost;
  let el: HTMLElement;
  let button: HTMLButtonElement;

  const checkIcon = () => el.querySelector('svg.text-green-600') as SVGSVGElement | null;

  beforeEach(async () => {
    installSecureContext();
    installClipboard();
    await TestBed.configureTestingModule({ imports: [CopyButtonHost] }).compileComponents();
    fixture = TestBed.createComponent(CopyButtonHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-copy-button') as HTMLElement;
    button = el.querySelector('button') as HTMLButtonElement;
  });

  afterEach(() => {
    removeClipboard();
    removeExecCommand();
    restoreSecureContext();
  });

  it('renders an icon button with a default aria-label', () => {
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('aria-label')).toBe('Copiar');
    expect(el.querySelector('svg')).toBeTruthy();
  });

  it('copies the text on click', async () => {
    const writeText = (navigator.clipboard as unknown as { writeText: ReturnType<typeof vi.fn> })
      .writeText;
    button.click();
    await flush();
    expect(writeText).toHaveBeenCalledWith('texto a copiar');
  });

  it('shows success feedback after copying', async () => {
    button.click();
    await flush();
    fixture.detectChanges();
    expect(checkIcon()).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('¡Copiado!');
  });

  it('reverts to idle state after the reset delay', async () => {
    vi.useFakeTimers();
    try {
      button.click();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      expect(checkIcon()).toBeTruthy();
      await vi.advanceTimersByTimeAsync(2000);
      fixture.detectChanges();
      expect(checkIcon()).toBeNull();
      expect(button.getAttribute('aria-label')).toBe('Copiar');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not copy when disabled', async () => {
    host.disabled.set(true);
    fixture.detectChanges();
    button.click();
    await flush();
    expect(checkIcon()).toBeNull();
  });

  it('updates the aria-label when custom labels are provided', () => {
    host.label.set('Copiar código');
    host.copiedLabel.set('¡Copiado!');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copiar código');
  });

  it('falls back to execCommand when the clipboard API is unavailable', async () => {
    removeClipboard();
    const exec = installExecCommand(true);
    button.click();
    await flush();
    fixture.detectChanges();
    expect(exec).toHaveBeenCalledWith('copy');
    expect(checkIcon()).toBeTruthy();
  });

  it('does not show success feedback when copying fails', async () => {
    (
      navigator.clipboard as unknown as { writeText: ReturnType<typeof vi.fn> }
    ).writeText.mockRejectedValueOnce(new Error('denied'));
    button.click();
    await flush();
    expect(checkIcon()).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Copiar');
  });
});

describe('copyTextToClipboard', () => {
  afterEach(() => {
    removeClipboard();
    removeExecCommand();
    restoreSecureContext();
  });

  it('uses navigator.clipboard when available', async () => {
    installSecureContext();
    const writeText = installClipboard();
    await copyTextToClipboard('hola');
    expect(writeText).toHaveBeenCalledWith('hola');
  });

  it('rejects when the fallback execCommand returns false', async () => {
    const exec = installExecCommand(false);
    await expect(copyTextToClipboard('hola')).rejects.toThrow(/failed/);
    expect(exec).toHaveBeenCalledWith('copy');
  });
});
