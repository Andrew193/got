import { inject, Injectable } from '@angular/core';
import { TavernaFacadeService } from '../../taverna/taverna.service';
import { Store } from '@ngrx/store';
import { UnitsConfiguratorFeatureActions } from '../../../../store/actions/units-configurator.actions';
import { Unit } from '../../../../models/units-related/unit.model';
import { Update } from '@ngrx/entity';
import { HeroesSelectNames } from '../../../../constants';
import { getUnitKey } from '../../../../store/reducers/units-configurator.reducer';
import { debounceTime, skip } from 'rxjs/operators';
import { UnitsConfiguratorUnitConfig } from '../../../../store/store.interfaces';

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
      UnitsConfiguratorFeatureActions.setUnitArrayConfig({
        collection: collection,
        data: this.getConfigArray(this.helper.unitOptions, true, true, collection),
      }),
    );

    this.watchFilteredOptions(collection);
  }

  watchFilteredOptions(collection: HeroesSelectNames) {
    this.filteredOptions.pipe(debounceTime(500), skip(1)).subscribe(res => {
      const parsed = this.helper.unitOptions.map(_ => {
        return {
          changes: { visible: res.includes(_.name) },
          id: getUnitKey({ ..._, collection }),
        } satisfies Update<UnitsConfiguratorUnitConfig>;
      });

      this.store.dispatch(
        UnitsConfiguratorFeatureActions.updateUnitArrayConfig({
          collection: collection,
          data: parsed,
        }),
      );
    });
  }

  getConfigArray(
    units: Unit[],
    visible: boolean,
    active: boolean,
    collection: HeroesSelectNames,
  ): UnitsConfiguratorUnitConfig[] {
    return units.map(
      el => ({ name: el.name, visible, collection, active }) satisfies UnitsConfiguratorUnitConfig,
    );
  }
}
