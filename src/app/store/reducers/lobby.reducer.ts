import { LobbyState } from '../store.interfaces';
import { createReducer, on } from '@ngrx/store';
import { hideDailyReward, showDailyReward, toggleDailyReward } from '../actions/lobby.actions';

export const LobbyInitialState: LobbyState = {
  showDailyReward: false,
};

export const LobbyReducer = createReducer(
  LobbyInitialState,
  on(showDailyReward, state => {
    return { ...state, showDailyReward: true };
  }),
  on(hideDailyReward, state => {
    return { ...state, showDailyReward: false };
  }),
  on(toggleDailyReward, state => {
    return { ...state, showDailyReward: !state.showDailyReward };
  }),
);
