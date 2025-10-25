import { inject, Injectable } from '@angular/core';
import { GameField } from '../../../components/abstract/abstract-game-field/abstract-game-field.component';
import { GameFieldVars, Position, Tile, TileUnit } from '../../../models/field.model';
import { Store } from '@ngrx/store';
import { selectGameFieldConfig } from '../../../store/reducers/game-board.reducer';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractFieldService extends GameFieldVars implements Partial<GameField> {
  store = inject(Store);
  private fieldConfig = this.store.selectSignal(selectGameFieldConfig());

  getGridFromField(field: Tile[][]): number[][] {
    const fieldConfig = this.fieldConfig();

    const grid: number[][] = [];

    for (let i = 0; i < fieldConfig.rows; i++) {
      grid[i] = [] as number[];
      for (let j = 0; j < fieldConfig.columns; j++) {
        grid[i].push(field[i][j].active && !field[i][j].entity ? 0 : 1);
      }
    }

    return grid;
  }

  populateGameFieldWithUnits(userUnits: TileUnit[], aiUnits: TileUnit[]) {
    return this.getGameField(userUnits, aiUnits, this.getDefaultGameField());
  }

  abstract getDamage(unitConfig: { dmgTaker: TileUnit; attackDealer: TileUnit }): number;

  // getFieldsInRadius(
  //   grid: Tile[][],
  //   location: Position,
  //   radius: number,
  //   diagonalCheck?: boolean,
  // ): Position[] {
  //   const fields = [];
  //   const rows = grid.length;
  //   const cols = grid[0].length;
  //
  //   if (diagonalCheck) {
  //     const { i: centerI, j: centerJ } = location;
  //
  //     for (let i = centerI - radius; i <= centerI + radius; i++) {
  //       for (let j = centerJ - radius; j <= centerJ + radius; j++) {
  //         if (i >= 0 && i < rows && j >= 0 && j < cols) {
  //           if (!(i === location.i && j === location.j)) {
  //             fields.push({ i, j });
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     for (let i = location.i - radius; i <= location.i + radius; i++) {
  //       for (let j = location.j - radius; j <= location.j + radius; j++) {
  //         if (
  //           i >= 0 &&
  //           i < rows &&
  //           j >= 0 &&
  //           j < cols &&
  //           Math.abs(i - location.i) + Math.abs(j - location.j) <= radius
  //         ) {
  //           if (!(i === location.i && j === location.j)) {
  //             fields.push({ i, j });
  //           }
  //         }
  //       }
  //     }
  //   }
  //
  //   return fields;
  // }
  getFieldsInRadius(
    grid: Tile[][],
    { i: ci, j: cj }: Position,
    radius: number,
    diagonalCheck?: boolean,
  ): Position[] {
    const fields: Position[] = [];
    const rows = grid.length;
    const cols = grid[0].length;

    for (let i = ci - radius; i <= ci + radius; i++) {
      for (let j = cj - radius; j <= cj + radius; j++) {
        if (i === ci && j === cj) continue;
        if (i < 0 || j < 0 || i >= rows || j >= cols) continue;

        if (!diagonalCheck && Math.abs(i - ci) + Math.abs(j - cj) > radius) continue;

        fields.push({ i, j });
      }
    }

    return fields;
  }

  getDefaultGameField() {
    const fieldConfig = this.fieldConfig();

    const tempGameField: Tile[][] = [];

    for (let i = 0; i < fieldConfig.rows; i++) {
      tempGameField[i] = [];
      const innerArray = [];

      for (let j = 0; j < fieldConfig.columns; j++) {
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
    const patchedRows: Record<number, Tile[]> = {};

    const ensureRowCopy = (x: number) => (patchedRows[x] ??= [...gameField[x]] as Tile[]);

    const setAt = (x: number, y: number, entity: TileUnit) => {
      const row = ensureRowCopy(x);

      row[y] = { ...row[y], active: false, entity };
    };

    userUnits.forEach(u => setAt(u.x, u.y, u));
    aiUnits.forEach(a => setAt(a.x, a.y, a));
    objects.forEach(o => setAt(o.x, o.y, {} as TileUnit));

    return gameField.map((row, x) => patchedRows[x] ?? [...row]);
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
