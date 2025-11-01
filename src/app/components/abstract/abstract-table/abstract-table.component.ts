import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { catchError, map, merge, Observable, of, switchMap, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataSource, TableApiResponse } from '../../../models/table/abstract-table.model';
import { ProtoTable } from './helpers/proto-table';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractTableComponent<T>
  extends ProtoTable<T>
  implements AfterViewInit, OnDestroy
{
  private _httpClient = inject(HttpClient);

  datasource: DataSource<T> = new Database(this._httpClient);
  override contentArray: T[] = [];
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.initDatasource();
  }

  initDatasource() {
    const multiSort = this.multiSort();
    const sortEvent = multiSort ? this.sort$ : this.sort.sortChange;

    this.paginator.page.pipe(takeUntil(this.subs)).subscribe(event => {
      this.localStorageService.setItem(this.tableName + '_page', event.pageSize);
    });

    sortEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.filterForm.valueChanges.subscribe(console.log);

    merge(this.sort.sortChange, this.paginator.page, this.filterForm.valueChanges, this.sort$)
      .pipe(
        switchMap(this.tableService.api.getTableData),
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
      .subscribe(data => (this.contentArray = data));
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
