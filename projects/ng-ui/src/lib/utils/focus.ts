const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function focusFirstFocusable(container: HTMLElement): void {
  const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  (first ?? container).focus();
}
