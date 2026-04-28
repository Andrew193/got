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
  providers: [TableService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchtowerGenericTableComponent extends AbstractTableComponent<Row> {
  columnsInput = input.required<WatchtowerTableColumn[]>();
  rowsInput = input.required<Row[]>();

  override tableName = TABLE_NAMES.watchtower_generic_table;

  override trackBy = (index: number, _row: Row) => String(index);

  constructor() {
    super();

    // Sync datasource whenever rowsInput changes
    effect(() => {
      this.datasource = new WatchtowerTableDatabase(this.rowsInput());
    });
  }

  override ngOnInit(): void {
    // Set columns immediately from input (available synchronously at ngOnInit time)
    const cols = this.columnsInput();

    this.columns.set(
      cols.map(c => ({
        alias: c.alias,
        label: c.label,
        filter: { filterType: CONTROL_TYPE.TEXT, disabled: true },
        visible: true,
      })),
    );

    // Now call parent ngOnInit — columns are already set, so initTable() inside
    // will create filterForm controls for the correct columns and emit tableConfigFetched
    super.ngOnInit();
  }
}
