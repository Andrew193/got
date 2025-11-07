import { HeroesNamesCodes, PreviewUnit } from '../models/units-related/unit.model';
import { DisplayReward } from '../services/reward/reward.service';
import { RewardValues } from '../models/reward-based.model';
import { HeroesSelectNames } from '../constants';
import { EntityState } from '@ngrx/entity';
import { Coordinate, TilesToHighlight } from '../models/field.model';
import { LogRecord } from '../models/logger.model';
import { Keyword } from '../models/taverna/taverna.model';
import { AssistantMemory } from '../models/interfaces/assistant.interface';

//Store

export enum StoreNames {
  lobby = 'lobby',
  dailyReward = 'dailyReward',
  trainingGround = 'trainingGround',
  displayReward = 'displayReward',
  heroesSelect = 'heroesSelect',
  gameBoard = 'gameBoard',
  assistant = 'assistant',
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

export type FieldConfigState = {
  fieldConfig: FieldConfig;
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
export type TrainingStateUnit = PreviewUnit & Partial<Coordinate>;
export type TrainingVisibilityUnit = Pick<TrainingStateUnit, 'name'> & { visible: boolean };

export interface TrainingState extends FieldConfigState {
  aiUnits: EntityState<TrainingStateUnit>;
  userUnits: EntityState<TrainingStateUnit>;
  unitUpdateAllowed: boolean;
  aiVisibility: EntityState<TrainingVisibilityUnit>;
  userVisibility: EntityState<TrainingVisibilityUnit>;
}

export type TrainingStateSelectUnit = {
  units: TrainingStateUnit[];
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

export type FieldConfig = {
  columns: number;
  rows: number;
};

export interface BasicBoardState extends FieldConfigState {
  tilesToHighlight: EntityState<TilesToHighlight>;
  battleLog: BasicBoardLogRecord;
}

//Assistant
export type AssistantRecord = {
  message: string;
  request: boolean;
  id: string;
  keywords: string[];
  assistantMemoryType: AssistantMemory;
};

export type AssistantRecords = EntityState<AssistantRecord> & {
  loading: boolean;
};

export type AssistantKeywords = EntityState<Keyword>;

export type AssistantState = {
  records: AssistantRecords;
  keywords: AssistantKeywords;
};
