import { Component, computed, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { cn } from '../utils/cn';

@Component({
  selector: 'ui-toast-host',
  standalone: true,
  imports: [ToastComponent],
  template: `
    <div [class]="hostClasses()">
      @for (t of toastService.toasts(); track t.id) {
        <ui-toast
          [toast]="t"
          (dismiss)="toastService.dismiss($event)"
          (pauseToast)="toastService.pause($event)"
          (resumeToast)="toastService.resume($event)"
        />
      }
    </div>
  `,
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);

  protected readonly hostClasses = computed(() =>
    cn(
      'fixed z-[100] flex w-[22rem] flex-col gap-2 pointer-events-none',
      this.toastService.position() === 'top-left' && 'left-4 top-4',
      this.toastService.position() === 'top-right' && 'right-4 top-4',
      this.toastService.position() === 'bottom-left' && 'left-4 bottom-4 flex-col-reverse',
      this.toastService.position() === 'bottom-right' && 'right-4 bottom-4 flex-col-reverse',
    ),
  );
}
