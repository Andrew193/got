import { inject, Injectable } from '@angular/core';
import { TavernaFacadeService } from '../../taverna/taverna.service';
import { Store } from '@ngrx/store';
import { UnitsConfiguratorFeatureActions } from '../../../../store/actions/units-configurator.actions';
import { Unit } from '../../../../models/units-related/unit.model';
import { UnitsConfiguratorVisibilityUnit } from '../../../../store/store.interfaces';
import { Update } from '@ngrx/entity';
import { HeroesSelectNames } from '../../../../constants';
import { getUnitKey } from '../../../../store/reducers/units-configurator.reducer';
import { debounceTime } from 'rxjs/operators';

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

  init(collection: HeroesSelectNames) {
    this.store.dispatch(
      UnitsConfiguratorFeatureActions.setUnitArrayVisibility({
        collection: collection,
        data: this.getVisibilityArray(this.helper.unitOptions, true, collection),
      }),
    );

    this.watchFilteredOptions(collection);
  }

  watchFilteredOptions(collection: HeroesSelectNames) {
    this.filteredOptions.pipe(debounceTime(500)).subscribe(res => {
      const parsed = this.helper.unitOptions.map(_ => {
        return {
          changes: { visible: res.includes(_.name) },
          id: getUnitKey({ ..._, collection }),
        } satisfies Update<UnitsConfiguratorVisibilityUnit>;
      });

      this.store.dispatch(
        UnitsConfiguratorFeatureActions.updateUnitArrayVisibility({
          collection: collection,
          data: parsed,
        }),
      );
    });
  }

  getVisibilityArray(
    units: Unit[],
    visible: boolean,
    collection: HeroesSelectNames,
  ): UnitsConfiguratorVisibilityUnit[] {
    return units.map(
      el => ({ name: el.name, visible, collection }) satisfies UnitsConfiguratorVisibilityUnit,
    );
  }
}
