import { StoreNames, TrainingState } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { dropTrainingSelectUnits, setAIUnits, setUserUnits } from '../actions/training.actions';

export const TrainingInitialState: TrainingState = {
  aiUnits: [],
  userUnits: [],
};

export const TrainingFeature = createFeature({
  name: StoreNames.trainingGround,
  reducer: createReducer(
    TrainingInitialState,
    on(setAIUnits, (state, action) => {
      const data = action.units;

      return { ...state, aiUnits: data };
    }),
    on(setUserUnits, (state, action) => {
      const data = action.units;

      return { ...state, userUnits: data };
    }),
    on(dropTrainingSelectUnits, state => {
      return { ...state, aiUnits: [], userUnits: [] };
    }),
  ),
});

export const { selectAiUnits, selectUserUnits } = TrainingFeature;
