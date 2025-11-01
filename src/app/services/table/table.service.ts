import { inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  FilterValue,
  Range,
  TableColumns,
  TableColumnsConfig,
  TableConfig,
} from '../../models/table/abstract-table.model';
import { delay, of } from 'rxjs';
import { SortDirection } from '@angular/material/sort';
import { LabelValue } from '../../components/form/enhancedFormConstructor/form-constructor.models';
import { SortDirectionMap } from '../../constants';
import { toObservable } from '@angular/core/rxjs-interop';
import { TableApiService } from './table-api.service';

@Injectable({
  providedIn: 'root',
})
export class TableService<T> {
  api = inject(TableApiService<T>);

  //TableConfig

  createTableConfig(tableConfig: TableColumnsConfig<T>, pageSize: number): TableConfig<T> {
    return {
      columnsConfig: tableConfig,
      pageSize,
    };
  }

  //Filters
  private _filterForm = new FormGroup({}, { updateOn: 'blur' });
  private _columnsOnOffForm = new FormGroup({
    columns: new FormControl<string[]>([], { nonNullable: true }),
  });

  createFilterForm(columns: TableColumns<T>[]) {
    this.columns = columns;

    this.columns.forEach(column => {
      this._filterForm.addControl(
        column.alias,
        new FormControl({
          value: column.filter.defaultValue ?? '',
          disabled: column.filter.disabled || false,
        }),
        { emitEvent: false },
      );
    });
  }

  get filterForm() {
    return this._filterForm;
  }

  //Sorting
  sort = signal<Map<keyof T, SortDirection>>(new Map());
  sort$ = toObservable(this.sort);

  sortByField = (alias: keyof T) => {
    const sortElement = this.sort().get(alias);

    if (!sortElement) {
      this.sort.update(model => {
        const now = new Map(model);

        now.set(alias, SortDirectionMap.asc);

        return now;
      });
    } else if (sortElement && sortElement === SortDirectionMap.asc) {
      this.sort.update(model => {
        const now = new Map(model);

        now.set(alias, SortDirectionMap.desc);

        return now;
      });
    } else {
      this.sort.update(model => {
        const now = new Map(model);

        now.delete(alias);

        return now;
      });
    }
  };

  getSortConfig = (alias: keyof T) => {
    const sort = this.sort();
    const sortIndex = Array.from(sort).findIndex(el => {
      return el[0] === alias;
    });

    return {
      order: sort.get(alias),
      on: sortIndex + 1,
    };
  };

  private columns: TableColumns<T>[] = [];

  initTable(columns: TableColumns<T>[]) {
    this.createFilterForm(columns);

    return this.setColumnsControl();
  }

  setColumnsControl(): LabelValue[] {
    this._columnsOnOffForm.patchValue({
      columns: this.columns.filter(el => el.visible || el.visible == null).map(el => el.alias),
    });

    return this.columns.map(column => ({ label: column.label, value: column.alias }));
  }

  get columnsOnOffForm() {
    return this._columnsOnOffForm;
  }

  private isInactive = (v: any) =>
    v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

  private compareValues(a: any, b: any, order: SortDirection): number {
    const dir = order === SortDirectionMap.asc ? 1 : -1;

    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    const aIsDate = a instanceof Date;
    const bIsDate = b instanceof Date;

    if (aIsDate || bIsDate) {
      const av = aIsDate ? a.getTime() : Number(a);
      const bv = bIsDate ? b.getTime() : Number(b);

      return (av - bv) * dir;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * dir;
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { sensitivity: 'base' }) * dir;
    }

    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }) * dir;
  }

  private matches<T, K extends keyof T>(cell: T[K], filter: FilterValue<T, K>, row: T): boolean {
    if (this.isInactive(filter)) return true;

    if (typeof filter === 'function') {
      return (filter as (c: T[K], r: T) => boolean)(cell, row);
    }

    if (filter instanceof RegExp) {
      if (cell == null) return false;

      return filter.test(String(cell));
    }

    if (Array.isArray(filter)) {
      return filter.some(f => String(cell) === String(f));
    }

    if (typeof filter === 'object' && ('from' in (filter as any) || 'to' in (filter as any))) {
      const { from, to } = filter as Range<number | Date>;

      if (cell == null) return false;

      const cv = cell instanceof Date ? cell.getTime() : (cell as any);
      const fv = from instanceof Date ? from.getTime() : from;
      const tv = to instanceof Date ? to.getTime() : to;

      if (fv != null && cv < fv) return false;

      return !(tv != null && cv > tv);
    }

    if (typeof filter === 'string') {
      if (cell == null) return false;

      return String(cell).toLowerCase().includes(filter.toLowerCase());
    }

    return cell === filter;
  }

  fetchContent(
    sort: (keyof T)[],
    order: SortDirection[],
    page: number,
    itemsPerPage: number,
    filters: Partial<Record<keyof T, FilterValue<T, keyof T>>>,
    originalOptions: T[],
  ) {
    const activeFilters = (Object.entries(filters) as [keyof T, FilterValue<T, keyof T>][]).filter(
      ([, v]) => !this.isInactive(v),
    );

    const sortedItems = [...originalOptions].sort((a, b) =>
      this.compareValues(
        a[sort[0]],
        b[sort[0]],
        order[0] === SortDirectionMap.asc ? SortDirectionMap.asc : SortDirectionMap.desc,
      ),
    );

    const filteredItems =
      activeFilters.length === 0
        ? sortedItems
        : sortedItems.filter(row =>
            activeFilters.every(([key, f]) => this.matches(row[key], f as any, row)),
          );

    const startItem = page * itemsPerPage;
    const endItem = startItem + itemsPerPage;

    return of({
      total_count: filteredItems.length,
      items: filteredItems.slice(startItem, endItem),
    }).pipe(delay(500));
  }
}
