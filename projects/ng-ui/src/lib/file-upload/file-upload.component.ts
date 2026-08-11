import {
  Component,
  computed,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideCheck,
  LucideFile,
  LucideImage,
  LucideTrash2,
  LucideUploadCloud,
  LucideX,
} from '@lucide/angular';
import { DragDropListComponent } from '../drag-drop-list/drag-drop-list.component';
import { ProgressComponent } from '../progress/progress.component';
import { ToastService } from '../toast/toast.service';
import { cn } from '../utils/cn';

export type UiUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UiUploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UiUploadStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
}

export type UploadRejectReason = 'type' | 'size' | 'maxFiles';

export interface UploadRejectedFile {
  file: File;
  reason: UploadRejectReason;
}

export interface UploadValidateOptions {
  accept: string[];
  maxSize: number;
  maxFiles: number;
  currentCount: number;
}

export function matchesAccept(
  fileType: string,
  fileName: string,
  accept: readonly string[],
): boolean {
  if (accept.length === 0) return true;
  const lowerName = fileName.toLowerCase();
  return accept.some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r === '*/*' || r === '*') return true;
    if (r.startsWith('.')) return lowerName.endsWith(r);
    if (r.endsWith('/*')) {
      const base = r.slice(0, -2);
      return fileType.toLowerCase().startsWith(base + '/');
    }
    return fileType.toLowerCase() === r;
  });
}

export function validateUploadFiles(
  files: readonly File[],
  options: UploadValidateOptions,
): { accepted: File[]; rejected: UploadRejectedFile[] } {
  const accepted: File[] = [];
  const rejected: UploadRejectedFile[] = [];
  for (const file of files) {
    if (options.maxSize > 0 && file.size > options.maxSize) {
      rejected.push({ file, reason: 'size' });
      continue;
    }
    if (!matchesAccept(file.type, file.name, options.accept)) {
      rejected.push({ file, reason: 'type' });
      continue;
    }
    accepted.push(file);
  }
  const limit = options.maxFiles > 0 ? options.maxFiles : Infinity;
  const room = Math.max(0, limit - options.currentCount);
  for (const file of accepted.splice(room)) {
    rejected.push({ file, reason: 'maxFiles' });
  }
  return { accepted, rejected };
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  const formatted = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
  return `${formatted} MB`;
}

export function buildUploadFile(file: File, previewUrl?: string): UiUploadFile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    progress: 0,
    previewUrl,
  };
}

function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

function rejectReasonLabel(reason: UploadRejectReason): string {
  switch (reason) {
    case 'type':
      return 'tipo no permitido';
    case 'size':
      return 'supera el tamaño máximo';
    case 'maxFiles':
      return 'límite de archivos alcanzado';
  }
}

