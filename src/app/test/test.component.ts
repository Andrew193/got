import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

export type DocNode =
  | { id: string; type: 'h1'; text: string }
  | { id: string; type: 'p'; text: string }
  | { id: string; type: 'ul'; items: string[] }
  | { id: string; type: 'table'; header: string[]; rows: string[][] };

export type DocPage = { pageType: string; title: string; nodes: DocNode[] };

type NodeForm =
  | FormGroup<{ id: FormControl<string>; type: FormControl<'h1'>; text: FormControl<string> }>
  | FormGroup<{ id: FormControl<string>; type: FormControl<'p'>; text: FormControl<string> }>
  | FormGroup<{
      id: FormControl<string>;
      type: FormControl<'ul'>;
      items: FormArray<FormControl<string>>;
    }>
  | FormGroup<{
      id: FormControl<string>;
      type: FormControl<'table'>;
      header: FormArray<FormControl<string>>;
      rows: FormArray<FormArray<FormControl<string>>>;
    }>;

@Component({
  selector: 'app-doc-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './test.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageComponent {
  private fb = new FormBuilder();

  editMode = signal(false);

  // допустим, это уже приходит из твоего "DOC_PAGES[pageType]"
  nodes = signal<DocNode[]>([
    { id: 'n1', type: 'h1', text: 'Intro' },
    { id: 'n2', type: 'p', text: 'Some paragraph...' },
    { id: 'n3', type: 'ul', items: ['One', 'Two'] },
    {
      id: 'n4',
      type: 'table',
      header: ['A', 'B'],
      rows: [
        ['1', '2'],
        ['3', '4'],
      ],
    },
  ]);

  // форма страницы: FormArray узлов
  form = this.fb.group({
    nodes: this.fb.array<NodeForm>([]),
  });

  nodesFA = computed(() => this.form.controls.nodes.controls);

  toggleEdit() {
    const next = !this.editMode();

    this.editMode.set(next);

    if (next) this.rebuildFormFromNodes();
  }

  rebuildFormFromNodes() {
    const fa = this.form.controls.nodes;

    fa.clear();
    for (const n of this.nodes()) fa.push(this.buildNodeForm(n));
  }

  save() {
    // превращаем форму обратно в nodes
    const nextNodes = this.form.value.nodes!.map((raw: any) => {
      switch (raw.type) {
        case 'h1':
        case 'p':
          return { id: raw.id, type: raw.type, text: raw.text } as DocNode;

        case 'ul':
          return { id: raw.id, type: 'ul', items: (raw.items ?? []).filter(Boolean) } as DocNode;

        case 'table':
          return {
            id: raw.id,
            type: 'table',
            header: (raw.header ?? []).filter((x: string) => x != null),
            rows: (raw.rows ?? []).map((r: string[]) => (r ?? []).map(c => c ?? '')),
          } as DocNode;

        default:
          throw new Error('Unknown node type');
      }
    });

    this.nodes.set(nextNodes);
    this.editMode.set(false);
  }

  // ---------- builders ----------
  private buildNodeForm(n: DocNode): NodeForm {
    if (n.type === 'h1') {
      return this.fb.group({
        id: this.fb.nonNullable.control(n.id),
        type: this.fb.nonNullable.control('h1' as const),
        text: this.fb.nonNullable.control(n.text),
      });
    }

    if (n.type === 'p') {
      return this.fb.group({
        id: this.fb.nonNullable.control(n.id),
        type: this.fb.nonNullable.control('p' as const),
        text: this.fb.nonNullable.control(n.text),
      });
    }

    if (n.type === 'ul') {
      return this.fb.group({
        id: this.fb.nonNullable.control(n.id),
        type: this.fb.nonNullable.control('ul' as const),
        items: this.fb.array(n.items.map(i => this.fb.nonNullable.control(i))),
      });
    }

    // table
    return this.fb.group({
      id: this.fb.nonNullable.control(n.id),
      type: this.fb.nonNullable.control('table' as const),
      header: this.fb.array(n.header.map(h => this.fb.nonNullable.control(h))),
      rows: this.fb.array(
        n.rows.map(r => this.fb.array(r.map(c => this.fb.nonNullable.control(c)))),
      ),
    });
  }

  // ---------- list ops (ul) ----------
  addListItem(nodeIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'ul') return;

    if (node.controls['items'] instanceof FormArray) {
      node.controls['items'].push(this.fb.nonNullable.control(''));
    }
  }

  removeListItem(nodeIndex: number, itemIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'ul') return;

    if (node.controls['items'] instanceof FormArray) {
      node.controls['items'].removeAt(itemIndex);
    }
  }

  // ---------- table ops ----------
  addTableRow(nodeIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'table') return;

    if (node.controls['header'] instanceof FormArray) {
      const cols = node.controls['header'].length;
      const row = this.fb.array(
        Array.from({ length: cols }, () => this.fb.nonNullable.control('')),
      );

      if (node.controls['rows'] instanceof FormArray) {
        node.controls['rows'].push(row);
      }
    }
  }

  removeTableRow(nodeIndex: number, rowIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'table') return;

    if (node.controls['rows'] instanceof FormArray) {
      node.controls['rows'].removeAt(rowIndex);
    }
  }

  addTableColumn(nodeIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'table') return;

    if (node.controls['header'] instanceof FormArray) {
      node.controls['header'].push(this.fb.nonNullable.control('New column'));
    }

    if (node.controls['rows'] instanceof FormArray) {
      for (let i = 0; i < node.controls['rows'].length; i++) {
        // @ts-ignore
        node.controls['rows'].at(i).push(this.fb.nonNullable.control(''));
      }
    }
  }

  removeTableColumn(nodeIndex: number, colIndex: number) {
    const node = this.form.controls.nodes.at(nodeIndex);

    if (node.controls['type'].value !== 'table') return;

    if (node.controls['header'] instanceof FormArray) {
      node.controls['header'].removeAt(colIndex);
    }

    if (node.controls['rows'] instanceof FormArray) {
      for (let i = 0; i < node.controls['rows'].length; i++) {
        // @ts-ignore
        node.controls['rows'].at(i).removeAt(colIndex);
      }
    }
  }
}
