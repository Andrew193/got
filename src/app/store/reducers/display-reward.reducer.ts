import { DisplayRewardNames, DisplayRewardState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import {
  setDisplayRewardCartState,
  setDisplayRewardState,
} from '../actions/display-reward.actions';

export const DisplayRewardInitialState: DisplayRewardState = {
  contexts: {
    [DisplayRewardNames.summon]: [],
    [DisplayRewardNames.gift]: [],
  },
};

export const DisplayRewardFeature = createFeature({
  name: StoreNames.displayReward,
  reducer: createReducer(
    DisplayRewardInitialState,
    on(setDisplayRewardState, (state, action) => {
      return { ...state, contexts: { ...state.contexts, [action.name]: action.data } };
    }),
    on(setDisplayRewardCartState, (state, action) => {
      const currentCartState = state.contexts[action.name][action.index];
      const newCartState = { ...currentCartState, ...action.data };

      const stateSlice = structuredClone(state.contexts[action.name]);

      stateSlice[action.index] = newCartState;

      return { ...state, contexts: { ...state.contexts, [action.name]: stateSlice } };
    }),
  ),
  extraSelectors: baseSelectors => {
    return {
      selectCardState: (name: DisplayRewardNames, index: number) =>
        createSelector(baseSelectors.selectContexts, ctx => ctx?.[name]?.[index] ?? null),
      selectAllCardsFlipped: (name: DisplayRewardNames) =>
        createSelector(baseSelectors.selectContexts, ctx => ctx[name].every(card => card.flipped)),
      selectCardCollection: (name: DisplayRewardNames) =>
        createSelector(baseSelectors.selectContexts, ctx => ctx[name]),
    };
  },
});

export const { selectCardState, selectAllCardsFlipped, selectCardCollection } =
  DisplayRewardFeature;
