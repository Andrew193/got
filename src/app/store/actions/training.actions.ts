import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StoreNames, TrainingStateSelectUnit } from '../store.interfaces';

export const TrainingActions = createActionGroup({
  source: StoreNames.trainingGround,
  events: {
    setAIUnits: props<TrainingStateSelectUnit>(),
    setUserUnits: props<TrainingStateSelectUnit>(),
    dropTrainingSelectUnits: emptyProps(),
  },
});
