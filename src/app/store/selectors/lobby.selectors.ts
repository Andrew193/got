import { StoreType } from '../store.interfaces';
import { createSelector } from '@ngrx/store';

const selectLobby = (store: StoreType) => store.lobby;

export const selectDailyRewardFlag = createSelector(selectLobby, lobby => {
  return lobby.showDailyReward;
});
