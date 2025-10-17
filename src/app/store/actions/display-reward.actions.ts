import { createAction, props } from '@ngrx/store';
import { DisplayReward } from '../../services/reward/reward.service';
import { DisplayRewardNames } from '../store.interfaces';

export const setDisplayRewardState = createAction(
  '[Display Reward] setDisplayRewardState',
  props<{ name: DisplayRewardNames; data: DisplayReward[] }>(),
);
export const setDisplayRewardCartState = createAction(
  '[Display Reward] setDisplayRewardCartState',
  props<{ name: DisplayRewardNames; index: number; data: DisplayReward }>(),
);
