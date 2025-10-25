import { StoreNames, TrainingState } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { PreviewUnit } from '../../models/units-related/unit.model';
import { TrainingActions } from '../actions/training.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';

function selectId(model: PreviewUnit) {
  return model.name;
}

const aiUnitsAdapter = createEntityAdapter<PreviewUnit>({
  selectId,
});
const userUnitsAdapter = createEntityAdapter<PreviewUnit>({
  selectId,
});

export const TrainingInitialState: TrainingState = {
  aiUnits: aiUnitsAdapter.getInitialState([]),
  userUnits: userUnitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
};

export const TrainingFeature = createFeature({
  name: StoreNames.trainingGround,
  reducer: createReducer(
    TrainingInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(TrainingActions.setAIUnits, (state, action) => {
      return { ...state, aiUnits: aiUnitsAdapter.setAll(action.units, state.aiUnits) };
    }),
    on(TrainingActions.setUserUnits, (state, action) => {
      return { ...state, userUnits: userUnitsAdapter.setAll(action.units, state.userUnits) };
    }),
    on(TrainingActions.dropTrainingSelectUnits, state => {
      return {
        ...state,
        aiUnits: aiUnitsAdapter.removeAll(state.aiUnits),
        userUnits: userUnitsAdapter.removeAll(state.userUnits),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const aiSelectors = aiUnitsAdapter.getSelectors(baseSelectors.selectAiUnits);
    const userSelectors = userUnitsAdapter.getSelectors(baseSelectors.selectUserUnits);

    return {
      selectAiUnitsEntities: aiSelectors.selectEntities,
      selectUserUnitsEntities: userSelectors.selectEntities,
      selectAiUnits: aiSelectors.selectAll,
      selectUserUnits: userSelectors.selectAll,
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.trainingGround),
    };
  },
});

export const {
  selectAiUnits,
  selectUserUnits,
  selectFieldConfig: selectTrainingFieldConfig,
} = TrainingFeature;