@Component({
  selector: 'ui-file-upload',
  standalone: true,
  imports: [
    DragDropListComponent,
    ProgressComponent,
    LucideCheck,
    LucideFile,
    LucideImage,
    LucideTrash2,
    LucideUploadCloud,
    LucideX,
  ],
  template: `
    <div class="flex flex-col gap-4">
      <div
        data-dropzone
        role="button"
        tabindex="0"
        [attr.aria-disabled]="disabled() || null"
        (click)="onBrowseClick()"
        (keydown.enter)="onBrowseClick()"
        (keydown.space)="onBrowseClick()"
        (dragover)="onDragOver($event)"
        (dragenter)="onDragEnter()"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
        [class]="dropzoneClasses()"
      >
        <svg lucideUploadCloud [size]="32" [strokeWidth]="1.8" class="text-muted" />
        <p class="text-sm font-medium text-fg">{{ dragLabel() }}</p>
        <p class="text-xs text-muted">
          {{ browseLabel() }}
          @if (maxSize() > 0) {
            · Máx {{ maxSizeLabel() || formatSize(maxSize()) }}
          }
        </p>
        <input
          #fileInput
          type="file"
          class="hidden"
          [attr.accept]="accept().join(',')"
          [attr.multiple]="multiple() || null"
          [disabled]="disabled()"
          (change)="onFilesSelected($event)"
        />
      </div>

      @if (files().length > 0) {
        <ui-drag-drop-list
          [items]="files()"
          (itemsChange)="onReorder($event)"
          [itemTemplate]="fileRow"
          [disabled]="disabled() || hasUploading()"
          handleLabel="Reordenar"
        >
          <ng-template #fileRow let-file>
            <div class="flex flex-1 items-center gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2"
              >
                @if (isImage(file.type)) {
                  <svg lucideImage [size]="18" [strokeWidth]="2" class="text-muted" />
                } @else {
                  <svg lucideFile [size]="18" [strokeWidth]="2" class="text-muted" />
                }
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="truncate text-sm font-medium text-fg">{{ file.name }}</p>
                  <span class="shrink-0 text-xs text-muted">{{ formatSize(file.size) }}</span>
                </div>

                <div class="mt-1.5 flex items-center gap-2">
                  @if (file.status === 'uploading') {
                    <ui-progress [value]="file.progress" size="sm" class="flex-1" />
                    <span class="shrink-0 text-xs tabular-nums text-muted">
                      {{ file.progress }}%
                    </span>
                  } @else if (file.status === 'success') {
                    <span
                      class="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"
                    >
                      <svg lucideCheck [size]="14" [strokeWidth]="2" />
                      Listo
                    </span>
                  } @else if (file.status === 'error') {
                    <span class="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                      <svg lucideX [size]="14" [strokeWidth]="2" />
                      {{ file.error || 'Error' }}
                    </span>
                  } @else {
                    <span class="text-xs text-muted">Pendiente</span>
                  }
                </div>
              </div>

              @if (file.previewUrl) {
                <img
                  [src]="file.previewUrl"
                  alt=""
                  class="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              }

              <button
                type="button"
                [disabled]="disabled()"
                [attr.aria-label]="removeLabel() + ': ' + file.name"
                (click)="remove(file.id)"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-50"
              >
                <svg lucideTrash2 [size]="16" [strokeWidth]="2" />
              </button>
            </div>
          </ng-template>
        </ui-drag-drop-list>
      }
    </div>
  `,
})
export class FileUploadComponent {
  private readonly toastService = inject(ToastService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly files = model<UiUploadFile[]>([]);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly accept = input<string[]>(['image/*', 'application/pdf']);
  readonly maxSize = input(5 * 1024 * 1024, { transform: (v: unknown) => Number(v) || 0 });
  readonly maxFiles = input(0, { transform: (v: unknown) => Number(v) || 0 });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showPreview = input(true, { transform: booleanAttribute });
  readonly autoUpload = input(false, { transform: booleanAttribute });
  readonly showRejectToast = input(true, { transform: booleanAttribute });
  readonly dragLabel = input('Arrastra y suelta archivos aquí');
  readonly browseLabel = input('o haz clic para seleccionar');
  readonly removeLabel = input('Eliminar');
  readonly maxSizeLabel = input<string>();

  readonly upload = output<UiUploadFile>();
  readonly rejected = output<UploadRejectedFile[]>();
  readonly fileRemoved = output<string>();

  protected readonly isDragging = signal(false);

  protected readonly hasUploading = computed(() =>
    this.files().some((f) => f.status === 'uploading'),
  );

  protected readonly formatSize = fileSizeLabel;
  protected readonly isImage = isImageType;

  protected readonly dropzoneClasses = computed(() =>
    cn(
      'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center outline-none transition-colors',
      'focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/50',
      this.isDragging()
        ? 'border-brand-500 bg-brand-500/10'
        : 'border-default bg-surface hover:border-brand-400/60 hover:bg-surface-2',
      this.disabled() ? 'pointer-events-none cursor-not-allowed opacity-50' : '',
    ),
  );

  protected onBrowseClick(): void {
    if (this.disabled()) return;
    this.fileInput().nativeElement.click();
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    if (list && list.length > 0) {
      this.addFiles(Array.from(list));
    }
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault?.();
    this.isDragging.set(false);
    if (this.disabled()) return;
    const dropped = event.dataTransfer?.files;
    if (dropped && dropped.length > 0) {
      this.addFiles(Array.from(dropped));
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault?.();
  }

  protected onDragEnter(): void {
    if (!this.disabled()) this.isDragging.set(true);
  }

  protected onDragLeave(): void {
    this.isDragging.set(false);
  }

  protected onReorder(files: UiUploadFile[]): void {
    this.files.set(files);
  }

  protected remove(id: string): void {
    const removed = this.files().find((f) => f.id === id);
    this.files.update((arr) => arr.filter((f) => f.id !== id));
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    this.fileRemoved.emit(id);
  }

  private addFiles(files: File[]): void {
    const { accepted, rejected } = validateUploadFiles(files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
      currentCount: this.multiple() ? this.files().length : 0,
    });

    if (rejected.length > 0) {
      this.rejected.emit(rejected);
      if (this.showRejectToast()) {
        this.notifyRejections(rejected);
      }
    }

    if (accepted.length === 0) return;

    const newFiles = accepted.map((file) => {
      const previewUrl =
        this.showPreview() && isImageType(file.type) ? URL.createObjectURL(file) : undefined;
      return buildUploadFile(file, previewUrl);
    });

    this.files.update((current) => (this.multiple() ? [...current, ...newFiles] : newFiles));

    if (this.autoUpload()) {
      for (const file of newFiles) {
        this.upload.emit(file);
      }
    }
  }

  private notifyRejections(rejected: UploadRejectedFile[]): void {
    const summary =
      rejected.length === 1
        ? `No se pudo agregar "${rejected[0].file.name}": ${rejectReasonLabel(rejected[0].reason)}.`
        : `${rejected.length} archivos no se pudieron agregar.`;
    this.toastService.error('Archivo rechazado', summary, 6000);
  }
}
