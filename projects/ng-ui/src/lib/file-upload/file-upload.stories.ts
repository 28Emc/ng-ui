import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FileUploadComponent, UiUploadFile } from './file-upload.component';

@Component({
  selector: 'file-upload-demo',
  standalone: true,
  imports: [FileUploadComponent],
  template: `
    <div class="max-w-xl">
      <ui-file-upload
        [files]="files()"
        (filesChange)="files.set($event)"
        [accept]="accept"
        [maxSize]="maxSize"
        (upload)="onUpload($event)"
      />
      <p class="mt-3 text-xs text-muted">
        Simula progreso: selecciona archivos y cada uno sube a 100% en 2s.
      </p>
    </div>
  `,
})
class FileUploadDemoComponent {
  readonly files = signal<UiUploadFile[]>([]);
  readonly accept = ['image/*', 'application/pdf', '.csv'];
  readonly maxSize = 5 * 1024 * 1024;

  onUpload(file: UiUploadFile): void {
    this.files.update((list) =>
      list.map((f) => (f.id === file.id ? { ...f, status: 'uploading' as const, progress: 0 } : f)),
    );
    let progress = 0;
    const timer = setInterval(() => {
      progress += 20;
      this.files.update((list) =>
        list.map((f) =>
          f.id === file.id
            ? {
                ...f,
                progress: Math.min(progress, 100),
                status: progress >= 100 ? ('success' as const) : f.status,
              }
            : f,
        ),
      );
      if (progress >= 100) clearInterval(timer);
    }, 400);
  }
}

const meta: Meta<FileUploadComponent> = {
  title: 'Inputs/FileUpload',
  component: FileUploadComponent,
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-xl">
        <ui-file-upload
          [accept]="accept"
          [maxSize]="maxSize"
          [multiple]="multiple"
          [autoUpload]="autoUpload"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Default: Story = {};

export const DemoWithProgress: Story = {
  decorators: [moduleMetadata({ imports: [FileUploadDemoComponent] })],
  render: () => ({ template: `<file-upload-demo />` }),
};
