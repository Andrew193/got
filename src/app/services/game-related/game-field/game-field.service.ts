import { inject, Injectable } from '@angular/core';
import { AbstractFieldService } from '../../abstract/field/abstract-field.service';
import { GameService } from '../game-action/game.service';
import { Skill, TileUnitSkill } from '../../../models/units-related/skill.model';
import { getDiagonals } from '../../../constants';
import { Position, TileUnit } from '../../../models/field.model';
import { NumbersService } from '../../numbers/numbers.service';

@Injectable({
  providedIn: 'root',
})
export class GameFieldService extends AbstractFieldService {
  private numberService = inject(NumbersService);
  private gameActionService = inject(GameService);

  chooseAiSkill(skills: TileUnitSkill[]): TileUnitSkill {
    const possibleActiveSkill = skills.find(skill => skill.cooldown && !skill.remainingCooldown);

    return possibleActiveSkill || (skills.find(skill => !skill.cooldown) as Skill);
  }

  getDamage(unitConfig: { dmgTaker: TileUnit; attackDealer: TileUnit }) {
    const fixedDefence = this.gameActionService.getFixedDefence(
      unitConfig.dmgTaker.defence,
      unitConfig.dmgTaker,
    );
    const fixedAttack = this.gameActionService.getFixedAttack(
      unitConfig.attackDealer.attack,
      unitConfig.attackDealer,
    );
    const blockedDamage = fixedDefence * 0.4;

    if (blockedDamage - 200 > fixedAttack) {
      return +(100 + this.numberService.getRandomInt(10, 70)).toFixed(0);
    } else {
      const fixedDmg = unitConfig.dmgTaker.dmgReducedBy
        ? fixedAttack -
          blockedDamage -
          (fixedAttack - blockedDamage) * unitConfig.dmgTaker.dmgReducedBy
        : fixedAttack - blockedDamage;

      return +(fixedDmg + this.numberService.getRandomInt(30, 100)).toFixed(0);
    }
  }

  getShortestPathCover(
    grid: number[][],
    start: Position,
    end: Position,
    removeStart = false,
    removeEnd = false,
    checkDiagonals = false,
  ) {
    const path = this.shortestPath(grid, start, end, checkDiagonals);

    if (removeStart) {
      return path.filter(position => position.j !== start.j || position.i !== start.i);
    }

    if (removeEnd) {
      return path.filter(position => position.i !== end.i || position.j !== end.j);
    }

    return path;
  }

  canReachPosition(grid: number[][], start: Position, target: Position) {
    const rows = grid.length;
    const cols = grid[0].length;
    const queue = [start];
    const visited = new Set();

    // Convert position to a unique string for tracking visited nodes
    const positionKey = (pos: Position | undefined) => `${pos!.i},${pos!.j}`;

    while (queue.length > 0) {
      const current = queue.shift();

      // Check if we've reached the target
      if (current!.i === target.i && current!.j === target.j) {
        return true;
      }

      // Mark the current position as visited
      visited.add(positionKey(current));

      // Check possible moves (up, down, left, right)
      const directions = getDiagonals(true);

      for (const { di, dj } of directions) {
        const newI = current!.i + di;
        const newJ = current!.j + dj;

        // Ensure the new position is within bounds and not blocked or visited
        if (newI >= 0 && newI < rows && newJ >= 0 && newJ < cols) {
          if (
            (grid[newI][newJ] === 0 || (newI === target.i && newJ === target.j)) &&
            !visited.has(
              positionKey({
                i: newI,
                j: newJ,
              }),
            )
          ) {
            queue.push({ i: newI, j: newJ });
          }
        }
      }
    }

    return false; // Target cannot be reached
  }

  private shortestPath(
    grid: any[],
    start: Position,
    end: Position,
    checkDiagonals = false,
  ): Position[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const queue = [{ position: start, path: [start] }];
    const visited = new Set();

    const directions = getDiagonals(checkDiagonals);

    let closestPosition = start;
    let minDistance = Infinity;

    while (queue.length > 0) {
      // @ts-expect-error
      const { position, path } = queue.shift();
      const distanceToEnd = Math.abs(position.i - end.i) + Math.abs(position.j - end.j);

      if (distanceToEnd < minDistance) {
        closestPosition = position;
        minDistance = distanceToEnd;
      }

      if (position.i === end.i && position.j === end.j) {
        return path;
      }

      for (const { di, dj } of directions) {
        const i = position.i + di;
        const j = position.j + dj;

        if (
          i >= 0 &&
          i < rows &&
          j >= 0 &&
          j < cols &&
          grid[i][j] !== 1 &&
          !visited.has(`${i},${j}`)
        ) {
          const newPath = [...path, { i, j }];

          queue.push({ position: { i, j }, path: newPath });
          visited.add(`${i},${j}`);
        }
      }
    }

    return this.shortestPath(grid, start, closestPosition, checkDiagonals);
  }
}
