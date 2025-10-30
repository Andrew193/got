import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { catchError, map, merge, Observable, of, startWith, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataSource, TableApiResponse } from '../../../models/table/abstract-table.model';
import { ProtoTable } from './helpers/proto-table';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractTableComponent<T> extends ProtoTable<T> implements AfterViewInit {
  private _httpClient = inject(HttpClient);

  datasource: DataSource<T> = new Database(this._httpClient);
  override contentArray: T[] = [];
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterForm.valueChanges)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.datasource
            ?.fetchContent(
              this.sort.active as keyof T,
              this.sort.direction,
              this.paginator.pageIndex,
              this.itemsPerPage,
              this.filterForm.getRawValue(),
              this.tableService,
            )
            .pipe(catchError(() => of(null)));
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
}

export class Database<T> implements DataSource<T> {
  constructor(private _httpClient: HttpClient) {}

  fetchContent(sort: keyof T, order: SortDirection, page: number): Observable<TableApiResponse<T>> {
    return of({ total_count: 0, items: [] });
  }
}
