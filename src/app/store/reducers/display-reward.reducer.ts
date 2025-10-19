import { DisplayRewardNames, DisplayRewardState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import {
  setDisplayRewardCartState,
  setDisplayRewardState,
} from '../actions/display-reward.actions';
import {
  makeSelectAllCardsFlipped,
  makeSelectCardCollection,
  makeSelectCardState,
  SelectContexts,
} from '../selectors/display-reward.selectors';

export const DisplayRewardInitialState: DisplayRewardState = {
  contexts: {
    [DisplayRewardNames.summon]: [],
    [DisplayRewardNames.gift]: [],
    [DisplayRewardNames.finalLoginButtle]: [],
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
    const selectContexts = baseSelectors.selectContexts as SelectContexts;

    const selectCardState = (name: DisplayRewardNames, index: number) =>
      makeSelectCardState(selectContexts, name, index);

    const selectAllCardsFlipped = (name: DisplayRewardNames, ignoreEmpty = false) =>
      makeSelectAllCardsFlipped(selectContexts, name, ignoreEmpty);

    const selectCardCollection = (name: DisplayRewardNames) =>
      makeSelectCardCollection(selectContexts, name);

    return {
      selectContexts,
      selectCardState,
      selectAllCardsFlipped,
      selectCardCollection,
    };
  },
});

export const {
  selectCardState,
  selectAllCardsFlipped,
  selectCardCollection,
  selectContexts: selectDisplayRewardContexts,
} = DisplayRewardFeature;
