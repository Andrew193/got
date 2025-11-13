import { Component, inject, OnDestroy } from '@angular/core';
import { PreviewUnit, SelectableUnit, Unit } from '../../../models/units-related/unit.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { HeroesSelectNames } from '../../../constants';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';

@Component({
  imports: [],
  template: '',
})
export abstract class BasicHeroSelectComponent implements OnDestroy {
  store = inject(Store);

  maxHeroes = 5;
  protected heroesService = inject(HeroesFacadeService);

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];
  chosenUnits: PreviewUnit[] = [];
  context: HeroesSelectNames = HeroesSelectNames.userCollection;

  protected constructor() {
    this.init();
  }

  init(allUnits?: Unit[]) {
    this.allUnits = allUnits || this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.heroesService.helper.getSelectableUnit(this.allUnits);
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

  ngOnDestroy() {
    this.store.dispatch(HeroesSelectActions.resetHeroCollection({ collections: [this.context] }));
  }
}
