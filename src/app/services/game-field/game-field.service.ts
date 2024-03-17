import {Injectable} from '@angular/core';
import {Position} from "../../interface";

export interface Tile {
  x: number,
  y: number,
  active: boolean,
  entity?: Unit,
  highlightedClass?: string
}

export interface Effect {
  imgSrc: string,
  type: string,
  duration: number,
  m: number,
  restore?: boolean
  passive?: boolean,
  defBreak?: number
}

export interface Skill {
  imgSrc: string,
  dmgM: number,
  debuffs?: Effect[],
  inRangeDebuffs?: Effect[],
  buffs?: Effect[],
  cooldown: number,
  remainingCooldown: number,
  name: string,
  passive?: boolean,
  restoreSkill?: boolean,
  attackInRange?: boolean,
  attackRange?: number,
  attackInRangeM?: number,
  description: string
}

export interface Unit {
  x: number,
  y: number,
  rank: number,
  eq1Level: number,
  eq2Level: number,
  eq3Level: number,
  eq4Level: number,
  level: number,
  rankBoost: number,
  healthIncrement: number,
  attackIncrement: number,
  defenceIncrement: number,
  dmgReducedBy: number,
  ignoredDebuffs: string[],
  reducedDmgFromDebuffs: string[]
  user: boolean,
  imgSrc: string,
  canMove: boolean
  canCross: number,
  maxCanCross: number,
  canAttack: boolean,
  attackRange: number,
  description: string,
  health: number,
  maxHealth: number,
  name: string,
  attack: number,
  defence: number,
  rage: number,
  willpower: number,
  fullImgSrc?: string,
  skills: Skill[],
  effects: Effect[]
}

@Injectable({
  providedIn: 'root'
})
export class GameFieldService {
  gameField: Tile[][];
  gameConfig: any[][] = [];
  possibleMoves: Position[] = [];

  constructor() {
    this.gameField = [];
  }

  unhighlightCells() {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10; j++) {
        this.gameConfig[i][j] = {...this.gameConfig[i][j], highlightedClass: ""}
      }
    }
    this.possibleMoves = [];
  }

  chooseAiSkill(skills: Skill[]): Skill {
    const possibleActiveSkill = skills.find((skill) => skill.cooldown && !skill.remainingCooldown)
    return possibleActiveSkill || (skills.find((skill) => !skill.cooldown) as Skill);
  }

  getDamage(attack: number, defence: number, unit: Unit) {
    const blockedDamage = defence * 0.4;
    if (blockedDamage - 200 > attack) {
      return +(100 + this.getRandomInt(10, 70)).toFixed(0);
    } else {
      const fixedDmg = !!unit.dmgReducedBy ? (attack - blockedDamage) - ((attack - blockedDamage) * unit.dmgReducedBy) : attack - blockedDamage
      return +(fixedDmg + this.getRandomInt(30, 100)).toFixed(0);
    }
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  findUnitIndex(units: Unit[], unit: { x: number, y: number, [key: string]: any } | null) {
    return units.findIndex((enemy) => enemy.x === unit?.x && enemy.y === unit?.y)
  }

  findSkillIndex(skills: Skill[], selectedSkill: Skill) {
    return skills.findIndex((skill) => skill.dmgM === selectedSkill.dmgM && skill.name === selectedSkill.name)
  }

  orderUnitsByDistance(start: { x: number, y: number }, positions: { x: number, y: number }[]) {
    return positions.sort((a, b) => {
      const distanceA = Math.abs(a.x - start.x) + Math.abs(a.y - start.y);
      const distanceB = Math.abs(b.x - start.x) + Math.abs(b.y - start.y);
      return distanceA - distanceB;
    });
  }

  resetMoveAndAttack(unitArray: Unit[],) {
    unitArray.forEach((aiUnit, index) => unitArray[index] = {...aiUnit, canMove: true, canAttack: true})
  }

  getPositionFromUnit(unit: Unit) {
    return {
      i: unit.x,
      j: unit.y
    }
  }

  getUnitFromPosition(position: Position) {
    return {
      x: position?.i,
      y: position?.j
    }
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

    userUnits.forEach((user) => {
      field[user.x][user.y] = {...field[user.x][user.y], active: false, entity: user}
    })

    aiUnits.forEach((ai) => {
      field[ai.x][ai.y] = {...field[ai.x][ai.y], active: false, entity: ai}
    })

    return field;
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

  getShortestPathCover(grid: string | any[], start: Position, end: Position, removeStart = false, removeEnd = false, checkDiagonals = false) {
    const path = this.shortestPath(grid, start, end, checkDiagonals);
    if (removeStart) {
      return path.filter((position) => position.j !== start.j || position.i !== start.i)
    }
    if (removeEnd) {
      return path.filter((position) => position.i !== end.i || position.j !== end.j)
    }
    return path;
  }

  recountSkillsCooldown = (skills: Skill[]) => skills.map((skill) => ({
    ...skill,
    remainingCooldown: skill.remainingCooldown > 0 ? skill.remainingCooldown - 1 : 0
  }))

  shortestPath(grid: string | any[], start: Position, end: Position, checkDiagonals = false): Position[] {
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

