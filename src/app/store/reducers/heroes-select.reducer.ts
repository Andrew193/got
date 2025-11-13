import { HeroesSelectState, HeroesSelectStateEntity, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { HeroesSelectNames } from '../../constants';
import { createEntityAdapter } from '@ngrx/entity';
import { HeroesSelectActions } from '../actions/heroes-select.actions';
import { getUnitKey } from './units-configurator.reducer';
import {
  makeSelectHeroesCollection,
  makeSelectHeroState,
} from '../selectors/heroes-select.selectors';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/units-related/unit.model';

function selectId(model: HeroesSelectStateEntity) {
  return getUnitKey(model);
}

export const heroesSelectAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});

export const HeroesSelectInitialState: HeroesSelectState = {
  selections: heroesSelectAdapter.getInitialState(),
};

export const HeroesSelectFeature = createFeature({
  name: StoreNames.heroesSelect,
  reducer: createReducer(
    HeroesSelectInitialState,
    on(HeroesSelectActions.setHeroesSelectState, (state, action) => {
      return { ...state, selections: heroesSelectAdapter.addMany(action.data, state.selections) };
    }),
    on(HeroesSelectActions.removeHeroFromCollection, (state, action) => {
      return {
        ...state,
        selections: heroesSelectAdapter.removeOne(getUnitKey(action), state.selections),
      };
    }),
    on(HeroesSelectActions.addHeroToCollection, (state, action) => {
      return {
        ...state,
        selections: heroesSelectAdapter.addOne(
          { name: action.name, collection: action.collection },
          state.selections,
        ),
      };
    }),
    on(HeroesSelectActions.resetHeroCollection, (state, action) => {
      return {
        ...state,
        selections: heroesSelectAdapter.removeMany(
          model => model.collection === action.collection,
          state.selections,
        ),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const selectBranch = baseSelectors.selectHeroesSelectState;

    return {
      selectHeroState: (
        collectionName: HeroesSelectNames,
        itemName: RewardValues | HeroesNamesCodes,
      ) => makeSelectHeroState(selectBranch, { name: itemName, collection: collectionName }),
      selectHeroesCollection: (name: HeroesSelectNames) =>
        makeSelectHeroesCollection(selectBranch, name),
    };
  },
});

export const { selectHeroState, selectHeroesCollection } = HeroesSelectFeature;
