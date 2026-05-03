import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractTableComponent } from '../../abstract/abstract-table/abstract-table.component';
import { TableImports } from '../../abstract/abstract-table/table-imports';
import { CONTROL_TYPE } from '../../form/enhancedFormConstructor/form-constructor.models';
import {
  DataSource,
  FilterValue,
  TableApiResponse,
} from '../../../models/table/abstract-table.model';
import { TableService } from '../../../services/table/table.service';
import { TABLE_NAMES } from '../../../constants';
import { XP_TABLE } from '../../../constants/player-level.constants';
import { Observable } from 'rxjs';
import { SortDirection } from '@angular/material/sort';

interface LevelRow {
  level: number;
  xpRequired: number;
  xpTotal: number;
}

export class PlayerLevelTableDatabase implements DataSource<LevelRow> {
  private rows: LevelRow[];

  constructor() {
    this.rows = XP_TABLE.map((xpTotal, index) => ({
      level: index + 1,
      xpRequired: index === 0 ? 0 : XP_TABLE[index] - XP_TABLE[index - 1],
      xpTotal,
    }));
  }

  fetchContent(
    sort: (keyof LevelRow)[],
    order: SortDirection[],
    page: number,
    itemsPerPage: number,
    filters: Partial<Record<keyof LevelRow, FilterValue<LevelRow, keyof LevelRow>>>,
    tableService: TableService<LevelRow>,
  ): Observable<TableApiResponse<LevelRow>> {
    return tableService.fetchContent(sort, order, page, itemsPerPage, filters, this.rows);
  }
}

@Component({
  selector: 'app-player-level-table',
  imports: [TableImports],
  templateUrl: '../../abstract/abstract-table/abstract-table.component.html',
  styleUrls: [
    './player-level-table.component.scss',
    '../../abstract/abstract-table/abstract-table.component.scss',
  ],
  providers: [TableService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLevelTableComponent extends AbstractTableComponent<LevelRow> {
  override tableName = TABLE_NAMES.player_level_table;
  override trackBy = (_index: number, row: LevelRow) => String(row.level);

  constructor() {
    super();
    this.datasource = new PlayerLevelTableDatabase();
  }

  override ngOnInit() {
    this.columns.set([
      {
        alias: 'level',
        label: 'Level',
        filter: { filterType: CONTROL_TYPE.NONE },
        visible: true,
      },
      {
        alias: 'xpRequired',
        label: 'XP Required',
        filter: { filterType: CONTROL_TYPE.NONE },
        visible: true,
      },
      {
        alias: 'xpTotal',
        label: 'Total XP',
        filter: { filterType: CONTROL_TYPE.NONE },
        visible: true,
      },
    ]);

    super.ngOnInit();
  }
}
