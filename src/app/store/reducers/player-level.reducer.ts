import { createFeature, createReducer, on } from '@ngrx/store';
import { PlayerLevelState, StoreNames } from '../store.interfaces';
import { PlayerLevelActions } from '../actions/player-level.actions';

const playerLevelInitialState: PlayerLevelState = {
  level: 1,
  xp: 0,
  loaded: false,
  error: null,
};

export const PlayerLevelFeature = createFeature({
  name: StoreNames.playerLevel,
  reducer: createReducer(
    playerLevelInitialState,
    on(PlayerLevelActions.loadSuccess, (_state, { data }) => ({
      level: data.level,
      xp: data.xp,
      loaded: true,
      error: null,
    })),
    on(PlayerLevelActions.loadFailure, (state, { error }) => ({
      ...state,
      loaded: false,
      error,
    })),
    on(PlayerLevelActions.updateSuccess, (_state, { data }) => ({
      level: data.level,
      xp: data.xp,
      loaded: true,
      error: null,
    })),
    on(PlayerLevelActions.updateFailure, (state, { error }) => ({
      ...state,
      error,
    })),
  ),
});
