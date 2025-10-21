//Store
import { HeroesNamesCodes, PreviewUnit } from '../models/unit.model';
import { DisplayReward } from '../services/reward/reward.service';
import { RewardValues } from '../models/reward-based.model';
import { HeroesSelectNames } from '../constants';
import { EntityState } from '@ngrx/entity';
import { TilesToHighlight } from '../models/field.model';
import { LogRecord } from '../models/logger.model';

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
  aiUnits: EntityState<PreviewUnit>;
  userUnits: EntityState<PreviewUnit>;
};

export type TrainingStateSelectUnit = {
  units: PreviewUnit[];
};

//Display reward
export type DisplayRewardState = Record<DisplayRewardNames, EntityState<DisplayReward>>;

//Heroes select
export type HeroesSelectStateEntity = RewardValues | HeroesNamesCodes;

export type HeroesSelectState = Record<HeroesSelectNames, EntityState<HeroesSelectStateEntity>>;

//Game Board
export interface BasicBoardLogRecord extends EntityState<LogRecord> {
  keepTrack: boolean;
}

export type BasicBoardState = {
  tilesToHighlight: EntityState<TilesToHighlight>;
  battleLog: BasicBoardLogRecord;
};
