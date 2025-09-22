import { Injectable } from '@angular/core';
import { GameField } from '../../../components/abstract/abstract-game-field/abstract-game-field.component';
import { createDeepCopy } from '../../../helpers';
import { Unit } from '../../../models/unit.model';
import { GameFieldVars, Position, Tile } from '../../../models/field.model';

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

  populateGameFieldWithUnits(userUnits: Unit[], aiUnits: Unit[]) {
    this.gameConfig = this.getGameField(userUnits, aiUnits, this.getDefaultGameField());

    return this.gameConfig;
  }

  abstract getDamage(
    unitConfig: { dmgTaker: Unit; attackDealer: Unit },
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
    for (let i = 0; i < 7; i++) {
      this.gameField[i] = [];
      const innerArray = [];

      for (let j = 0; j < 10; j++) {
        innerArray.push({ x: i, y: j, active: true });
      }

      this.gameField[i] = innerArray;
    }

    return this.gameField;
  }

  getGameField(userUnits: Unit[], aiUnits: Unit[], gameField: Tile[][], objects: Tile[] = []) {
    const field = createDeepCopy(gameField);
    //const unplayableObjects = [{x:0, y:1},{x:1, y:1},{x:2, y:1},{x:3, y:1},{x:4, y:1},{x:5, y:1}, {x:6, y:1}]

    userUnits.forEach(user => {
      field[user.x][user.y] = {
        ...field[user.x][user.y],
        active: false,
        entity: user,
      };
    });

    aiUnits.forEach(ai => {
      field[ai.x][ai.y] = { ...field[ai.x][ai.y], active: false, entity: ai };
    });

    objects.forEach(ai => {
      field[ai.x][ai.y] = {
        ...field[ai.x][ai.y],
        active: false,
        entity: {} as Unit,
      };
    });

    return field;
  }

  resetMoveAndAttack(unitArray: Unit[] | Unit[][], setValue = true) {
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
