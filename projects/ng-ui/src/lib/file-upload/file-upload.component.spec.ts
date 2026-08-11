import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DragDropListComponent } from '../drag-drop-list/drag-drop-list.component';
import {
  FileUploadComponent,
  UiUploadFile,
  UploadRejectedFile,
  buildUploadFile,
  fileSizeLabel,
  matchesAccept,
  validateUploadFiles,
} from './file-upload.component';

function makeFile(name: string, size = 10, type = 'text/plain'): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

@Component({
  selector: 'file-upload-host',
  standalone: true,
  imports: [FileUploadComponent],
  template: `
    <ui-file-upload
      [files]="files()"
      (filesChange)="onFilesChange($event)"
      [accept]="accept()"
      [maxSize]="maxSize()"
      [maxFiles]="maxFiles()"
      [multiple]="multiple()"
      [autoUpload]="autoUpload()"
      [disabled]="disabled()"
      [showPreview]="showPreview()"
      (upload)="onUpload($event)"
      (rejected)="onRejected($event)"
      (fileRemoved)="onFileRemoved($event)"
    />
  `,
})
class FileUploadHost {
  readonly files = signal<UiUploadFile[]>([]);
  readonly accept = signal<string[]>(['image/*', '.pdf']);
  readonly maxSize = signal(1024);
  readonly maxFiles = signal(0);
  readonly multiple = signal(true);
  readonly autoUpload = signal(false);
  readonly disabled = signal(false);
  readonly showPreview = signal(true);
  readonly uploads: UiUploadFile[] = [];
  readonly rejections: UploadRejectedFile[] = [];
  readonly removed: string[] = [];

  onFilesChange(files: UiUploadFile[]): void {
    this.files.set(files);
  }
  onUpload(file: UiUploadFile): void {
    this.uploads.push(file);
  }
  onRejected(rejected: UploadRejectedFile[]): void {
    this.rejections.push(...rejected);
  }
  onFileRemoved(id: string): void {
    this.removed.push(id);
  }
}

describe('validateUploadFiles', () => {
  it('accepts files that match the accept list (mime or extension)', () => {
    const { accepted, rejected } = validateUploadFiles(
      [makeFile('foto.png', 10, 'image/png'), makeFile('doc.pdf', 10, 'application/pdf')],
      { accept: ['image/*', '.pdf'], maxSize: 1024, maxFiles: 0, currentCount: 0 },
    );
    expect(accepted).toHaveLength(2);
    expect(rejected).toHaveLength(0);
  });

  it('rejects files whose type is not accepted', () => {
    const { accepted, rejected } = validateUploadFiles([makeFile('nota.txt')], {
      accept: ['image/*', '.pdf'],
      maxSize: 1024,
      maxFiles: 0,
      currentCount: 0,
    });
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe('type');
    expect(rejected[0].file.name).toBe('nota.txt');
  });

  it('rejects files larger than maxSize', () => {
    const { accepted, rejected } = validateUploadFiles(
      [makeFile('grande.png', 2000, 'image/png')],
      {
        accept: ['image/*'],
        maxSize: 1024,
        maxFiles: 0,
        currentCount: 0,
      },
    );
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe('size');
  });

  it('rejects files beyond the maxFiles limit, honoring currentCount', () => {
    const { accepted, rejected } = validateUploadFiles(
      [
        makeFile('a.png', 10, 'image/png'),
        makeFile('b.png', 10, 'image/png'),
        makeFile('c.png', 10, 'image/png'),
      ],
      { accept: ['image/*'], maxSize: 1024, maxFiles: 2, currentCount: 0 },
    );
    expect(accepted).toHaveLength(2);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe('maxFiles');
  });
});

describe('matchesAccept', () => {
  it('matches wildcard mime types', () => {
    expect(matchesAccept('image/png', 'foto.png', ['image/*'])).toBe(true);
    expect(matchesAccept('text/plain', 'nota.txt', ['image/*'])).toBe(false);
  });

  it('matches exact mime types', () => {
    expect(matchesAccept('application/pdf', 'doc.pdf', ['application/pdf'])).toBe(true);
  });

  it('matches file extensions with a leading dot', () => {
    expect(matchesAccept('', 'archivo.csv', ['.csv'])).toBe(true);
    expect(matchesAccept('text/plain', 'nota.md', ['.csv'])).toBe(false);
  });
});

describe('fileSizeLabel', () => {
  it('formats bytes, KB and MB', () => {
    expect(fileSizeLabel(512)).toBe('512 B');
    expect(fileSizeLabel(2048)).toBe('2 KB');
    expect(fileSizeLabel(3 * 1024 * 1024)).toBe('3 MB');
  });
});

describe('buildUploadFile', () => {
  it('builds a pending file with an id and size/type from the source', () => {
    const file = buildUploadFile(makeFile('foto.png', 512, 'image/png'));
    expect(file.name).toBe('foto.png');
    expect(file.type).toBe('image/png');
    expect(file.size).toBe(512);
    expect(file.status).toBe('pending');
    expect(file.progress).toBe(0);
    expect(file.id).toBeTruthy();
  });
});

