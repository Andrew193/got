import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  catchError,
  filter,
  map,
  merge,
  Observable,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  DataSource,
  EditableColumn,
  EditableRow,
  TableApiResponse,
  TableColumnsConfig,
  TableEditChangeEvent,
} from '../../../models/table/abstract-table.model';
import { ProtoTable } from './helpers/proto-table';
import { TableResizeDirective } from '../../../directives/table/resize/resize.directive';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractTableComponent<T>
  extends ProtoTable<T>
  implements AfterViewInit, OnDestroy
{
  resizeDirective = viewChild.required<TableResizeDirective<T>>('appTableResize');

  private _httpClient = inject(HttpClient);

  datasource: DataSource<T> = new Database(this._httpClient);
  override contentArray: T[] = [];
  isLoadingResults = true;

  editable = input<boolean>(false);
  editChange = output<TableEditChangeEvent>();

  editableColumns = signal<EditableColumn[]>([]);
  editableRows = signal<EditableRow[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.tableConfigFetched
      .asObservable()
      .pipe(
        filter(Boolean),
        take(1),
        tap({
          next: () => {
            setTimeout(() => {
              this.initDatasource();
            }, 0);
          },
        }),
      )
      .subscribe();
  }

  initDatasource() {
    const multiSort = this.multiSort();
    const sortEvent = multiSort ? this.sort$ : this.sort?.sortChange;

    this.paginator.page.pipe(takeUntil(this.subs)).subscribe(event => {
      this.localStorageService.setItem(this.tableName + '_page', event.pageSize);
    });

    sortEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort?.sortChange, this.paginator.page, this.filterForm.valueChanges, this.sort$)
      .pipe(
        switchMap(() => {
          this.isLoadingResults = true;

          return this.sort$.pipe(
            switchMap(el => {
              const mAlias = Array.from(el.keys())[0];
              const mOrder = Array.from(el.values())[0];

              const sortAlias = [(multiSort ? mAlias : this.sort.active) as keyof T];
              const sortDirection = [multiSort ? mOrder : this.sort.direction];

              return this.datasource
                ?.fetchContent(
                  sortAlias,
                  sortDirection,
                  this.paginator.pageIndex,
                  this.itemsPerPage,
                  this.filterForm.getRawValue(),
                  this.tableService,
                )
                .pipe(catchError(() => of(null)));
            }),
          );
        }),
        map(data => {
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }

          this.totalElements = data.total_count;

          return data.items;
        }),
      )
      .subscribe(data => {
        this.contentArray = data;
        this.cdr.markForCheck();
      });
  }

  addEditableColumn(): void {
    const newAlias = `col_${Date.now()}`;

    this.editableColumns.update(cols => [...cols, { alias: newAlias, label: '' }]);
    this.editableRows.update(rows => rows.map(row => ({ ...row, [newAlias]: '' })));
    this.emitEditChange();
  }

  removeEditableColumn(index: number): void {
    const alias = this.editableColumns()[index]?.alias;

    this.editableColumns.update(cols => cols.filter((_, i) => i !== index));
    if (alias) {
      this.editableRows.update(rows =>
        rows.map(row => {
          const { [alias]: _removed, ...rest } = row;

          return rest as EditableRow;
        }),
      );
    }

    this.emitEditChange();
  }

  addEditableRow(): void {
    const emptyRow: EditableRow = Object.fromEntries(
      this.editableColumns().map(col => [col.alias, '']),
    );

    this.editableRows.update(rows => [...rows, emptyRow]);
    this.emitEditChange();
  }

  removeEditableRow(index: number): void {
    this.editableRows.update(rows => rows.filter((_, i) => i !== index));
    this.emitEditChange();
  }

  onCellChange(rowIndex: number, alias: string, value: string): void {
    this.editableRows.update(rows =>
      rows.map((row, i) => (i === rowIndex ? { ...row, [alias]: value } : row)),
    );
    this.emitEditChange();
  }

  onColumnLabelChange(index: number, label: string): void {
    this.editableColumns.update(cols =>
      cols.map((col, i) => (i === index ? { ...col, label } : col)),
    );
    this.emitEditChange();
  }

  onColumnAliasChange(index: number, newAlias: string): void {
    const oldAlias = this.editableColumns()[index]?.alias;

    this.editableColumns.update(cols =>
      cols.map((col, i) => (i === index ? { ...col, alias: newAlias } : col)),
    );
    if (oldAlias && oldAlias !== newAlias) {
      this.editableRows.update(rows =>
        rows.map(row => {
          const { [oldAlias]: value, ...rest } = row;

          return { ...rest, [newAlias]: value ?? '' } as EditableRow;
        }),
      );
    }

    this.emitEditChange();
  }

  emitEditChange(): void {
    this.editChange.emit({
      columns: this.editableColumns(),
      rows: this.editableRows(),
    });
  }

  saveTableConfig() {
    const columnsMap = this.resizeDirective().getHeaderWidthMap() as TableColumnsConfig<T>;

    this.onColumnResize(columnsMap);
  }

  ngOnDestroy() {
    this.subs.next(true);
    this.subs.complete();
  }
}

export class Database<T> implements DataSource<T> {
  constructor(private _httpClient: HttpClient) {}

  fetchContent(
    sort: (keyof T)[],
    order: SortDirection[],
    page: number,
  ): Observable<TableApiResponse<T>> {
    return of({ total_count: 0, items: [] });
  }
}
