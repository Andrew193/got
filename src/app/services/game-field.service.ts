import {Injectable} from '@angular/core';

export interface Tile {
  x: number;
  y: number,
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameFieldService {
  gameField: Tile[][];

  constructor() {
    this.gameField = [];

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
}

