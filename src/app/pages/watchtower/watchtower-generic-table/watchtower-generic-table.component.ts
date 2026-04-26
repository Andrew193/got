import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { AbstractTableComponent } from '../../../components/abstract/abstract-table/abstract-table.component';
import { TableImports } from '../../../components/abstract/abstract-table/table-imports';
import { CONTROL_TYPE } from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import {
  DataSource,
  FilterValue,
  TableApiResponse,
} from '../../../models/table/abstract-table.model';
import { WatchtowerTableColumn } from '../../../models/watchtower/watchtower.model';
import { TableService } from '../../../services/table/table.service';
import { TABLE_NAMES } from '../../../constants';

type Row = Record<string, unknown>;

export class WatchtowerTableDatabase implements DataSource<Row> {
  constructor(public rows: Row[]) {}

  fetchContent(
    sort: (keyof Row)[],
    order: SortDirection[],
    page: number,
    itemsPerPage: number,
    filters: Partial<Record<keyof Row, FilterValue<Row, keyof Row>>>,
    tableService: TableService<Row>,
  ): Observable<TableApiResponse<Row>> {
    return tableService.fetchContent(sort, order, page, itemsPerPage, filters, this.rows);
  }
}

@Component({
  selector: 'app-watchtower-generic-table',
  imports: [TableImports],
  templateUrl: '../../../components/abstract/abstract-table/abstract-table.component.html',
  styleUrls: [
    './watchtower-generic-table.component.scss',
    '../../../components/abstract/abstract-table/abstract-table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchtowerGenericTableComponent extends AbstractTableComponent<Row> {
  columnsInput = input<WatchtowerTableColumn[]>([]);
  rowsInput = input<Row[]>([]);

  override tableName = TABLE_NAMES.watchtower_generic_table;

  override trackBy = (index: number, _row: Row) => String(index);

  constructor() {
    super();

    effect(() => {
      const cols = this.columnsInput();

      this.columns.set(
        cols.map(c => ({
          alias: c.alias,
          label: c.label,
          filter: { filterType: CONTROL_TYPE.TEXT, disabled: true },
        })),
      );
    });

    effect(() => {
      this.datasource = new WatchtowerTableDatabase(this.rowsInput());
    });
  }
}
