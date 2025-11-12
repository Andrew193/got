import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  StoreNames,
  TrainingStateSelectUnit,
  TrainingStateUnit,
  TrainingStateUnitType,
  TrainingVisibilityUnit,
} from '../store.interfaces';
import { Coordinate } from '../../models/field.model';
import { UnitName } from '../../models/units-related/unit.model';
import { Update } from '@ngrx/entity';

export const TrainingActions = createActionGroup({
  source: StoreNames.trainingGround,
  events: {
    setUnits: props<TrainingStateSelectUnit>(),
    addUnit: props<{ data: TrainingStateUnit }>(),
    removeUnit: props<{ collection: TrainingStateUnitType; key: UnitName }>(),
    setUnitCoordinate: props<{
      coordinate: Coordinate;
      name: UnitName;
      collection: TrainingStateUnitType;
    }>(),
    setUnitUpdate: props<{ canUpdateUnit: boolean }>(),
    dropTrainingSelectUnits: emptyProps(),
    dropTraining: emptyProps(),
    setUnitVisibility: props<{ isUser: boolean; visibility: boolean; name: UnitName }>(),
    setUnitArrayVisibility: props<{ isUser: boolean; data: TrainingVisibilityUnit[] }>(),
    updateUnitArrayVisibility: props<{ isUser: boolean; data: Update<TrainingVisibilityUnit>[] }>(),
  },
});
