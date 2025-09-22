import { Unit } from './unit.model';

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

export interface Tile extends Coordinate {
  active: boolean;
  entity?: Unit;
}

export class GameFieldVars {
  gameField: Tile[][] = [];
  gameConfig: any[][] = [];
  tilesToHighlight: TilesToHighlight[] = [];
  possibleMoves: Position[] = [];
}
