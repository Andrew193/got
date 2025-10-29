import { Component, inject, signal } from '@angular/core';
import { TableColumns } from '../../../models/table/abstract-table.model';
import { AbstractTableComponent } from '../../../components/abstract/abstract-table/abstract-table.component';
import { Unit } from '../../../models/units-related/unit.model';
import { TableImports } from '../../../components/abstract/abstract-table/table-imports';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-taverna-heroes-table',
  imports: [TableImports, NgTemplateOutlet, NgClass, FormsModule],
  templateUrl: '../../../components/abstract/abstract-table/abstract-table.component.html',
  styleUrls: [
    './taverna-heroes-table.component.scss',
    '../../../components/abstract/abstract-table/abstract-table.component.scss',
  ],
})
export class TavernaHeroesTableComponent extends AbstractTableComponent<Unit> {
  helper = inject(TavernaFacadeService);

  override datasource = this.helper.datasource;
  override pageSize = this.helper.pageSize;
  override isExpandedChecker = this.helper.isExpanded;
  trackBy = this.helper.trackBy;

  override columns = signal<TableColumns<Unit>[]>([
    { alias: 'name', label: 'Name', className: 'text-left-i' },
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
