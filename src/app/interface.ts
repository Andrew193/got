import {DisplayReward, Reward} from "./services/reward/reward.service";
import {Unit} from "./models/unit.model";

export interface Position {
  i: number,
  j: number
}
export interface LogRecord {
  message: string,
  isUser?: boolean,
  info?: boolean,
  imgSrc: string
}

export class GameFieldVars {
  gameField: Tile[][] = [];
  gameConfig: any[][] = [];
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
