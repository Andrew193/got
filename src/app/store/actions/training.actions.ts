import { createAction, props } from '@ngrx/store';
import { TrainingStateSelectUnit } from '../store.interfaces';

export const setAIUnits = createAction('[Training] setAIUnits', props<TrainingStateSelectUnit>());
export const setUserUnits = createAction(
  '[Training] setUserUnits',
  props<TrainingStateSelectUnit>(),
);
export const dropTrainingSelectUnits = createAction('[Training] dropTrainingSelectUnits');
