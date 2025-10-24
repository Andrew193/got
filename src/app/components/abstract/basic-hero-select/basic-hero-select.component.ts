import { Component, inject } from '@angular/core';
import { PreviewUnit, SelectableUnit, Unit } from '../../../models/units-related/unit.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';

@Component({
  imports: [],
  template: '',
})
export abstract class BasicHeroSelectComponent {
  maxHeroes = 5;
  protected heroesService = inject(HeroesFacadeService);

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];
  chosenUnits: PreviewUnit[] = [];

  protected constructor() {
    this.init();
  }

  init(allUnits?: Unit[]) {
    this.allUnits = allUnits || this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.allUnits.map(el => ({ name: el.name, imgSrc: el.imgSrc }));
  }

  public addUserUnit = (unit: SelectableUnit): boolean => {
    const index = this.chosenUnits.findIndex(el => el.name === unit.name);
    const condition = index === -1 && this.chosenUnits.length < this.maxHeroes;

    if (condition) {
      this.chosenUnits = [...this.chosenUnits, this.heroesService.getPreviewUnit(unit.name)];
    } else {
      this.chosenUnits = this.chosenUnits.filter((_, i) => i !== index);
    }

    return condition;
  };
}
