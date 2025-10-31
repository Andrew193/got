import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnInit,
  Signal,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IsExpandedChecker, TableColumns } from '../../../../models/table/abstract-table.model';
import { MatTable } from '@angular/material/table';
import {
  CONTROL_TYPE,
  LabelValue,
} from '../../../form/enhancedFormConstructor/form-constructor.models';
import { TableService } from '../../../../services/table/table.service';
import { BasePaginationComponent } from '../../base-pagination/base-pagination.component';
import { BehaviorSubject } from 'rxjs';
import { SortDirectionMap } from '../../../../constants';

@Component({
  template: '',
})
export abstract class ProtoTable<T> extends BasePaginationComponent<T> implements OnInit {
  tableService = inject(TableService);
  @ViewChild(MatTable) table!: MatTable<T>;

  equalize = true;
  cdr = inject(ChangeDetectorRef);

  //Columns
  columns = signal<TableColumns<T>[]>([]);
  visibleColumns = computed(() => this.columns().filter(el => el.visible || el.visible == null));
  displayedColumns = computed(() => this.getAliases(this.visibleColumns));
  displayedDetailColumns = computed(() => this.visibleColumns().map(el => `${el.alias}__detail`));
  columnsOnOffOptions = new BehaviorSubject<LabelValue[]>([]);

  //Filters
  filterTypes = CONTROL_TYPE;
  filterForm = this.tableService.filterForm;
  sort$ = this.tableService.sort$;

  columnsOnOffForm = this.tableService.columnsOnOffForm;

  //Sorting
  multiSort = input(false);
  sortByField = this.tableService.sortByField;
  getSortConfig = this.tableService.getSortConfig;
  sortAsc = SortDirectionMap.asc;

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

  //Hooks

  ngOnInit() {
    this.columnsOnOffOptions.next(this.tableService.initTable(this.columns()));
    this.columnsOnOffForm.valueChanges.subscribe(value => {
      this.columns.update(model =>
        model.map(el => {
          return { ...el, visible: value.columns?.includes(el.alias) };
        }),
      );
    });
  }

  //Helpers
  getAliases(columns: Signal<TableColumns<T>[]>) {
    return columns().map(el => el.alias);
  }

  //Contract
  abstract trackBy(index: number, row: T): string;
}
