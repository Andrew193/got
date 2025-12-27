import { Unit } from './units-related/unit.model';
import { TileUnitSkill } from './units-related/skill.model';
import { DisplayReward } from '../services/reward/reward.service';
import { Currency } from '../services/users/users.interfaces';

export interface Position {
  i: number;
  j: number;
}

export interface TilesToHighlight extends Position {
  highlightedClass: string;
}

export type Coordinate = {
  x: number;
  y: number;
};

type TileUnitKeys =
  | 'health'
  | 'user'
  | 'imgSrc'
  | 'canMove'
  | 'canAttack'
  | 'attackRange'
  | 'canCross'
  | 'effects'
  | 'heroType'
  | 'attack'
  | 'defence'
  | 'maxHealth'
  | 'name'
  | 'maxCanCross'
  | 'reducedDmgFromDebuffs'
  | 'dmgReducedBy'
  | 'willpower'
  | 'ignoredDebuffs'
  | 'rage'
  | 'onlyHealer';

export type TileUnit = Required<
  Coordinate &
    Pick<Unit, TileUnitKeys> & {
      skills: TileUnitSkill[];
      healer: boolean;
    }
>;

export interface TileUnitWithReward extends TileUnit {
  reward: DisplayReward;
}

export interface Tile extends Coordinate {
  active: boolean;
  entity?: TileUnit;
}

export class GameFieldVars {
  gameField: Tile[][] = [];
  gameConfig: Tile[][] = [];
  possibleMoves: Position[] = [];
}

export type GameResultsRedirectType = (
  realAiUnits: TileUnit[] | TileUnitWithReward[],
  win: boolean,
  reward?: Currency,
) => void;
