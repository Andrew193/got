import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  StoreNames,
  UnitsConfiguratorSelectUnit,
  UnitsConfiguratorStateUnit,
  UnitsConfiguratorVisibilityUnit,
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
    setUnitVisibility: props<{
      config: { collection: HeroesSelectNames; name: UnitName };
      visibility: boolean;
    }>(),
    setUnitArrayVisibility: props<{
      collection: HeroesSelectNames;
      data: UnitsConfiguratorVisibilityUnit[];
    }>(),
    updateUnitArrayVisibility: props<{
      collection: HeroesSelectNames;
      data: Update<UnitsConfiguratorVisibilityUnit>[];
    }>(),
  },
});
