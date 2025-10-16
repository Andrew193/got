import { StoreType } from './store.interfaces';
import { LobbyInitialState, LobbyReducer } from './reducers/lobby.reducer';
import { provideState } from '@ngrx/store';

export enum StoreNames {
  lobby = 'lobby',
}

export const InitialStore: StoreType = {
  [StoreNames.lobby]: LobbyInitialState,
};

export const StateConfigs = [provideState({ name: StoreNames.lobby, reducer: LobbyReducer })];
