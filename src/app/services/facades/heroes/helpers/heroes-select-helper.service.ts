import { inject, Injectable } from '@angular/core';
import { TavernaFacadeService } from '../../taverna/taverna.service';
import { Store } from '@ngrx/store';
import { TrainingActions } from '../../../../store/actions/training.actions';
import { Unit } from '../../../../models/units-related/unit.model';
import { TrainingVisibilityUnit } from '../../../../store/store.interfaces';
import { Update } from '@ngrx/entity';

@Injectable()
export class HeroesSelectFacadeService {
  store = inject(Store);

  helper = inject(TavernaFacadeService);

  formGroup = this.helper.formGroup;
  filteredOptions;
  options;

  constructor() {
    const config = this.helper.init();

    this.options = config.options;
    this.filteredOptions = config.filteredOptions;
  }

  init(isUser: boolean) {
    this.store.dispatch(
      TrainingActions.setUnitArrayVisibility({
        isUser: isUser,
        data: this.getVisibilityArray(this.helper.unitOptions, true),
      }),
    );

    this.watchFilteredOptions(isUser);
  }

  watchFilteredOptions(isUser: boolean) {
    this.filteredOptions.subscribe(res => {
      const parsed = this.helper.unitOptions.map(_ => {
        return {
          changes: { visible: res.includes(_.name) },
          id: _.name,
        } satisfies Update<TrainingVisibilityUnit>;
      });

      this.store.dispatch(
        TrainingActions.updateUnitArrayVisibility({
          isUser: isUser,
          data: parsed,
        }),
      );
    });
  }

  getVisibilityArray(units: Unit[], visible: boolean): TrainingVisibilityUnit[] {
    return units.map(el => ({ name: el.name, visible }) satisfies TrainingVisibilityUnit);
  }
}
