//Store
import { PreviewUnit } from '../models/unit.model';

export enum StoreNames {
  lobby = 'lobby',
  dailyReward = 'dailyReward',
  trainingGround = 'trainingGround',
}

export type StoreType = {
  [StoreNames.lobby]: LobbyState;
  [StoreNames.dailyReward]: DailyRewardState;
  [StoreNames.trainingGround]: TrainingState;
};

//States

//Lobby
export type LobbyState = {
  showDailyReward: boolean;
};

//Daily Reward
export type DailyRewardState = {
  isHeroPreview: boolean;
};

//Training
export type TrainingState = {
  aiUnits: PreviewUnit[];
  userUnits: PreviewUnit[];
};

export type TrainingStateSelectUnit = {
  units: PreviewUnit[];
};
