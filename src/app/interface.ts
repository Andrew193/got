import {DisplayReward, Reward} from "./services/reward/reward.service";
import {Unit} from "./models/unit.model";

export interface Position {
  i: number,
  j: number
}

export interface TilesToHighlight extends Position {
  highlightedClass: string
}

export interface LogRecord {
  message: string,
  isUser?: boolean,
  info?: boolean,
  imgSrc: string
}

export interface IdEntity {
  id?: string,

  [key: string]: any
}

export interface DailyReward extends IdEntity {
  userId: string,
  day: number,
  totalDays: number,
  lastLogin: string
}

export interface GiftConfig extends IdEntity {
  userId: string,
  lastVist: string
}

export class GameFieldVars {
  gameField: Tile[][] = [];
  gameConfig: any[][] = [];
  tilesToHighlight: TilesToHighlight[] = [];
  possibleMoves: Position[] = [];
}

export interface RewardComponent {
  items: Reward[];
  rewards: DisplayReward[];
}

export type Coordinate = {
  x: number,
  y: number,
}

export interface Tile extends Coordinate {
  active: boolean,
  entity?: Unit,
  highlightedClass?: string
}

export interface UnitWithReward extends Unit {
  reward: DisplayReward,
  inBattle: boolean,
}

export interface BossReward {
  copper: number,
  copperWin: number,
  copperDMG: number,
  silver: number,
  silverWin: number,
  silverDMG: number,
  gold: number,
  goldWin: number,
  goldDMG: number,
}