describe('FileUploadComponent', () => {
  let fixture: ComponentFixture<FileUploadHost>;
  let host: FileUploadHost;
  let component: FileUploadComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileUploadHost] }).compileComponents();
    fixture = TestBed.createComponent(FileUploadHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement
      .query(By.directive(FileUploadComponent))
      .injector.get(FileUploadComponent);
  });

  function fileInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
  }

  function selectFiles(files: File[]): void {
    const input = fileInput();
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('adds files selected through the hidden input to the model', () => {
    selectFiles([
      makeFile('foto.png', 10, 'image/png'),
      makeFile('doc.pdf', 10, 'application/pdf'),
    ]);

    expect(host.files()).toHaveLength(2);
    expect(host.files().map((f) => f.name)).toEqual(['foto.png', 'doc.pdf']);
  });

  it('emits upload for each accepted file when autoUpload is enabled', () => {
    host.autoUpload.set(true);
    fixture.detectChanges();
    selectFiles([
      makeFile('foto.png', 10, 'image/png'),
      makeFile('doc.pdf', 10, 'application/pdf'),
    ]);

    expect(host.uploads.map((f) => f.name)).toEqual(['foto.png', 'doc.pdf']);
  });

  it('does not emit upload when autoUpload is disabled', () => {
    selectFiles([makeFile('foto.png', 10, 'image/png')]);
    expect(host.uploads).toHaveLength(0);
  });

  it('emits rejected files with the type reason and does not add them', () => {
    selectFiles([makeFile('nota.txt')]);

    expect(host.files()).toHaveLength(0);
    expect(host.rejections).toHaveLength(1);
    expect(host.rejections[0].reason).toBe('type');
    expect(host.rejections[0].file.name).toBe('nota.txt');
  });

  it('adds files dropped on the dropzone', () => {
    const files = [makeFile('arrastrado.png', 10, 'image/png')];
    (component as unknown as { onDrop(event: { dataTransfer?: { files: File[] } }): void }).onDrop({
      dataTransfer: { files },
    });
    fixture.detectChanges();

    expect(host.files()).toHaveLength(1);
    expect(host.files()[0].name).toBe('arrastrado.png');
  });

  it('replaces the existing selection when multiple is disabled', () => {
    host.multiple.set(false);
    fixture.detectChanges();
    selectFiles([makeFile('uno.png', 10, 'image/png')]);
    selectFiles([makeFile('dos.png', 10, 'image/png')]);

    expect(host.files()).toHaveLength(1);
    expect(host.files()[0].name).toBe('dos.png');
  });

  it('enforces the maxFiles limit', () => {
    host.maxFiles.set(1);
    fixture.detectChanges();
    selectFiles([makeFile('a.png', 10, 'image/png'), makeFile('b.png', 10, 'image/png')]);

    expect(host.files()).toHaveLength(1);
    expect(host.rejections.map((r) => r.reason)).toEqual(['maxFiles']);
  });

  it('removes a file, emits fileRemoved and revokes its preview url', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:preview');
    const revokeObjectURL = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    host.showPreview.set(true);
    fixture.detectChanges();
    selectFiles([makeFile('foto.png', 10, 'image/png')]);
    const id = host.files()[0].id;
    (component as unknown as { remove(id: string): void }).remove(id);
    fixture.detectChanges();

    expect(host.files()).toHaveLength(0);
    expect(host.removed).toEqual([id]);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it('reorders the model when the internal drag-drop list is reordered', () => {
    selectFiles([
      makeFile('a.png', 10, 'image/png'),
      makeFile('b.png', 10, 'image/png'),
      makeFile('c.png', 10, 'image/png'),
    ]);
    const dragList = fixture.debugElement.query(By.directive(DragDropListComponent))
      .componentInstance as DragDropListComponent<UiUploadFile>;
    (
      dragList as unknown as {
        onDrop(event: { previousIndex: number; currentIndex: number }): void;
      }
    ).onDrop({ previousIndex: 0, currentIndex: 2 });
    fixture.detectChanges();

    expect(host.files().map((f) => f.name)).toEqual(['b.png', 'c.png', 'a.png']);
  });

  it('renders a progress bar for uploading files', () => {
    host.files.set([
      {
        id: '1',
        name: 'foto.png',
        size: 10,
        type: 'image/png',
        status: 'uploading',
        progress: 40,
      },
    ]);
    fixture.detectChanges();

    const progress = fixture.nativeElement.querySelector('ui-progress');
    expect(progress).not.toBeNull();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
  });

  it('does not allow reordering while any file is uploading', () => {
    host.files.set([
      { id: '1', name: 'a.png', size: 10, type: 'image/png', status: 'uploading', progress: 20 },
      { id: '2', name: 'b.png', size: 10, type: 'image/png', status: 'pending', progress: 0 },
    ]);
    fixture.detectChanges();

    const dragList = fixture.debugElement.query(By.directive(DragDropListComponent))
      .componentInstance as DragDropListComponent<UiUploadFile>;
    expect(dragList.disabled()).toBe(true);
  });

  it('ignores drop interactions when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    const files = [makeFile('foto.png', 10, 'image/png')];
    (component as unknown as { onDrop(event: { dataTransfer?: { files: File[] } }): void }).onDrop({
      dataTransfer: { files },
    });
    fixture.detectChanges();

    expect(host.files()).toHaveLength(0);
  });
});
