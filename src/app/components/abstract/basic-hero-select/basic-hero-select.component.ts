import { Component, effect, inject, OnDestroy, Signal } from '@angular/core';
import {
  AddUserUnitCallbackReturnValue,
  PreviewUnit,
  SelectableUnit,
  Unit,
} from '../../../models/units-related/unit.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { HeroesSelectNames } from '../../../constants';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { UnitsConfiguratorFeatureActions } from '../../../store/actions/units-configurator.actions';

@Component({
  imports: [],
  template: '',
})
export abstract class BasicHeroSelectComponent<T extends PreviewUnit> implements OnDestroy {
  store = inject(Store);

  maxHeroes = 5;
  protected heroesService = inject(HeroesFacadeService);

  allUnits: Unit[] = [];
  allUnitsForSelect: SelectableUnit[] = [];
  context: HeroesSelectNames = HeroesSelectNames.userCollection;
  abstract chosenUnits: Signal<T[]>;

  protected constructor() {
    this.init();

    let inited = false;

    effect(() => {
      if (!inited) {
        this.store.dispatch(
          HeroesSelectActions.setHeroesSelectState({
            data: this.chosenUnits().map(el => ({ name: el.name, collection: this.context })),
          }),
        );
        inited = true;
      }
    });
  }

  init(allUnits?: Unit[]) {
    this.allUnits = allUnits || this.heroesService.getAllHeroes();
    this.allUnitsForSelect = this.heroesService.helper.getSelectableUnit(this.allUnits);
  }

  public addUserUnit = (unit: SelectableUnit): AddUserUnitCallbackReturnValue => {
    const chosenUnits = this.chosenUnits();

    const index = chosenUnits.findIndex(el => el.name === unit.name);
    const condition = index === -1 && chosenUnits.length < this.maxHeroes;

    if (condition) {
      this.store.dispatch(
        UnitsConfiguratorFeatureActions.addUnit({
          data: {
            ...this.heroesService.getPreviewUnit(unit.name),
            collection: this.context,
          },
        }),
      );
    } else {
      this.store.dispatch(
        UnitsConfiguratorFeatureActions.removeUnit({
          collection: this.context,
          key: chosenUnits[index].name,
        }),
      );
    }

    return { shouldAdd: condition };
  };

  ngOnDestroy() {
    this.store.dispatch(HeroesSelectActions.resetHeroCollection({ collections: [this.context] }));
  }
}
