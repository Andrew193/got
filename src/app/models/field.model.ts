import { Unit } from './unit.model';
import { TileUnitSkill } from './skill.model';
import { DisplayReward } from '../services/reward/reward.service';

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
  | 'inBattle'
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
  tilesToHighlight: TilesToHighlight[] = [];
  possibleMoves: Position[] = [];
}
