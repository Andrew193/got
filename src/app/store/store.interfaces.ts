//Store
import { PreviewUnit } from '../models/unit.model';
import { DisplayReward } from '../services/reward/reward.service';

export enum StoreNames {
  lobby = 'lobby',
  dailyReward = 'dailyReward',
  trainingGround = 'trainingGround',
  displayReward = 'displayReward',
}

export enum DisplayRewardNames {
  summon = 'summonTree',
  gift = 'gift',
}

export type StoreType = {
  [StoreNames.lobby]: LobbyState;
  [StoreNames.dailyReward]: DailyRewardState;
  [StoreNames.trainingGround]: TrainingState;
  [StoreNames.displayReward]: DisplayRewardState;
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

//Display reward
export type DisplayRewardStateContexts = Record<DisplayRewardNames, DisplayReward[]>;

export type DisplayRewardState = {
  contexts: DisplayRewardStateContexts;
};

export type TrainingStateSelectUnit = {
  units: PreviewUnit[];
};
