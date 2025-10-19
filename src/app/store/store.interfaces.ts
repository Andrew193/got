//Store
import { HeroesNamesCodes, PreviewUnit } from '../models/unit.model';
import { DisplayReward } from '../services/reward/reward.service';
import { RewardValues } from '../models/reward-based.model';
import { HeroesSelectNames } from '../constants';

export enum StoreNames {
  lobby = 'lobby',
  dailyReward = 'dailyReward',
  trainingGround = 'trainingGround',
  displayReward = 'displayReward',
  heroesSelect = 'heroesSelect',
  gameBoard = 'gameBoard',
}

export enum DisplayRewardNames {
  summon = 'summonTree',
  gift = 'gift',
  finalLoginButtle = 'finalLoginButtle',
}

export type StoreType = {
  [StoreNames.lobby]: LobbyState;
  [StoreNames.dailyReward]: DailyRewardState;
  [StoreNames.trainingGround]: TrainingState;
  [StoreNames.displayReward]: DisplayRewardState;
  [StoreNames.gameBoard]: BasicBoardState;
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

//Heroes select
export type HeroesSelectStateContexts = Record<
  HeroesSelectNames,
  (RewardValues | HeroesNamesCodes)[]
>;

export type HeroesSelectState = {
  contexts: HeroesSelectStateContexts;
};

//Game Board
export type BasicBoardStateContexts = Record<string, string>;

export type BasicBoardState = {
  contexts: BasicBoardStateContexts;
};
