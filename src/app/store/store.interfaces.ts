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
  unitsConfigurator = 'unitsConfigurator',
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
  [StoreNames.unitsConfigurator]: UnitsConfiguratorState;
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

//Units Configurator
export type Collection = { collection: HeroesSelectNames };

export type UnitsConfiguratorStateUnit = PreviewUnit & Partial<Coordinate> & Collection;
export type UnitsConfiguratorUnitConfig = Pick<UnitsConfiguratorStateUnit, 'name'> & {
  visible: boolean;
  active: boolean;
} & Collection;

export interface UnitsConfiguratorState extends FieldConfigState {
  units: EntityState<UnitsConfiguratorStateUnit>;
  unitUpdateAllowed: boolean;
  unitsConfig: EntityState<UnitsConfiguratorUnitConfig>;
}

export type UnitsConfiguratorSelectUnit = {
  units: UnitsConfiguratorStateUnit[];
};

//Display reward
export type DisplayRewardState = Record<DisplayRewardNames, EntityState<DisplayReward>>;

//Heroes select
export type HeroesSelectStateEntity = {
  name: RewardValues | HeroesNamesCodes;
} & Collection;

export type HeroesSelectState = {
  selections: EntityState<HeroesSelectStateEntity>;
};

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
