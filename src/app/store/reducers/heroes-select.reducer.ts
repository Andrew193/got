import { HeroesSelectState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { HeroesSelectActions } from '../actions/heroes-select.actions';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/unit.model';
import { HeroesSelectNames } from '../../constants';

export const HeroesSelectInitialState: HeroesSelectState = {
  contexts: {
    [HeroesSelectNames.ai]: [],
    [HeroesSelectNames.dailyBoss]: [],
    [HeroesSelectNames.user]: [],
  },
};

export const HeroesSelectFeature = createFeature({
  name: StoreNames.heroesSelect,
  reducer: createReducer(
    HeroesSelectInitialState,
    on(HeroesSelectActions.setHeroesSelectState, (state, action) => {
      return { ...state, contexts: { ...state.contexts, [action.name]: action.data } };
    }),
    on(HeroesSelectActions.removeHeroFromCollection, (state, { name, itemName }) => {
      const prev = state.contexts[name] ?? [];
      const next = prev.filter(x => x !== itemName);

      return {
        ...state,
        contexts: {
          ...state.contexts,
          [name]: next,
        },
      };
    }),
    on(HeroesSelectActions.resetHeroCollection, (state, action) => {
      return { ...state, contexts: { ...state.contexts, [action.name]: new Set() } };
    }),
    on(HeroesSelectActions.addHeroToCollection, (state, action) => {
      const collection = state.contexts[action.name];

      return {
        ...state,
        contexts: { ...state.contexts, [action.name]: [collection, action.itemName].flat() },
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    return {
      selectHeroesCollection: (name: HeroesSelectNames) => {
        return createSelector(baseSelectors.selectContexts, ctx => ctx[name]);
      },
      selectHeroState: (name: HeroesSelectNames, itemName: RewardValues | HeroesNamesCodes) => {
        return createSelector(baseSelectors.selectContexts, ctx => ctx[name].includes(itemName));
      },
    };
  },
});

export const { selectHeroesCollection, selectHeroState } = HeroesSelectFeature;
