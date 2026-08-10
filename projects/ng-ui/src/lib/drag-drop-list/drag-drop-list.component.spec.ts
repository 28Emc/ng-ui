import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { DragDropListComponent, reorderItem } from './drag-drop-list.component';

interface TodoItem {
  id: number;
  label: string;
}

const TODOS: TodoItem[] = [
  { id: 1, label: 'Comprar pan' },
  { id: 2, label: 'Enviar email' },
  { id: 3, label: 'Revisar PR' },
];

@Component({
  selector: 'drag-drop-host',
  standalone: true,
  imports: [DragDropListComponent],
  template: `
    <ui-drag-drop-list
      [items]="items()"
      (itemsChange)="onItemsChange($event)"
      [getLabel]="getLabel()"
      [disabled]="disabled()"
      [handleLabel]="handleLabel()"
    />
  `,
})
class DragDropHost {
  readonly items = signal<TodoItem[]>(TODOS);
  readonly getLabel = signal<(item: TodoItem) => string>((item) => item.label);
  readonly disabled = signal(false);
  readonly handleLabel = signal('Mover');
  readonly emitted: TodoItem[][] = [];

  onItemsChange(items: TodoItem[]): void {
    this.emitted.push(items);
    this.items.set(items);
  }
}

@Component({
  selector: 'drag-drop-template-host',
  standalone: true,
  imports: [DragDropListComponent],
  template: `
    <ui-drag-drop-list [items]="items()" [itemTemplate]="row">
      <ng-template #row let-item let-index="index">
        <span class="custom-row">{{ item }} ({{ index }})</span>
      </ng-template>
    </ui-drag-drop-list>
  `,
})
class DragDropTemplateHost {
  readonly items = signal<string[]>(['a', 'b', 'c']);
}

describe('DragDropListComponent', () => {
  let fixture: ComponentFixture<DragDropHost>;
  let host: DragDropHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DragDropHost] }).compileComponents();
    fixture = TestBed.createComponent(DragDropHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[cdkDrag]')) as HTMLElement[];
  }

  function handles(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button[cdkDragHandle]'),
    ) as HTMLButtonElement[];
  }

  it('renders a row per item with position, label and handle', () => {
    const rowsEl = rows();
    expect(rowsEl.length).toBe(3);
    expect(rowsEl[0].textContent).toContain('1');
    expect(rowsEl[0].textContent).toContain('Comprar pan');
    expect(handles().length).toBe(3);
    expect(handles()[0].getAttribute('aria-label')).toBe('Mover: Comprar pan');
  });

  it('reorders the model and emits the new order on drop', () => {
    const list = fixture.debugElement.query(By.directive(DragDropListComponent))
      .componentInstance as DragDropListComponent<TodoItem>;
    (
      list as unknown as { onDrop(event: { previousIndex: number; currentIndex: number }): void }
    ).onDrop({ previousIndex: 0, currentIndex: 2 });
    fixture.detectChanges();

    expect(host.items().map((i) => i.id)).toEqual([2, 3, 1]);
    expect(host.emitted).toHaveLength(1);
    expect(host.emitted[0].map((i) => i.label)).toEqual([
      'Enviar email',
      'Revisar PR',
      'Comprar pan',
    ]);
    expect(rows()[0].textContent).toContain('Enviar email');
    expect(rows()[0].textContent).toContain('1');
  });

  it('does not emit when the drop position is unchanged', () => {
    const list = fixture.debugElement.query(By.directive(DragDropListComponent))
      .componentInstance as DragDropListComponent<TodoItem>;
    (
      list as unknown as { onDrop(event: { previousIndex: number; currentIndex: number }): void }
    ).onDrop({ previousIndex: 1, currentIndex: 1 });
    fixture.detectChanges();

    expect(host.emitted).toHaveLength(0);
    expect(host.items().map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('uses a custom getLabel function', () => {
    host.getLabel.set((item) => item.label.toUpperCase());
    fixture.detectChanges();
    expect(rows()[1].textContent).toContain('ENVIAR EMAIL');
  });

  it('disables drag interactions when disabled', () => {
    const dropList = fixture.debugElement
      .query(By.directive(CdkDropList))
      .injector.get(CdkDropList);
    host.disabled.set(true);
    fixture.detectChanges();

    expect(dropList.disabled).toBe(true);
    const drags = fixture.debugElement
      .queryAll(By.directive(CdkDrag))
      .map((d) => d.injector.get(CdkDrag));
    expect(drags.every((d) => d.disabled)).toBe(true);
    expect(handles().every((h) => h.getAttribute('aria-disabled') === 'true')).toBe(true);
  });
});

describe('DragDropListComponent (item template)', () => {
  it('renders the projected item template with index context', async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropTemplateHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(DragDropTemplateHost);
    fixture.detectChanges();

    const rendered = Array.from(
      fixture.nativeElement.querySelectorAll('.custom-row'),
    ) as HTMLElement[];
    expect(rendered.map((r) => r.textContent)).toEqual(['a (0)', 'b (1)', 'c (2)']);
  });
});

describe('reorderItem', () => {
  it('moves an item from one index to another', () => {
    expect(reorderItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(reorderItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns a copy without mutating the input', () => {
    const input = ['a', 'b', 'c'];
    const result = reorderItem(input, 1, 2);
    expect(result).not.toBe(input);
    expect(input).toEqual(['a', 'b', 'c']);
    expect(result).toEqual(['a', 'c', 'b']);
  });

  it('no-ops when from equals to or the indices are out of range', () => {
    expect(reorderItem(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
    expect(reorderItem(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
    expect(reorderItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
