import { StoreNames, StoreType } from './store.interfaces';
import { LobbyInitialState, LobbyReducer } from './reducers/lobby.reducer';
import { provideState } from '@ngrx/store';
import { DailyRewardFeature, DailyRewardInitialState } from './reducers/daily-reward.reducer';
import { TrainingFeature, TrainingInitialState } from './reducers/training.reducer';
import { EnvironmentProviders } from '@angular/core';

export const InitialStore: StoreType = {
  [StoreNames.lobby]: LobbyInitialState,
  [StoreNames.dailyReward]: DailyRewardInitialState,
  [StoreNames.trainingGround]: TrainingInitialState,
};

export const StateConfigs: Record<StoreNames, EnvironmentProviders[]> = {
  [StoreNames.lobby]: [provideState({ name: StoreNames.lobby, reducer: LobbyReducer })],
  [StoreNames.dailyReward]: [provideState(DailyRewardFeature)],
  [StoreNames.trainingGround]: [provideState(TrainingFeature)],
};
