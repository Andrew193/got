import { StoreNames } from './store.interfaces';
import { LobbyReducer } from './reducers/lobby.reducer';
import { provideState } from '@ngrx/store';
import { DailyRewardFeature } from './reducers/daily-reward.reducer';
import { TrainingFeature } from './reducers/training.reducer';
import { EnvironmentProviders } from '@angular/core';
import { DisplayRewardFeature } from './reducers/display-reward.reducer';
import { HeroesSelectFeature } from './reducers/heroes-select.reducer';
import { GameBoardFeature } from './reducers/game-board.reducer';

export const StateConfigs: Record<StoreNames, EnvironmentProviders[]> = {
  [StoreNames.lobby]: [provideState({ name: StoreNames.lobby, reducer: LobbyReducer })],
  [StoreNames.dailyReward]: [provideState(DailyRewardFeature)],
  [StoreNames.trainingGround]: [provideState(TrainingFeature)],
  [StoreNames.displayReward]: [provideState(DisplayRewardFeature)],
  [StoreNames.heroesSelect]: [provideState(HeroesSelectFeature)],
  [StoreNames.gameBoard]: [provideState(GameBoardFeature)],
};
