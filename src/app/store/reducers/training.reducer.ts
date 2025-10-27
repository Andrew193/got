import {
  StoreNames,
  TrainingState,
  TrainingStateUnit,
  TrainingVisibilityUnit,
} from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { TrainingActions } from '../actions/training.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';
import { makeCanStartTrainingBattle, makeUnitVisibility } from '../selectors/training.selectors';
import { UnitName } from '../../models/units-related/unit.model';

function selectId(model: { name: UnitName }) {
  return model.name;
}

const aiUnitsAdapter = createEntityAdapter<TrainingStateUnit>({
  selectId,
});
const userUnitsAdapter = createEntityAdapter<TrainingStateUnit>({
  selectId,
});

//Visibility
const aiUnitsVisibilityAdapter = createEntityAdapter<TrainingVisibilityUnit>({
  selectId,
});
const userUnitsVisibilityAdapter = createEntityAdapter<TrainingVisibilityUnit>({
  selectId,
});

export const TrainingInitialState: TrainingState = {
  aiUnits: aiUnitsAdapter.getInitialState([]),
  userUnits: userUnitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
  unitUpdateAllowed: true,
  aiVisibility: aiUnitsVisibilityAdapter.getInitialState([]),
  userVisibility: userUnitsVisibilityAdapter.getInitialState([]),
};

function getUnitsConfig(isUser: boolean) {
  const key = isUser ? ('userUnits' as const) : ('aiUnits' as const);
  const adapter = isUser ? userUnitsAdapter : aiUnitsAdapter;

  return { key, adapter };
}

function getVisibilityUnitsConfig(isUser: boolean) {
  const key = isUser ? ('userVisibility' as const) : ('aiVisibility' as const);
  const adapter = isUser ? userUnitsVisibilityAdapter : aiUnitsVisibilityAdapter;

  return { key, adapter };
}

export const TrainingFeature = createFeature({
  name: StoreNames.trainingGround,
  reducer: createReducer(
    TrainingInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(TrainingActions.setUnitArrayVisibility, (state, action) => {
      const { key, adapter } = getVisibilityUnitsConfig(action.isUser);

      return { ...state, [key]: adapter.setAll(action.data, state[key]) };
    }),
    on(TrainingActions.updateUnitArrayVisibility, (state, action) => {
      const { key, adapter } = getVisibilityUnitsConfig(action.isUser);

      return { ...state, [key]: adapter.updateMany(action.data, state[key]) };
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

    const aiVisibilitySelectors = aiUnitsVisibilityAdapter.getSelectors(
      baseSelectors.selectAiVisibility,
    );
    const userVisibilitySelectors = userUnitsVisibilityAdapter.getSelectors(
      baseSelectors.selectUserVisibility,
    );

    return {
      selectAiUnitsEntities: aiSelectors.selectEntities,
      selectUserUnitsEntities: userSelectors.selectEntities,
      selectAiUnits: aiSelectors.selectAll,
      selectUserUnits: userSelectors.selectAll,
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.trainingGround),
      selectCanStartTrainingBattle: () =>
        makeCanStartTrainingBattle(aiSelectors.selectAll, userSelectors.selectAll),
      selectUnitVisibility: (id: UnitName, isUser: boolean) =>
        makeUnitVisibility(
          isUser ? userVisibilitySelectors.selectAll : aiVisibilitySelectors.selectAll,
          id,
          isUser,
        ),
    };
  },
});

export const {
  selectAiUnits,
  selectUserUnits,
  selectFieldConfig: selectTrainingFieldConfig,
  selectCanStartTrainingBattle,
  selectUnitVisibility,
} = TrainingFeature;
