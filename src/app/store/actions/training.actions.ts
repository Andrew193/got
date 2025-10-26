import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StoreNames, TrainingStateSelectUnit, TrainingStateUnit } from '../store.interfaces';
import { Coordinate } from '../../models/field.model';
import { UnitName } from '../../models/units-related/unit.model';

export const TrainingActions = createActionGroup({
  source: StoreNames.trainingGround,
  events: {
    setAIUnits: props<TrainingStateSelectUnit>(),
    addUnit: props<{ data: TrainingStateUnit; isUser: boolean }>(),
    removeUnit: props<{ isUser: boolean; key: UnitName }>(),
    setUnitCoordinate: props<{ coordinate: Coordinate; name: UnitName; isUser: boolean }>(),
    setUnitUpdate: props<{ canUpdateUnit: boolean }>(),
    setUserUnits: props<TrainingStateSelectUnit>(),
    dropTrainingSelectUnits: emptyProps(),
    dropTraining: emptyProps(),
  },
});
