import { Observable } from 'rxjs';
import { SortDirection } from '@angular/material/sort';

export type TableColumns<T> = {
  alias: keyof T & string;
  tdAlias?: keyof T & string;
  tdParser?: (model: T) => any;
  label: string;
};

export interface TableApiResponse<T> {
  items: T[];
  total_count: number;
}

export interface DataSource<T> {
  fetchContent(
    sort: keyof T,
    order: SortDirection,
    page: number,
    itemsPerPage: number,
  ): Observable<TableApiResponse<T>>;
}
