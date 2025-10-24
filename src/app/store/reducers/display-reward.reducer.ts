import { DisplayRewardNames, DisplayRewardState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { DisplayReward } from '../../services/reward/reward.service';
import { createEntityAdapter } from '@ngrx/entity';
import { DisplayRewardActions } from '../actions/display-reward.actions';
import {
  makeSelectAllCardsFlipped,
  makeSelectCardCollection,
  makeSelectCardState,
} from '../selectors/display-reward.selectors';

const summonAdapter = createEntityAdapter<DisplayReward>();
const giftAdapter = createEntityAdapter<DisplayReward>();
const finalLoginButtleAdapter = createEntityAdapter<DisplayReward>();

export const DisplayRewardInitialState: DisplayRewardState = {
  [DisplayRewardNames.summon]: summonAdapter.getInitialState(),
  [DisplayRewardNames.gift]: giftAdapter.getInitialState(),
  [DisplayRewardNames.finalLoginButtle]: finalLoginButtleAdapter.getInitialState(),
};

export function chooseDisplayRewardAdapter(name: DisplayRewardNames) {
  return {
    [DisplayRewardNames.summon]: summonAdapter,
    [DisplayRewardNames.gift]: giftAdapter,
    [DisplayRewardNames.finalLoginButtle]: finalLoginButtleAdapter,
  }[name];
}

export const DisplayRewardFeature = createFeature({
  name: StoreNames.displayReward,
  reducer: createReducer(
    DisplayRewardInitialState,
    on(DisplayRewardActions.setDisplayRewardState, (state, action) => {
      const adapter = chooseDisplayRewardAdapter(action.name);

      return { ...state, [action.name]: adapter.setAll(action.data, state[action.name]) };
    }),
    on(DisplayRewardActions.setDisplayRewardCartState, (state, action) => {
      const adapter = chooseDisplayRewardAdapter(action.name);

      return {
        ...state,
        [action.name]: adapter.updateOne(
          { id: action.data.id, changes: action.data },
          state[action.name],
        ),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const selectContexts = baseSelectors.selectDisplayRewardState;

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
