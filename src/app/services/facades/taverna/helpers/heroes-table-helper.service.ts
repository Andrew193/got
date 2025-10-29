import { Injectable } from '@angular/core';
import { HeroType, Rarity, Unit } from '../../../../models/units-related/unit.model';
import { DataSource } from '../../../../models/table/abstract-table.model';

@Injectable({
  providedIn: 'root',
})
export class TavernaHeroesTableHelperService {
  private readonly _datasource!: DataSource<Unit>;
  private _pageSize = 10;

  get datasource() {
    return this._datasource;
  }

  set pageSize(pageSize: number) {
    this._pageSize = pageSize;
  }

  get pageSize() {
    return this._pageSize;
  }

  getUnitRarityLabel(level: Rarity) {
    return {
      [Rarity.LEGENDARY]: 'Legendary',
      [Rarity.EPIC]: 'Epic',
      [Rarity.RARE]: 'Rare',
      [Rarity.COMMON]: 'Common',
    }[level];
  }

  getUnitTypeLabel(type: HeroType) {
    return {
      [HeroType.ATTACK]: 'Attack',
      [HeroType.DEFENCE]: 'Defence',
    }[type];
  }

  trackBy(index: number, row: Unit): string {
    return row.name;
  }

  isExpanded(a: Unit, b: Unit) {
    return a.name === b.name;
  }
}
