import {
  StoreNames,
  Collection,
  UnitsConfiguratorStateUnit,
  UnitsConfiguratorState,
  UnitsConfiguratorUnitConfig,
} from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { UnitsConfiguratorFeatureActions } from '../actions/units-configurator.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';
import {
  makeCanStartBattle,
  makeSelectUnitConfig,
  makeSelectUnitConfigs,
  makeSelectUnits,
} from '../selectors/units-configurator.selectors';
import { UnitName } from '../../models/units-related/unit.model';
import { HeroesSelectNames } from '../../constants';

export function getUnitKey(config: { collection: HeroesSelectNames; key?: any; name?: any }) {
  return `${config.collection}:${config.name || config.key}`;
}

function selectUnitsId(model: UnitsConfiguratorStateUnit) {
  return getUnitKey(model);
}

function selectUnitsVisibilityId(model: { name: UnitName } & Collection) {
  return getUnitKey(model);
}

const unitsAdapter = createEntityAdapter<UnitsConfiguratorStateUnit>({
  selectId: selectUnitsId,
});
const unitsConfigAdapter = createEntityAdapter<UnitsConfiguratorUnitConfig>({
  selectId: selectUnitsVisibilityId,
});

export const UnitsConfiguratorInitialState: UnitsConfiguratorState = {
  units: unitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
  unitUpdateAllowed: true,
  unitsConfig: unitsConfigAdapter.getInitialState([]),
};

export const UnitsConfiguratorFeature = createFeature({
  name: StoreNames.unitsConfigurator,
  reducer: createReducer(
    UnitsConfiguratorInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(UnitsConfiguratorFeatureActions.setUnitArrayConfig, (state, action) => {
      return {
        ...state,
        unitsConfig: unitsConfigAdapter.addMany(action.data, state.unitsConfig),
      };
    }),
    on(UnitsConfiguratorFeatureActions.updateUnitArrayConfig, (state, action) => {
      return {
        ...state,
        unitsConfig: unitsConfigAdapter.updateMany(action.data, state.unitsConfig),
      };
    }),
    on(UnitsConfiguratorFeatureActions.updateUnitConfig, (state, action) => {
      return {
        ...state,
        unitsConfig: unitsConfigAdapter.updateOne(action.data, state.unitsConfig),
      };
    }),
    on(UnitsConfiguratorFeatureActions.setUnitUpdate, (state, action) => {
      return { ...state, unitUpdateAllowed: action.canUpdateUnit };
    }),
    on(UnitsConfiguratorFeatureActions.setUnits, (state, action) => {
      return { ...state, units: unitsAdapter.setAll(action.units, state.units) };
    }),
    on(UnitsConfiguratorFeatureActions.addUnit, (state, action) => {
      return { ...state, units: unitsAdapter.addOne(action.data, state.units) };
    }),
    on(UnitsConfiguratorFeatureActions.removeUnit, (state, action) => {
      return { ...state, units: unitsAdapter.removeOne(getUnitKey(action), state.units) };
    }),
    on(UnitsConfiguratorFeatureActions.setUnitCoordinate, (state, action) => {
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
    on(UnitsConfiguratorFeatureActions.drop, (state, action) => {
      if (action.collections && Array.isArray(action.collections)) {
        return {
          ...state,
          // @ts-ignore
          units: unitsAdapter.removeMany(
            _ => action.collections.includes(_.collection),
            state.units,
          ),
          // @ts-ignore
          unitsConfig: unitsConfigAdapter.removeMany(
            _ => action.collections.includes(_.collection),
            state.unitsConfig,
          ),
        };
      }

      return UnitsConfiguratorInitialState;
    }),
    on(UnitsConfiguratorFeatureActions.dropSelectUnits, state => {
      return {
        ...state,
        units: unitsAdapter.removeAll(state.units),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const unitsSelectors = unitsAdapter.getSelectors(baseSelectors.selectUnits);
    const unitsConfigSelectors = unitsConfigAdapter.getSelectors(baseSelectors.selectUnitsConfig);

    return {
      selectUnitsEntities: unitsSelectors.selectEntities,
      selectUnits: (collection: HeroesSelectNames) =>
        makeSelectUnits(unitsSelectors.selectAll, collection),
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.unitsConfigurator),
      selectCanStartBattle: () => makeCanStartBattle(unitsSelectors.selectAll),
      selectUnitConfig: (unit: { name: UnitName; collection: HeroesSelectNames }) =>
        makeSelectUnitConfig(unitsConfigSelectors.selectAll, unit),
      selectAllUnitConfigs: (collection: HeroesSelectNames) =>
        makeSelectUnitConfigs(unitsConfigSelectors.selectAll, collection),
    };
  },
});

export const {
  selectUnits,
  selectFieldConfig: selectTrainingFieldConfig,
  selectCanStartBattle,
  selectUnitConfig,
  selectAllUnitConfigs,
} = UnitsConfiguratorFeature;
