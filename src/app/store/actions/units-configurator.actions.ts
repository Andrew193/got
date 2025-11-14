import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  StoreNames,
  UnitsConfiguratorSelectUnit,
  UnitsConfiguratorStateUnit,
  UnitsConfiguratorUnitConfig,
} from '../store.interfaces';
import { Coordinate } from '../../models/field.model';
import { UnitName } from '../../models/units-related/unit.model';
import { Update } from '@ngrx/entity';
import { HeroesSelectNames } from '../../constants';

export const UnitsConfiguratorFeatureActions = createActionGroup({
  source: StoreNames.unitsConfigurator,
  events: {
    setUnits: props<UnitsConfiguratorSelectUnit>(),
    addUnit: props<{ data: UnitsConfiguratorStateUnit }>(),
    removeUnit: props<{ collection: HeroesSelectNames; key: UnitName }>(),
    setUnitCoordinate: props<{
      coordinate: Coordinate;
      name: UnitName;
      collection: HeroesSelectNames;
    }>(),
    setUnitUpdate: props<{ canUpdateUnit: boolean }>(),
    dropSelectUnits: emptyProps(),
    drop: emptyProps(),
    setUnitConfig: props<UnitsConfiguratorUnitConfig>(),
    setUnitArrayConfig: props<{
      collection: HeroesSelectNames;
      data: UnitsConfiguratorUnitConfig[];
    }>(),
    updateUnitArrayConfig: props<{
      collection: HeroesSelectNames;
      data: Update<UnitsConfiguratorUnitConfig>[];
    }>(),
    updateUnitConfig: props<{
      collection: HeroesSelectNames;
      data: Update<UnitsConfiguratorUnitConfig>;
    }>(),
  },
});
