import {Injectable} from '@angular/core';
import {Position, Skill, Tile, Unit} from "../../interface";
import {AbstractFieldService} from "../abstract/field/abstract-field.service";

@Injectable({
  providedIn: 'root'
})
export class GameFieldService extends AbstractFieldService {
  constructor() {
    super();
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

  resetMoveAndAttack(unitArray: Unit[], setValue = true) {
    unitArray.forEach((aiUnit, index) => unitArray[index] = {...aiUnit, canMove: setValue, canAttack: setValue})
  }

  getGridFromField(field: Tile[][]): number[][] {
    const grid = [];
    for (let i = 0; i < 7; i++) {
      grid[i] = [];
      for (let j = 0; j < 10; j++) {
        // @ts-ignore
        grid[i].push(field[i][j].active && !field[i][j].entity ? 0 : 1)
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

