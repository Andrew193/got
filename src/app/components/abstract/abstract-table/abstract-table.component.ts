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
  data: T[] = [];

  resultsLength = 0;
  pageSize = 30;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.datasource
            ?.fetchContent(
              this.sort.active as keyof T,
              this.sort.direction,
              this.paginator.pageIndex,
              this.pageSize,
            )
            .pipe(catchError(() => of(null)));
        }),
        map(data => {
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.total_count;

          return data.items;
        }),
      )
      .subscribe(data => (this.data = data));
  }
}

export class Database<T> implements DataSource<T> {
  constructor(private _httpClient: HttpClient) {}

  fetchContent(sort: keyof T, order: SortDirection, page: number): Observable<TableApiResponse<T>> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&sort=${String(sort)}&order=${order}&page=${
      page + 1
    }`;

    return this._httpClient.get<TableApiResponse<T>>(requestUrl);
  }
}
