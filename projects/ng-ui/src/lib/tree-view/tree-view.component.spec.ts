import { Component, signal, viewChild, type TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TreeViewComponent, type UiTreeNode } from './tree-view.component';

@Component({
  selector: 'tree-host',
  standalone: true,
  imports: [TreeViewComponent],
  template: `
    <ng-template #nodeTpl let-node>{{ node.label }}!</ng-template>
    <ui-tree-view
      [nodes]="nodes()"
      [selection]="selection()"
      (selectionChange)="onSelectionChange($event)"
      [multiSelect]="multiSelect()"
      [selectable]="selectable()"
      [itemTemplate]="itemTemplate()"
    />
  `,
})
class TreeHost {
  readonly nodes = signal<UiTreeNode[]>([
    {
      id: 'a',
      label: 'A',
      children: [{ id: 'a1', label: 'A1' }],
      initiallyExpanded: true,
    },
    {
      id: 'b',
      label: 'B',
      children: [
        { id: 'b1', label: 'B1' },
        { id: 'b2', label: 'B2' },
      ],
    },
    { id: 'c', label: 'C', disabled: true },
    {
      id: 'd',
      label: 'D',
      initiallyExpanded: true,
      children: [
        {
          id: 'd1',
          label: 'D1',
          initiallyExpanded: true,
          children: [{ id: 'd11', label: 'D11' }],
        },
      ],
    },
  ]);
  readonly selection = signal<string[]>([]);
  readonly multiSelect = signal(false);
  readonly selectable = signal(true);
  readonly itemTemplate = signal<TemplateRef<any> | null>(null);
  readonly nodeTpl = viewChild.required<TemplateRef<unknown>>('nodeTpl');

  onSelectionChange(selection: string[]): void {
    this.selection.set(selection);
  }
}

describe('TreeViewComponent', () => {
  let fixture: ComponentFixture<TreeHost>;
  let host: TreeHost;
  let component: TreeViewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TreeHost] }).compileComponents();
    fixture = TestBed.createComponent(TreeHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(TreeViewComponent)).componentInstance;
  });

  function tree(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-tree]') as HTMLElement;
  }

  function node(id: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;
  }

  function toggle(id: string): HTMLButtonElement | null {
    return node(id)?.querySelector('[data-toggle]') as HTMLButtonElement | null;
  }

  it('renders root nodes and a toggle only for nodes with children', () => {
    expect(node('a')).not.toBeNull();
    expect(node('b')).not.toBeNull();
    expect(toggle('a')).not.toBeNull();
    expect(toggle('b')).not.toBeNull();
    expect(toggle('c')).toBeNull();
  });

  it('expands a collapsed node when its toggle is clicked', () => {
    expect(node('b1')).toBeNull();

    toggle('b')!.click();
    fixture.detectChanges();

    expect(node('b1')).not.toBeNull();
    expect(node('b2')).not.toBeNull();
  });

  it('collapses an expanded node when its toggle is clicked again', () => {
    expect(node('a1')).not.toBeNull();

    toggle('a')!.click();
    fixture.detectChanges();

    expect(node('a1')).toBeNull();
  });

  it('materializes expansion state into the expandedIds model on first toggle', () => {
    expect(component.expandedIds()).toEqual([]);

    toggle('b')!.click();
    fixture.detectChanges();

    expect(component.expandedIds()).toEqual(['a', 'd', 'd1', 'b']);
  });

  it('selects a node on click and reflects it on the item', () => {
    node('a1')!.click();
    fixture.detectChanges();

    expect(host.selection()).toEqual(['a1']);
    expect(node('a1')!.getAttribute('data-selected')).toBe('true');
  });

  it('selects a single node at a time when multiSelect is disabled', () => {
    node('a')!.click();
    fixture.detectChanges();
    node('b')!.click();
    fixture.detectChanges();

    expect(host.selection()).toEqual(['b']);
    expect(node('a')!.getAttribute('data-selected')).toBeNull();
  });

  it('toggles multiple nodes when multiSelect is enabled', () => {
    host.multiSelect.set(true);
    fixture.detectChanges();
    node('a')!.click();
    fixture.detectChanges();
    node('b')!.click();
    fixture.detectChanges();

    expect(host.selection()).toEqual(['a', 'b']);
  });

  it('does not select disabled nodes', () => {
    node('c')!.click();
    fixture.detectChanges();

    expect(host.selection()).toEqual([]);
  });

  it('does not select nodes when selectable is disabled', () => {
    host.selectable.set(false);
    fixture.detectChanges();
    node('a')!.click();
    fixture.detectChanges();

    expect(host.selection()).toEqual([]);
  });

  it('renders nested children when every ancestor is expanded', () => {
    expect(node('d11')).not.toBeNull();
    expect(node('d11')!.getAttribute('aria-level')).toBe('3');
  });

  it('renders a custom item template when provided', () => {
    host.itemTemplate.set(host.nodeTpl());
    fixture.detectChanges();

    const item = node('b')!.querySelector('[data-node-label]') as HTMLElement;
    expect(item.textContent).toBe('B!');
  });

  it('moves focus and expands with the keyboard', () => {
    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(node('a')!.getAttribute('data-focused')).toBe('true');

    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(node('a1')!.getAttribute('data-focused')).toBe('true');

    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(node('b')!.getAttribute('data-focused')).toBe('true');

    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(node('b1')).not.toBeNull();
  });

  it('selects the focused node with Enter', () => {
    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    tree().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.selection()).toEqual(['a1']);
  });
});
