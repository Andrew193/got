import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  output,
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
  pairwise,
  switchMap,
  Subscription,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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
  validityChange = output<boolean>();

  editForm?: FormGroup<{
    columnsArray: FormArray<
      FormGroup<{
        label: FormControl<string>;
        alias: FormControl<string>;
      }>
    >;
    rowsArray: FormArray<FormGroup<Record<string, FormControl<string>>>>;
  }>;

  private editFormSubscription?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  get columnsArray(): FormArray<
    FormGroup<{
      label: FormControl<string>;
      alias: FormControl<string>;
    }>
  > {
    return this.editForm?.get('columnsArray') as FormArray;
  }

  get rowsArray(): FormArray<FormGroup<Record<string, FormControl<string>>>> {
    return this.editForm?.get('rowsArray') as FormArray;
  }

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

    if (this.editable()) {
      this.initEditForm();
    }
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

  private initEditForm(): void {
    this.editForm = new FormGroup({
      columnsArray: new FormArray<
        FormGroup<{
          label: FormControl<string>;
          alias: FormControl<string>;
        }>
      >([]),
      rowsArray: new FormArray<FormGroup<Record<string, FormControl<string>>>>([]),
    });

    this.editFormSubscription = this.editForm.valueChanges
      .pipe(takeUntil(this.subs))
      .subscribe(() => {
        this.emitEditChange();
        this.emitValidityChange();
      });

    this.columnsArray.valueChanges
      .pipe(takeUntil(this.subs), pairwise())
      .subscribe(([prev, curr]) => {
        this.handleAliasChanges(prev, curr);
      });

    // Emit initial validity
    this.emitValidityChange();
  }

  private handleAliasChanges(
    prev: Partial<{ label: string; alias: string }>[],
    curr: Partial<{ label: string; alias: string }>[],
  ): void {
    prev.forEach((prevCol, index) => {
      const currCol = curr[index];

      if (currCol && prevCol.alias && currCol.alias && prevCol.alias !== currCol.alias) {
        this.rowsArray.controls.forEach(rowGroup => {
          const value = rowGroup.get(prevCol.alias!)?.value || '';

          (rowGroup as FormGroup).removeControl(prevCol.alias!);
          (rowGroup as FormGroup).addControl(
            currCol.alias!,
            new FormControl(value, { nonNullable: true }),
          );
        });
      }
    });
  }

  addEditableColumn(): void {
    const newAlias = `col_${Date.now()}`;

    const columnGroup = new FormGroup({
      label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      alias: new FormControl(newAlias, { nonNullable: true, validators: [Validators.required] }),
    });

    this.columnsArray.push(columnGroup);

    this.rowsArray.controls.forEach(rowGroup => {
      (rowGroup as FormGroup).addControl(newAlias, new FormControl('', { nonNullable: true }));
    });
  }

  removeEditableColumn(index: number): void {
    if (index < 0 || index >= this.columnsArray.length) {
      return;
    }

    const alias = this.columnsArray.at(index).get('alias')?.value;

    this.columnsArray.removeAt(index);

    if (alias) {
      this.rowsArray.controls.forEach(rowGroup => {
        (rowGroup as FormGroup).removeControl(alias);
      });
    }
  }

  addEditableRow(): void {
    const rowGroup = new FormGroup<Record<string, FormControl<string>>>({});

    this.columnsArray.controls.forEach(columnGroup => {
      const alias = columnGroup.get('alias')?.value || '';

      (rowGroup as FormGroup).addControl(alias, new FormControl('', { nonNullable: true }));
    });

    this.rowsArray.push(rowGroup);
  }

  removeEditableRow(index: number): void {
    if (index < 0 || index >= this.rowsArray.length) {
      return;
    }

    this.rowsArray.removeAt(index);
  }

  emitEditChange(): void {
    const columns: EditableColumn[] = this.columnsArray.controls.map(group => ({
      alias: group.get('alias')?.value || '',
      label: group.get('label')?.value || '',
    }));

    const rows: EditableRow[] = this.rowsArray.controls.map(group => {
      const row: EditableRow = {};

      Object.keys(group.controls).forEach(alias => {
        row[alias] = group.get(alias)?.value || '';
      });

      return row;
    });

    this.editChange.emit({ columns, rows });
  }

  private emitValidityChange(): void {
    if (!this.editForm) {
      this.validityChange.emit(true);

      return;
    }

    // Table is valid if:
    // 1. Has at least one column with non-empty label and alias
    // 2. All column labels and aliases are non-empty
    // 3. Has at least one row (if columns exist)
    const hasColumns = this.columnsArray.length > 0;
    const allColumnsValid = this.columnsArray.controls.every(group => {
      const label = group.get('label')?.value?.trim();
      const alias = group.get('alias')?.value?.trim();

      return label && alias;
    });
    const hasRows = this.rowsArray.length > 0;

    const isValid = hasColumns && allColumnsValid && hasRows;

    this.validityChange.emit(isValid);
  }

  saveTableConfig() {
    const columnsMap = this.resizeDirective().getHeaderWidthMap() as TableColumnsConfig<T>;

    this.onColumnResize(columnsMap);
  }

  ngOnDestroy() {
    this.subs.next(true);
    this.subs.complete();
    this.editFormSubscription?.unsubscribe();
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
