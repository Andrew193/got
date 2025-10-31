import { Component, inject, signal } from '@angular/core';
import { TableColumns } from '../../../models/table/abstract-table.model';
import { AbstractTableComponent } from '../../../components/abstract/abstract-table/abstract-table.component';
import { Unit } from '../../../models/units-related/unit.model';
import { TableImports } from '../../../components/abstract/abstract-table/table-imports';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { CONTROL_TYPE } from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import { DATA_SOURCES } from '../../../constants';

@Component({
  selector: 'app-taverna-heroes-table',
  imports: [TableImports],
  templateUrl: '../../../components/abstract/abstract-table/abstract-table.component.html',
  styleUrls: [
    './taverna-heroes-table.component.scss',
    '../../../components/abstract/abstract-table/abstract-table.component.scss',
  ],
})
export class TavernaHeroesTableComponent extends AbstractTableComponent<Unit> {
  helper = inject(TavernaFacadeService);

  override datasource = this.helper.datasource;
  override itemsPerPage = this.helper.pageSize;
  override isExpandedChecker = this.helper.isExpanded;
  trackBy = this.helper.trackBy;

  override columns = signal<TableColumns<Unit>[]>([
    {
      alias: 'name',
      label: 'Name',
      className: 'text-left-i',
      filter: {
        filterType: CONTROL_TYPE.TEXT,
        disabled: true,
      },
      visible: false,
    },
    {
      alias: 'rarity',
      label: 'Rarity',
      tdParser: m => this.helper.getUnitRarityLabel(m.rarity),
      filter: {
        filterType: CONTROL_TYPE.SELECT,
        source: DATA_SOURCES.heroRarity,
        multi: true,
      },
    },
    {
      alias: 'heroType',
      label: 'Hero Type',
      tdParser: m => this.helper.getUnitTypeLabel(m.heroType),
      filter: {
        filterType: CONTROL_TYPE.SELECT,
        source: DATA_SOURCES.heroTypes,
        multi: true,
      },
    },
    {
      alias: 'attack',
      label: 'Attack',
      filter: {
        filterType: CONTROL_TYPE.TEXT,
      },
    },
    {
      alias: 'defence',
      label: 'Defence',
      filter: {
        filterType: CONTROL_TYPE.TEXT,
      },
    },
    {
      alias: 'health',
      label: 'Health',
      filter: {
        filterType: CONTROL_TYPE.TEXT,
      },
    },
  ]);
}
