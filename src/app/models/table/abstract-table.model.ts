import { Observable } from 'rxjs';
import { SortDirection } from '@angular/material/sort';
import { CONTROL_TYPE } from '../../components/form/enhancedFormConstructor/form-constructor.models';
import { TableService } from '../../services/table/table.service';
import { Source } from '../api.model';

export type TableColumnsFilterType = Exclude<
  CONTROL_TYPE,
  CONTROL_TYPE.CUSTOM | CONTROL_TYPE.DATE_RANGE | CONTROL_TYPE.DATE_INPUT
>;

export type TableColumnsFilter = {
  filterType: TableColumnsFilterType;
  disabled?: boolean;
  defaultValue?: any;
  source?: Source;
  multi?: boolean;
};

export type TableColumns<T> = {
  alias: keyof T & string;
  visible?: boolean;
  tdAlias?: keyof T & string;
  tdParser?: (model: T) => any;
  className?: string;
  label: string;
  filter: TableColumnsFilter;
};

export interface TableApiResponse<T> {
  items: T[];
  total_count: number;
}

export interface DataSource<T> {
  fetchContent(
    sort: (keyof T)[],
    order: SortDirection[],
    page: number,
    itemsPerPage: number,
    filters: Partial<Record<keyof T, FilterValue<T, keyof T>>>,
    tableService: TableService<T>,
  ): Observable<TableApiResponse<T>>;
}

export type IsExpandedChecker<T> = (a: T, B: T) => boolean;

type Primitive = string | number | boolean | Date | null | undefined;
export type Range<T extends number | Date> = { from?: T; to?: T };
export type FilterValue<T, K extends keyof T> =
  | Primitive
  | Primitive[]
  | RegExp
  | Range<number>
  | Range<Date>
  | ((cell: T[K], row: T) => boolean);
