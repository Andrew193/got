import { createActionGroup, props } from '@ngrx/store';
import { DisplayReward } from '../../services/reward/reward.service';
import { DisplayRewardNames, StoreNames } from '../store.interfaces';

export const DisplayRewardActions = createActionGroup({
  source: StoreNames.displayReward,
  events: {
    setDisplayRewardState: props<{ name: DisplayRewardNames; data: DisplayReward[] }>(),
    setDisplayRewardCartState: props<{
      name: DisplayRewardNames;
      index: number;
      data: DisplayReward;
    }>(),
  },
});
