import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BattleStateService } from '../battle-state/battle-state.service';
import { GameService } from '../game-action/game.service';
import { UnitService } from '../../unit/unit.service';
import { GameFieldService } from '../game-field/game-field.service';
import { EffectsService } from '../../effects/effects.service';
import { Position, Tile, TileUnit } from '../../../models/field.model';
import { TileUnitSkill } from '../../../models/units-related/skill.model';

export interface AiTurnCallbacks {
  makeAttackMove: (
    enemyIndex: number,
    dmgTaker: TileUnit[],
    attackDealer: TileUnit,
    skill: TileUnitSkill,
  ) => void;
  addEffectToUnit: (
    units: TileUnit[],
    unitIndex: number,
    skill: TileUnitSkill,
    addRangeEffects?: boolean,
  ) => void;
  universalRangeAttack: (
    skill: TileUnitSkill,
    clickedEnemy: TileUnit,
    enemiesArray: TileUnit[],
    userCheck: boolean,
    attacker: TileUnit,
  ) => void;
  updateSkillCooldowns: (skills: TileUnitSkill[], skill: TileUnitSkill) => TileUnitSkill[];
}

@Injectable({ providedIn: 'root' })
export class AiTurnService {
  private battleStateService = inject(BattleStateService);
  private gameService = inject(GameService);
  private unitService = inject(UnitService);
  private fieldService = inject(GameFieldService);
  private effectsService = inject(EffectsService);
  private store = inject(Store);

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

    // Choose skill
    const skill = this.chooseSkill(aiUnit);

    // Execute attack
    callbacks.makeAttackMove(targetIndex, userUnits, aiUnit, skill);

    // Apply range effects
    callbacks.universalRangeAttack(skill, target, userUnits, false, aiUnit);

    // Add debuffs if rage > willpower
    if (aiUnit.rage > userUnits[targetIndex].willpower) {
      callbacks.addEffectToUnit(userUnits, targetIndex, skill, false);
    }

    // Update skill cooldowns
    const updatedSkills = callbacks.updateSkillCooldowns(aiUnit.skills, skill);

    aiUnits[aiUnitIndex] = {
      ...aiUnit,
      skills: updatedSkills,
      canAttack: false,
    };
  }
}
