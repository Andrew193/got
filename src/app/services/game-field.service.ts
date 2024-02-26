import {Injectable} from '@angular/core';

export interface Tile {
  x: number,
  y: number,
  active: boolean,
  entity?: Unit,
  highlightedClass?: string
}

export interface Unit {
  x: number,
  y: number,
  user: boolean,
  imgSrc: string
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

  getGameField(userUnits: Unit[], aiUnits: Unit[], gameField: Tile[][]) {
    const field = JSON.parse(JSON.stringify(gameField))

    userUnits.forEach((user)=>{
      field[user.x][user.y] = {...field[user.x][user.y], active: false, entity: user}
    })

    aiUnits.forEach((ai)=>{
      field[ai.x][ai.y] = {...field[ai.x][ai.y], active: false, entity: ai}
    })

    return field;
  }

  getFieldsInRadius(grid: Tile[][], location: {i: number, j: number}, radius: number, diagonalCheck?: boolean) {
    const fields = [];
    const rows = grid.length;
    const cols = grid[0].length;

    if(diagonalCheck) {
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

  getGridFromField(field: Tile[][]): number[][] {
    const grid = [];
    for (let i = 0; i < 7; i++) {
      grid[i] = [];
      for (let j = 0; j < 10; j++) {
        // @ts-ignore
        grid[i].push(field[i][j].active ? 0 : 1)
      }
    }
    return grid;
  }

  shortestPath(grid: string | any[], start: { i: number; j: number; }, end: {
    i: any;
    j: any;
  }, checkDiagonals = false): { i: number, j: number }[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const queue = [{position: start, path: [start]}];
    const visited = new Set();

    const directions = checkDiagonals
      ? [
        {di: -1, dj: 0},  // Up
        {di: 1, dj: 0},   // Down
        {di: 0, dj: -1},  // Left
        {di: 0, dj: 1},   // Right
        {di: -1, dj: -1}, // Up-Left
        {di: -1, dj: 1},  // Up-Right
        {di: 1, dj: -1},  // Down-Left
        {di: 1, dj: 1}    // Down-Right
      ]
      : [
        {di: -1, dj: 0},
        {di: 1, dj: 0},
        {di: 0, dj: -1},
        {di: 0, dj: 1}
      ];

    let closestPosition = start;
    let minDistance = Infinity;

    while (queue.length > 0) {
      // @ts-ignore
      const {position, path} = queue.shift();
      const distanceToEnd = Math.abs(position.i - end.i) + Math.abs(position.j - end.j);

      if (distanceToEnd < minDistance) {
        closestPosition = position;
        minDistance = distanceToEnd;
      }

      if (position.i === end.i && position.j === end.j) {
        return path;
      }

      for (const {di, dj} of directions) {
        const i = position.i + di;
        const j = position.j + dj;

        if (i >= 0 && i < rows && j >= 0 && j < cols && grid[i][j] !== 1 && !visited.has(`${i},${j}`)) {
          const newPath = [...path, {i, j}];
          queue.push({position: {i, j}, path: newPath});
          visited.add(`${i},${j}`);
        }
      }
    }

    return this.shortestPath(grid, start, closestPosition, checkDiagonals);
  }
}

