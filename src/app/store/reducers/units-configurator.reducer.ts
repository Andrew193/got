import {
  StoreNames,
  Collection,
  UnitsConfiguratorStateUnit,
  UnitsConfiguratorVisibilityUnit,
  UnitsConfiguratorState,
} from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';
import { UnitsConfiguratorFeatureActions } from '../actions/units-configurator.actions';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';
import {
  makeCanStartBattle,
  makeSelectUnits,
  makeUnitVisibility,
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
const unitsVisibilityAdapter = createEntityAdapter<UnitsConfiguratorVisibilityUnit>({
  selectId: selectUnitsVisibilityId,
});

export const UnitsConfiguratorInitialState: UnitsConfiguratorState = {
  units: unitsAdapter.getInitialState([]),
  fieldConfig: FieldConfigInitialState,
  unitUpdateAllowed: true,
  unitsVisibility: unitsVisibilityAdapter.getInitialState([]),
};

export const UnitsConfiguratorFeature = createFeature({
  name: StoreNames.unitsConfigurator,
  reducer: createReducer(
    UnitsConfiguratorInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(UnitsConfiguratorFeatureActions.setUnitArrayVisibility, (state, action) => {
      return {
        ...state,
        unitsVisibility: unitsVisibilityAdapter.addMany(action.data, state.unitsVisibility),
      };
    }),
    on(UnitsConfiguratorFeatureActions.updateUnitArrayVisibility, (state, action) => {
      return {
        ...state,
        unitsVisibility: unitsVisibilityAdapter.updateMany(action.data, state.unitsVisibility),
      };
    }),
    on(UnitsConfiguratorFeatureActions.setUnitUpdate, (state, action) => {
      return { ...state, unitUpdateAllowed: action.canUpdateUnit };
    }),
    on(UnitsConfiguratorFeatureActions.setUnits, (state, action) => {
      return { ...state, units: unitsAdapter.addMany(action.units, state.units) };
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
    on(UnitsConfiguratorFeatureActions.drop, () => {
      console.log(UnitsConfiguratorInitialState);

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
    const unitsVisibilitySelectors = unitsVisibilityAdapter.getSelectors(
      baseSelectors.selectUnitsVisibility,
    );

    return {
      selectUnitsEntities: unitsSelectors.selectEntities,
      selectUnits: (collection: HeroesSelectNames) =>
        makeSelectUnits(unitsSelectors.selectAll, collection),
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.unitsConfigurator),
      selectCanStartBattle: () => makeCanStartBattle(unitsSelectors.selectAll),
      selectUnitVisibility: (unit: { name: UnitName; collection: HeroesSelectNames }) =>
        makeUnitVisibility(unitsVisibilitySelectors.selectAll, unit),
    };
  },
});

export const {
  selectUnits,
  selectFieldConfig: selectTrainingFieldConfig,
  selectCanStartBattle,
  selectUnitVisibility,
} = UnitsConfiguratorFeature;
