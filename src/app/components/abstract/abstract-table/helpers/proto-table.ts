import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IsExpandedChecker, TableColumns } from '../../../../models/table/abstract-table.model';
import { MatTable } from '@angular/material/table';
import { CONTROL_TYPE } from '../../../form/enhancedFormConstructor/form-constructor.models';
import { TableService } from '../../../../services/table/table.service';
import { BasePaginationComponent } from '../../base-pagination/base-pagination.component';

@Component({
  template: '',
})
export abstract class ProtoTable<T> extends BasePaginationComponent<T> implements OnInit {
  tableService = inject(TableService);
  equalize = false;

  @ViewChild(MatTable) table!: MatTable<T>;
  cdr = inject(ChangeDetectorRef);

  //Columns
  columns = signal<TableColumns<T>[]>([]);
  displayedColumns = computed(() => this.columns().map(el => el.alias));
  displayedDetailColumns = computed(() => this.columns().map(el => `${el.alias}__detail`));

  //Filters
  filterTypes = CONTROL_TYPE;
  filterForm = this.tableService.filterForm;

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

  ngOnInit() {
    this.tableService.createFilterForm(this.columns());
  }

  abstract trackBy(index: number, row: T): string;
}
