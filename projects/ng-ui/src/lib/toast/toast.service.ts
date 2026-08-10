import { Injectable, signal, inject, ComponentRef } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ToastHostComponent } from './toast-host.component';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: (id: string) => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

interface ToastTimer {
  timeoutId: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;
  private hostRef: ComponentRef<ToastHostComponent> | null = null;

  readonly toasts = signal<Toast[]>([]);

  /** Máximo de toasts visibles a la vez. Valores <= 0 desactivan el límite. */
  readonly maxToasts = signal(5);

  /** Posición de la pila de notificaciones. */
  readonly position = signal<ToastPosition>('bottom-right');

  private readonly timers = new Map<string, ToastTimer>();

  private ensureHost(): void {
    if (this.hostRef) return;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().right('16px').bottom('16px'),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    const portal = new ComponentPortal(ToastHostComponent);
    this.hostRef = this.overlayRef.attach(portal);
  }

  toast(opts: ToastOptions): string {
    this.ensureHost();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const variant = opts.variant ?? 'default';
    const duration = opts.duration ?? 5000;
    this.trimToMax();
    const newToast: Toast = {
      id,
      title: opts.title,
      description: opts.description,
      variant,
      duration,
      action: opts.action,
    };
    this.toasts.update((arr) => [...arr, newToast]);
    this.timers.set(id, { timeoutId: null, remaining: duration, startedAt: 0 });
    if (duration > 0) {
      this.schedule(id);
    }
    return id;
  }

  success(title: string, description?: string, duration?: number): string {
    return this.toast({ title, description, variant: 'success', duration });
  }

  error(title: string, description?: string, duration?: number): string {
    return this.toast({ title, description, variant: 'error', duration });
  }

  warning(title: string, description?: string, duration?: number): string {
    return this.toast({ title, description, variant: 'warning', duration });
  }

  info(title: string, description?: string, duration?: number): string {
    return this.toast({ title, description, variant: 'default', duration });
  }

  /** Pausa el auto-dismiss de un toast (p. ej. al pasar el cursor por encima). */
  pause(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timeoutId === null) return;
    clearTimeout(timer.timeoutId);
    timer.timeoutId = null;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
  }

  /** Reanuda el auto-dismiss de un toast previamente pausado. */
  resume(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timeoutId !== null || timer.remaining <= 0) return;
    this.schedule(id);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      if (timer.timeoutId !== null) clearTimeout(timer.timeoutId);
      this.timers.delete(id);
    }
    this.toasts.update((arr) => arr.filter((t) => t.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      if (timer.timeoutId !== null) clearTimeout(timer.timeoutId);
    }
    this.timers.clear();
    this.toasts.set([]);
  }

  private schedule(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining <= 0) return;
    timer.startedAt = Date.now();
    timer.timeoutId = setTimeout(() => this.dismiss(id), timer.remaining);
  }

  private trimToMax(): void {
    const max = this.maxToasts();
    if (max <= 0) return;
    const overflow = this.toasts().length + 1 - max;
    for (let i = 0; i < overflow; i++) {
      const oldest = this.toasts()[0];
      if (!oldest) break;
      this.dismiss(oldest.id);
    }
  }
}
