import {
  StoreNames,
  TrainingState,
  TrainingStateUnit,
  TrainingStateUnitType,
  TrainingVisibilityUnit,
} from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { TrainingActions } from '../actions/training.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';
import {
  makeCanStartTrainingBattle,
  makeSelectUnits,
  makeUnitVisibility,
} from '../selectors/training.selectors';
import { UnitName } from '../../models/units-related/unit.model';

function getUnitKey(config: { collection: TrainingStateUnitType; key?: string; name?: string }) {
  return `${config.collection}:${config.name || config.key}`;
}

function selectUnitsId(model: TrainingStateUnit) {
  return getUnitKey(model);
}

function selectUnitsVisibilityId(model: { name: UnitName }) {
  return model.name;
}

const unitsAdapter = createEntityAdapter<TrainingStateUnit>({
  selectId: selectUnitsId,
});

//Visibility
const aiUnitsVisibilityAdapter = createEntityAdapter<TrainingVisibilityUnit>({
  selectId: selectUnitsVisibilityId,
});
const userUnitsVisibilityAdapter = createEntityAdapter<TrainingVisibilityUnit>({
  selectId: selectUnitsVisibilityId,
});

export const TrainingInitialState: TrainingState = {
  units: unitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
  unitUpdateAllowed: true,
  aiVisibility: aiUnitsVisibilityAdapter.getInitialState([]),
  userVisibility: userUnitsVisibilityAdapter.getInitialState([]),
};

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
    on(TrainingActions.setUnits, (state, action) => {
      return { ...state, units: unitsAdapter.setAll(action.units, state.units) };
    }),
    on(TrainingActions.addUnit, (state, action) => {
      return { ...state, units: unitsAdapter.addOne(action.data, state.units) };
    }),
    on(TrainingActions.removeUnit, (state, action) => {
      return { ...state, units: unitsAdapter.removeOne(getUnitKey(action), state.units) };
    }),
    on(TrainingActions.setUnitCoordinate, (state, action) => {
      if (state.unitUpdateAllowed) {
        return {
          ...state,
          units: unitsAdapter.updateOne(
            { id: getUnitKey(action), changes: action.coordinate },
            state.units,
          ),
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
        units: unitsAdapter.removeAll(state.units),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const unitsSelectors = unitsAdapter.getSelectors(baseSelectors.selectUnits);

    const aiVisibilitySelectors = aiUnitsVisibilityAdapter.getSelectors(
      baseSelectors.selectAiVisibility,
    );
    const userVisibilitySelectors = userUnitsVisibilityAdapter.getSelectors(
      baseSelectors.selectUserVisibility,
    );

    return {
      selectUnitsEntities: unitsSelectors.selectEntities,
      selectUnits: (collection: TrainingStateUnitType) =>
        makeSelectUnits(unitsSelectors.selectAll, collection),
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.trainingGround),
      selectCanStartTrainingBattle: () => makeCanStartTrainingBattle(unitsSelectors.selectAll),
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
  selectUnits,
  selectUnitsEntities,
  selectFieldConfig: selectTrainingFieldConfig,
  selectCanStartTrainingBattle,
  selectUnitVisibility,
} = TrainingFeature;
