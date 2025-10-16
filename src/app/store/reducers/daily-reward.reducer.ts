import { DailyRewardState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import {
  hideHeroPreview,
  showHeroPreview,
  toggleHeroPreview,
} from '../actions/daily-reward.actions';

export const DailyRewardInitialState: DailyRewardState = {
  isHeroPreview: false,
};

export const DailyRewardFeature = createFeature({
  name: StoreNames.dailyReward,
  reducer: createReducer(
    DailyRewardInitialState,
    on(showHeroPreview, state => {
      return { ...state, isHeroPreview: true };
    }),
    on(hideHeroPreview, state => {
      return { ...state, isHeroPreview: false };
    }),
    on(toggleHeroPreview, state => {
      return { ...state, isHeroPreview: !state.isHeroPreview };
    }),
  ),
});

export const { selectIsHeroPreview } = DailyRewardFeature;
