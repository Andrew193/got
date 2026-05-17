import { inject, Injectable } from '@angular/core';
import { GameService } from '../game-action/game.service';
import { UnitService } from '../../unit/unit.service';
import { GameFieldService } from '../game-field/game-field.service';
import { Position, Tile, TileUnit } from '../../../models/field.model';
import { TileUnitSkill } from '../../../models/units-related/skill.model';

export interface AiTurnCallbacks {
  /**
   * Execute a full attack action for an AI unit — identical logic to the player's executeAction.
   * Returns the updated attacker unit after the attack (with updated skills, buffs, etc.).
   */
  executeAttack: (
    attackerIndex: number,
    attackerTeam: TileUnit[],
    defenderIndex: number,
    defenderTeam: TileUnit[],
    skill: TileUnitSkill,
  ) => TileUnit;
}

@Injectable({ providedIn: 'root' })
export class AiTurnService {
  private gameService = inject(GameService);
  private unitService = inject(UnitService);
  private fieldService = inject(GameFieldService);

  executeAiTurn(
    aiUnits: TileUnit[],
    userUnits: TileUnit[],
    gameConfig: Tile[][],
    callbacks: AiTurnCallbacks,
  ): void {
    // Apply passive skills to all AI units at turn start
    this.gameService.checkPassiveSkills(aiUnits);

    // Execute each AI unit's turn
    for (let i = 0; i < aiUnits.length; i++) {
      this.executeAiUnitTurn(i, aiUnits, userUnits, gameConfig, callbacks);
    }
  }

  selectTarget(aiUnit: TileUnit, userUnits: TileUnit[]): TileUnit | null {
    // Filter alive units
    const aliveUnits = userUnits.filter(unit => unit.health > 0);

    if (aliveUnits.length === 0) {
      return null;
    }

    // Order by distance (closest first)
    const orderedTargets = this.unitService.orderUnitsByDistance(aiUnit, aliveUnits) as TileUnit[];

    return orderedTargets[0];
  }

  chooseSkill(aiUnit: TileUnit): TileUnitSkill {
    return this.fieldService.chooseAiSkill(aiUnit.skills);
  }

  moveAiUnit(aiUnit: TileUnit, target: TileUnit, gameConfig: Tile[][]): Position {
    const aiPos = this.unitService.getPositionFromCoordinate(aiUnit);
    const targetPos = this.unitService.getPositionFromCoordinate(target);

    // Get shortest path to target
    const path = this.fieldService.getShortestPathCover(
      this.fieldService.getGridFromField(gameConfig),
      aiPos,
      targetPos,
      true, // removeStart
      false, // removeEnd
      true, // checkDiagonals
    );

    // Determine how far AI can move
    const moveTo = this.gameService.getCanGetToPosition(aiUnit, path, targetPos);

    return moveTo;
  }

  private executeAiUnitTurn(
    aiUnitIndex: number,
    aiUnits: TileUnit[],
    userUnits: TileUnit[],
    gameConfig: Tile[][],
    callbacks: AiTurnCallbacks,
  ): void {
    const aiUnit = aiUnits[aiUnitIndex];

    // Skip if unit is dead or cannot move
    if (!aiUnit.health || !aiUnit.canMove) {
      return;
    }

    // Select target
    const target = this.selectTarget(aiUnit, userUnits);

    if (!target) {
      aiUnits[aiUnitIndex] = { ...aiUnit, canMove: false, canAttack: false };

      return;
    }

    // Move toward target
    const newPosition = this.moveAiUnit(aiUnit, target, gameConfig);

    aiUnits[aiUnitIndex] = {
      ...aiUnit,
      x: newPosition.i,
      y: newPosition.j,
      canMove: false,
    };

    // Check if enemy is in attack range
    const enemyInRange = this.getEnemyInRange(aiUnits[aiUnitIndex], userUnits, gameConfig);

    if (enemyInRange) {
      this.executeAiAttack(aiUnitIndex, aiUnits, userUnits, enemyInRange, callbacks);
    } else {
      aiUnits[aiUnitIndex] = { ...aiUnits[aiUnitIndex], canAttack: false };
    }
  }

  private getEnemyInRange(
    aiUnit: TileUnit,
    userUnits: TileUnit[],
    gameConfig: Tile[][],
  ): TileUnit | null {
    const possibleMoves = this.fieldService.getFieldsInRadius(
      gameConfig,
      this.unitService.getPositionFromCoordinate(aiUnit),
      aiUnit.attackRange,
      true, // checkDiagonals
    );

    // Find first alive enemy in range
    for (const move of possibleMoves) {
      const enemy = userUnits.find(
        unit => unit.x === move.i && unit.y === move.j && unit.health > 0,
      );

      if (enemy) {
        return enemy;
      }
    }

    return null;
  }

  private executeAiAttack(
    aiUnitIndex: number,
    aiUnits: TileUnit[],
    userUnits: TileUnit[],
    target: TileUnit,
    callbacks: AiTurnCallbacks,
  ): void {
    const aiUnit = aiUnits[aiUnitIndex];
    const targetIndex = this.unitService.findUnitIndex(userUnits, target);

    // Choose skill — may be undefined if all skills are passive or on cooldown
    const skill = this.chooseSkill(aiUnit);

    if (!skill) {
      aiUnits[aiUnitIndex] = { ...aiUnit, canAttack: false };

      return;
    }

    // Delegate the full attack logic to the composition (same path as player attacks)
    const updatedAttacker = callbacks.executeAttack(
      aiUnitIndex,
      aiUnits,
      targetIndex,
      userUnits,
      skill,
    );

    aiUnits[aiUnitIndex] = {
      ...updatedAttacker,
      canAttack: false,
    };
  }
}
