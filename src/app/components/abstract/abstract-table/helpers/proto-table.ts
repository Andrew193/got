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
import {
  IsExpandedChecker,
  TableColumns,
  TableColumnsConfig,
} from '../../../../models/table/abstract-table.model';
import { MatTable } from '@angular/material/table';
import {
  CONTROL_TYPE,
  LabelValue,
} from '../../../form/enhancedFormConstructor/form-constructor.models';
import { TableService } from '../../../../services/table/table.service';
import { BasePaginationComponent } from '../../base-pagination/base-pagination.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { SortDirectionMap, TABLE_NAMES } from '../../../../constants';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';

@Component({
  template: '',
})
export abstract class ProtoTable<T> extends BasePaginationComponent<T> implements OnInit {
  tableService = inject(TableService<T>);
  localStorageService = inject(LocalStorageService);
  subs = new Subject<boolean>();
  tableConfigFetched = new BehaviorSubject<boolean>(false);

  tableName: TABLE_NAMES = TABLE_NAMES.test;
  @ViewChild(MatTable) table!: MatTable<T>;

  equalize = false;
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

  //Resize
  resizable = input(true);
  restoreColumnWidth = input(true);

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
    this.tableService.api.getTableConfig(this.tableName).subscribe(({ config }) => {
      const tableConfig = config.columnsConfig;
      const tablePageSize = config.pageSize;

      if (tableConfig) {
        const activeColumns = Object.keys(tableConfig);

        this.columns.update(model => {
          return model.map(el => ({ ...el, visible: activeColumns.includes(el.alias) }));
        });
      }

      if (tablePageSize) {
        this.itemsPerPage = tablePageSize;
      }

      this.columnsOnOffOptions.next(this.tableService.initTable(this.columns()));
      this.tableConfigFetched.next(true);
    });

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

  onColumnResize() {
    const tableConfig = this.localStorageService.getItem(this.tableName) as TableColumnsConfig<T>;

    this.tableService.api.saveTableConfig(
      this.tableService.createTableConfig(tableConfig, this.itemsPerPage),
      this.tableName,
    );
  }

  //Contract
  abstract trackBy(index: number, row: T): string;
}
