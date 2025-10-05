import { Injectable } from '@angular/core';
import { GameField } from '../../../components/abstract/abstract-game-field/abstract-game-field.component';
import { GameFieldVars, Position, Tile, TileUnit } from '../../../models/field.model';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractFieldService extends GameFieldVars implements Partial<GameField> {
  getGridFromField(field: Tile[][]): number[][] {
    const grid: number[][] = [];

    for (let i = 0; i < 7; i++) {
      grid[i] = [] as number[];
      for (let j = 0; j < 10; j++) {
        grid[i].push(field[i][j].active && !field[i][j].entity ? 0 : 1);
      }
    }

    return grid;
  }

  populateGameFieldWithUnits(userUnits: TileUnit[], aiUnits: TileUnit[]) {
    this.gameConfig = this.getGameField(userUnits, aiUnits, this.getDefaultGameField());

    return this.gameConfig;
  }

  abstract getDamage(
    unitConfig: { dmgTaker: TileUnit; attackDealer: TileUnit },
    config: { attack: number },
  ): number;

  getFieldsInRadius(
    grid: Tile[][],
    location: Position,
    radius: number,
    diagonalCheck?: boolean,
  ): Position[] {
    const fields = [];
    const rows = grid.length;
    const cols = grid[0].length;

    if (diagonalCheck) {
      const { i: centerI, j: centerJ } = location;

      for (let i = centerI - radius; i <= centerI + radius; i++) {
        for (let j = centerJ - radius; j <= centerJ + radius; j++) {
          if (i >= 0 && i < rows && j >= 0 && j < cols) {
            if (!(i === location.i && j === location.j)) {
              fields.push({ i, j });
            }
          }
        }
      }
    } else {
      for (let i = location.i - radius; i <= location.i + radius; i++) {
        for (let j = location.j - radius; j <= location.j + radius; j++) {
          if (
            i >= 0 &&
            i < rows &&
            j >= 0 &&
            j < cols &&
            Math.abs(i - location.i) + Math.abs(j - location.j) <= radius
          ) {
            if (!(i === location.i && j === location.j)) {
              fields.push({ i, j });
            }
          }
        }
      }
    }

    return fields;
  }

  getDefaultGameField() {
    const tempGameField: Tile[][] = [];

    for (let i = 0; i < 7; i++) {
      tempGameField[i] = [];
      const innerArray = [];

      for (let j = 0; j < 10; j++) {
        innerArray.push({ x: i, y: j, active: true });
      }

      tempGameField[i] = innerArray;
    }

    this.gameField = tempGameField;

    return this.gameField;
  }

  getGameField(
    userUnits: TileUnit[],
    aiUnits: TileUnit[],
    gameField: Tile[][],
    objects: Tile[] = [],
  ) {
    //const unplayableObjects = [{x:0, y:2},{x:1, y:2},{x:2, y:2},{x:3, y:2},{x:4, y:2},{x:5, y:2}]

    userUnits.forEach(user => {
      gameField[user.x][user.y] = {
        ...gameField[user.x][user.y],
        active: false,
        entity: user,
      };
    });

    aiUnits.forEach(ai => {
      gameField[ai.x][ai.y] = { ...gameField[ai.x][ai.y], active: false, entity: ai };
    });

    objects.forEach(ai => {
      gameField[ai.x][ai.y] = {
        ...gameField[ai.x][ai.y],
        active: false,
        entity: {} as TileUnit,
      };
    });

    return gameField;
  }

  resetMoveAndAttack(unitArray: TileUnit[] | TileUnit[][], setValue = true) {
    unitArray.forEach((aiUnit, index) => {
      if (Array.isArray(aiUnit)) {
        this.resetMoveAndAttack(aiUnit, setValue);
      } else {
        unitArray[index] = {
          ...aiUnit,
          canMove: setValue,
          canAttack: setValue,
        };
      }
    });
  }
}
