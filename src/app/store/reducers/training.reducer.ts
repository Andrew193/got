import { StoreNames, TrainingState, TrainingStateUnit } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { TrainingActions } from '../actions/training.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';
import { makeCanStartTrainingBattle } from '../selectors/training.selectors';

function selectId(model: TrainingStateUnit) {
  return model.name;
}

const aiUnitsAdapter = createEntityAdapter<TrainingStateUnit>({
  selectId,
});
const userUnitsAdapter = createEntityAdapter<TrainingStateUnit>({
  selectId,
});

export const TrainingInitialState: TrainingState = {
  aiUnits: aiUnitsAdapter.getInitialState([]),
  userUnits: userUnitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
  unitUpdateAllowed: true,
};

function getUnitsConfig(isUser: boolean) {
  const key = isUser ? ('userUnits' as const) : ('aiUnits' as const);
  const adapter = isUser ? userUnitsAdapter : aiUnitsAdapter;

  return { key, adapter };
}

export const TrainingFeature = createFeature({
  name: StoreNames.trainingGround,
  reducer: createReducer(
    TrainingInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(TrainingActions.setUnitUpdate, (state, action) => {
      return { ...state, unitUpdateAllowed: action.canUpdateUnit };
    }),
    on(TrainingActions.setAIUnits, (state, action) => {
      return { ...state, aiUnits: aiUnitsAdapter.setAll(action.units, state.aiUnits) };
    }),
    on(TrainingActions.setUserUnits, (state, action) => {
      return { ...state, userUnits: userUnitsAdapter.setAll(action.units, state.userUnits) };
    }),
    on(TrainingActions.addUnit, (state, action) => {
      const { key, adapter } = getUnitsConfig(action.isUser);

      return { ...state, [key]: adapter.addOne(action.data, state[key]) };
    }),
    on(TrainingActions.removeUnit, (state, action) => {
      const { key, adapter } = getUnitsConfig(action.isUser);

      return { ...state, [key]: adapter.removeOne(action.key, state[key]) };
    }),
    on(TrainingActions.setUnitCoordinate, (state, action) => {
      if (state.unitUpdateAllowed) {
        const { key, adapter } = getUnitsConfig(action.isUser);

        return {
          ...state,
          [key]: adapter.updateOne({ id: action.name, changes: action.coordinate }, state[key]),
        };
      }

      return state;
    }),
    on(TrainingActions.dropTraining, () => {
      return TrainingInitialState;
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
      selectCanStartTrainingBattle: () =>
        makeCanStartTrainingBattle(aiSelectors.selectAll, userSelectors.selectAll),
    };
  },
});

export const {
  selectAiUnits,
  selectUserUnits,
  selectFieldConfig: selectTrainingFieldConfig,
  selectCanStartTrainingBattle,
} = TrainingFeature;
