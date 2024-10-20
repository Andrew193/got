import {Injectable} from '@angular/core';
import {GameField} from "../../../components/abstract/abstract-game-field/abstract-game-field.component";
import {GameFieldVars, Position, Tile} from "../../../interface";
import {createDeepCopy} from "../../../helpers";
import {Unit} from "../../../models/unit.model";

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractFieldService extends GameFieldVars implements Partial<GameField> {
  constructor() {
    super()
  }

  populateGameFieldWithUnits(userUnits: Unit[], aiUnits: Unit[]) {
    this.gameConfig = this.getGameField(userUnits, aiUnits, this.getDefaultGameField());
    return this.gameConfig;
  }

  abstract getDamage(unitConfig: { dmgTaker: Unit, attackDealer: Unit }, config: {
    attack: number,
    defence: number
  }): number

  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
  }

  getFieldsInRadius(grid: Tile[][], location: Position, radius: number, diagonalCheck?: boolean) {
    const fields = [];
    const rows = grid.length;
    const cols = grid[0].length;

    if (diagonalCheck) {
      const {i: centerI, j: centerJ} = location;

      for (let i = centerI - radius; i <= centerI + radius; i++) {
        for (let j = centerJ - radius; j <= centerJ + radius; j++) {
          if (i >= 0 && i < rows && j >= 0 && j < cols) {
            if (!(i === location.i && j === location.j)) {
              fields.push({i, j});
            }
          }
        }
      }
    } else {
      for (let i = location.i - radius; i <= location.i + radius; i++) {
        for (let j = location.j - radius; j <= location.j + radius; j++) {
          if (i >= 0 && i < rows && j >= 0 && j < cols && Math.abs(i - location.i) + Math.abs(j - location.j) <= radius) {
            if (!(i === location.i && j === location.j)) {
              fields.push({i, j});
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
        innerArray.push({x: i, y: j, active: true});
      }
      this.gameField[i] = innerArray;
    }
    return this.gameField;
  }

  getGameField(userUnits: Unit[], aiUnits: Unit[], gameField: Tile[][], objects: Tile[] = []) {
    const field = createDeepCopy(gameField);
    // const objects2 = [{x:0, y:1},{x:1, y:1},{x:2, y:1},{x:3, y:1},{x:4, y:1},{x:5, y:1}, {x:6, y:1}]
    userUnits.forEach((user) => {
      field[user.x][user.y] = {...field[user.x][user.y], active: false, entity: user}
    })

    aiUnits.forEach((ai) => {
      field[ai.x][ai.y] = {...field[ai.x][ai.y], active: false, entity: ai}
    })

    objects.forEach((ai) => {
      field[ai.x][ai.y] = {...field[ai.x][ai.y], active: false, entity: {}}
    })


    return field;
  }

  resetMoveAndAttack(unitArray: Unit[], setValue = true) {
    unitArray.forEach((aiUnit, index) => unitArray[index] = {...aiUnit, canMove: setValue, canAttack: setValue})
  }
}
