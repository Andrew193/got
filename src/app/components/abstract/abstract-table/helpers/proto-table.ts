import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IsExpandedChecker, TableColumns } from '../../../../models/table/abstract-table.model';
import { MatTable } from '@angular/material/table';

@Component({
  template: '',
})
export abstract class ProtoTable<T> {
  @ViewChild(MatTable) table!: MatTable<T>;
  cdr = inject(ChangeDetectorRef);

  //Columns
  columns = signal<TableColumns<T>[]>([]);
  displayedColumns = computed(() => this.columns().map(el => el.alias));
  displayedDetailColumns = computed(() => this.columns().map(el => `${el.alias}__detail`));

  //Expand
  isExpandedChecker: IsExpandedChecker<T> | null = null;

  rowIsExpanded = (_index: number, row: T) => this.isExpanded(row);

  expandable = input<boolean>(true);
  expandableTemplateRef = input<TemplateRef<any>>();
  expandedElement: T | null = null;

  isExpanded(element: T) {
    if (this.isExpandedChecker) {
      return this.expandedElement ? this.isExpandedChecker(this.expandedElement, element) : false;
    }

    return this.expandedElement === element;
  }

  toggle(element: T) {
    this.expandedElement = this.isExpanded(element) ? null : element;
    !this.expandableTemplateRef() && this.table.renderRows();
  }

  abstract trackBy(index: number, row: T): string;
}
