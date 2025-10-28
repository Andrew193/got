import { Component, inject, signal } from '@angular/core';
import { TableColumns } from '../../../models/table/abstract-table.model';
import { AbstractTableComponent } from '../../../components/abstract/abstract-table/abstract-table.component';
import { Unit } from '../../../models/units-related/unit.model';
import { TableImports } from '../../../components/abstract/abstract-table/table-imports';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';

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

  override datasource = this.helper.getDataSource();
  override pageSize = 10;

  constructor() {
    super();
    this.helper.setPageSize(this.pageSize);
  }

  override columns = signal<TableColumns<Unit>[]>([
    { alias: 'name', label: 'Name' },
    { alias: 'rarity', label: 'Rarity', tdParser: m => this.helper.getUnitRarityLabel(m.rarity) },
    {
      alias: 'heroType',
      label: 'Hero Type',
      tdParser: m => this.helper.getUnitTypeLabel(m.heroType),
    },
    { alias: 'attack', label: 'Attack' },
    { alias: 'defence', label: 'Defence' },
    { alias: 'health', label: 'Health' },
  ]);
}
