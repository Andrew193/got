import { AbstractGameFieldComposition } from '../abstract-game-field/abstract-game-field-composition';
import { GameFieldService } from '../../../services/game-related/game-field/game-field.service';
import { UnitService } from '../../../services/unit/unit.service';
import { EffectsService } from '../../../services/effects/effects.service';
import { GameService } from '../../../services/game-related/game-action/game.service';
import {
  GameResultsRedirectType,
  Position,
  Tile,
  TilesToHighlight,
  TileUnit,
} from '../../../models/field.model';
import { createDeepCopy } from '../../../helpers';
import { Skill, TileUnitSkill } from '../../../models/units-related/skill.model';
import { BATTLE_SPEED, EffectsValues } from '../../../constants';
import { ChangeDetectorRef, OutputEmitterRef } from '@angular/core';
import { Store } from '@ngrx/store';

interface ExecuteActionParams {
  attackerTeam: TileUnit[];
  defenderTeam: TileUnit[];
  attackerIndex: number;
  defenderIndex: number;
  skill: Skill;
  isAiMove?: boolean;
  findSkillIndex: number | ((skills: Skill[], skill: Skill) => number);
  getTargetTile?: (defenderTeam: TileUnit[], defenderIndex: number) => TileUnit | null;
}

export class BasicGameFieldComposition extends AbstractGameFieldComposition {
  constructor(
    private fieldService: GameFieldService,
    private unitService: UnitService,
    private eS: EffectsService,
    private gameActionService: GameService,
    override store: Store<any>,
  ) {
    super(fieldService, unitService, eS, store);
  }

  battleEndFlag!: OutputEmitterRef<Parameters<GameResultsRedirectType>>;
  cdRef!: ChangeDetectorRef;

  skipFightOnlyStandaloneMode(
    userUnits: TileUnit[],
    aiUnits: TileUnit[],
    battleEndFlag: OutputEmitterRef<Parameters<GameResultsRedirectType>>,
    gameResultsRedirect: GameResultsRedirectType,
    cdRef: ChangeDetectorRef,
  ) {
    this.userUnits = userUnits;
    this.aiUnits = aiUnits;
    this.battleEndFlag = battleEndFlag;
    this.recreateGameConfig(this.userUnits, this.aiUnits);
    this.gameResultsRedirect = gameResultsRedirect;
    this.cdRef = cdRef;

    this.startAutoFight(true);
  }

  private executeAction(params: ExecuteActionParams) {
    const {
      attackerTeam,
      defenderTeam,
      attackerIndex,
      defenderIndex,
      skill,
      isAiMove = false,
      findSkillIndex,
      getTargetTile,
    } = params;

    if (skill.addBuffsBeforeAttack) {
      this.addBuffToUnit(attackerTeam, attackerIndex, skill);
    }

    if (skill.activateDebuffs?.length) {
      defenderTeam[defenderIndex] = this.checkEffects(
        structuredClone(defenderTeam[defenderIndex]),
        true,
        skill.activateDebuffs,
      );
    }

    if (skill.extendsBuffs?.length) {
      GameService.extendEffectDurationBy = 1;

      attackerTeam.forEach((attackerTeamUnit, index) => {
        if (attackerTeamUnit.name !== attackerTeam[attackerIndex].name) {
          attackerTeam[index] = this.checkEffects(
            structuredClone(attackerTeamUnit),
            true,
            skill.extendsBuffs as EffectsValues[],
          );
        }
      });

      GameService.extendEffectDurationBy = 0;
    }

    let attacker = attackerTeam[attackerIndex];

    if (attacker.healer && skill.healAll) {
      this.makeHealerMove(null, skill, attacker, attackerTeam);
    }

    const canAttack = !attacker.healer || !attacker.onlyHealer;

    if (canAttack) {
      this.makeAttackMove(defenderIndex, defenderTeam, attacker, skill);

      const tile =
        (getTargetTile && getTargetTile(defenderTeam, defenderIndex)) ??
        (defenderTeam[defenderIndex] as unknown as TileUnit);

      this.universalRangeAttack(skill, tile, defenderTeam, isAiMove, attacker);
    }

    if (!skill.addBuffsBeforeAttack) {
      this.addBuffToUnit(
        attackerTeam,
        attackerIndex,
        !this.autoFight
          ? {
              ...skill,
              buffs: (skill.buffs || []).map(el => ({ ...el, duration: el.duration + 1 })),
            }
          : skill,
      );
    }

    attacker = attackerTeam[attackerIndex];

    if (isAiMove) {
      attackerTeam[attackerIndex] = attacker;
    }

    const idx =
      typeof findSkillIndex === 'number' ? findSkillIndex : findSkillIndex(attacker.skills, skill);

    const canAddEffects = !(attacker.rage > defenderTeam[defenderIndex].willpower);

    const skills = this.updateSkillsCooldown(
      createDeepCopy(attacker.skills),
      defenderTeam,
      defenderIndex,
      idx,
      skill,
      isAiMove,
      canAddEffects,
    );

    return {
      skills,
      attacker,
      defender: defenderTeam[defenderIndex],
    };
  }

  attack(skill: Skill) {
    this.skillsInAttackBar = this.gameActionService.selectSkillsAndRecountCooldown(
      this.userUnits,
      this.selectedEntity as TileUnit,
    );
    const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
    const user = this.userUnits[userIndex];
    const skillIndex = this.unitService.findSkillIndex(user.skills, skill);

    const { skills: updatedSkills, attacker } = this.executeAction({
      attackerTeam: this.userUnits,
      defenderTeam: this.aiUnits,
      attackerIndex: userIndex,
      defenderIndex: enemyIndex,
      skill,
      isAiMove: false,
      findSkillIndex: skillIndex,
      getTargetTile: () => this.clickedEnemy as TileUnit,
    });

    this.userUnits[userIndex] = {
      ...(attacker || user),
      canAttack: false,
      canMove: false,
      skills: updatedSkills,
    };
    this.over = this.gameActionService.checkCloseFight(
      this.userUnits,
      this.aiUnits,
      this.gameResultsRedirect,
      this.battleEndFlag,
    );
    this.updateGridUnits([...this.aiUnits, ...this.userUnits]);
    this.dropEnemy();
    this.checkAiMoves(true);
  }

  updateSkillsCooldown(
    originalSkills: TileUnitSkill[],
    units: TileUnit[],
    unitIndex: number,
    skillIndex: number,
    skill: TileUnitSkill,
    addTurn = false,
    ignoreEffect = false,
  ) {
    const skills = createDeepCopy(originalSkills);

    if (!ignoreEffect) {
      this.addEffectToUnit(units, unitIndex, skill);
    }

    skills[skillIndex] = {
      ...skills[skillIndex],
      remainingCooldown: skills[skillIndex].cooldown
        ? addTurn
          ? skills[skillIndex].cooldown + 1
          : skills[skillIndex].cooldown
        : 0,
    };

    return skills;
  }

  addEffectToUnit(
    units: TileUnit[],
    unitIndex: number,
    skill: TileUnitSkill,
    addRangeEffects = false,
  ) {
    units[unitIndex] = this.unitService.addEffectToUnit(
      units,
      unitIndex,
      skill,
      addRangeEffects,
      this.eS.getEffectsWithIgnoreFilter,
    );
  }

  addBuffToUnit(units: TileUnit[], unitIndex: number, skill: TileUnitSkill) {
    units[unitIndex] = this.unitService.addBuffToUnit(units, unitIndex, skill);
  }

  updateGridUnits(unitsArray: TileUnit[]) {
    this.gameConfig = this.unitService.updateGridUnits(unitsArray, this.gameConfig);
  }

  dropEnemy() {
    this.dropEnemyState();
  }

  highlightMakeMove(e: {
    entity: TileUnit;
    event?: MouseEvent;
    callback: (tiles: TilesToHighlight[]) => void;
  }) {
    const entity = structuredClone(e.entity);
    let tilesToHighlight: TilesToHighlight[] = [];
    const event = e.event;

    if (this.showAttackBar) this.dropEnemy();

    event?.stopPropagation();

    const isSelected = entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity?.y;

    const canInteract = entity?.canMove || entity?.canAttack || !entity.user;

    if (isSelected || !canInteract) {
      this.ignoreMove = true;
      this.selectedEntity = null;
      e.callback(tilesToHighlight);

      return;
    }

    let possibleTargetsInAttackRadius;

    if (this.selectedEntity?.user) {
      possibleTargetsInAttackRadius = this.showPossibleMoves(
        this.unitService.getPositionFromCoordinate(this.selectedEntity),
        this.selectedEntity.attackRange,
        true,
      );
    }

    this.clickedEnemy = this.selectedEntity?.user ? this.checkAndShowAttackBar(entity) : null;

    if (possibleTargetsInAttackRadius) {
      const canAttack = possibleTargetsInAttackRadius.some(
        target => target.i === this.clickedEnemy?.x && target.j === this.clickedEnemy?.y,
      );

      if (!canAttack) this.clickedEnemy = null;
    }

    this.showAttackBar = !!this.clickedEnemy;

    if (!this.showAttackBar) {
      this.ignoreMove = false;
      this.selectedEntity = entity;
      this.possibleMoves = this.getPossibleMoves(entity);

      if (entity.attackRange >= entity.canCross) {
        this.possibleAttackMoves = this.getPossibleMoves({
          ...entity,
          canCross: entity.attackRange,
        });
      }

      if (!entity?.canMove || !entity?.canCross) {
        const enemyMoves = this.possibleMoves
          .map(move => this.aiUnits.find(ai => ai.x === move.i && ai.y === move.j))
          .filter(Boolean);

        if (enemyMoves.length) {
          this.possibleMoves = enemyMoves
            .map((enemy: any) =>
              enemy.health ? this.unitService.getPositionFromCoordinate(enemy) : undefined,
            )
            .filter(Boolean) as Position[];
        } else {
          this.possibleMoves = [];
          const idx = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);

          this.userUnits[idx] = {
            ...this.selectedEntity,
            x: entity.x,
            y: entity.y,
            canMove: false,
            canAttack: false,
          };
          this.updateGridUnits(this.userUnits);
        }
      }

      tilesToHighlight = this.highlightCells(this.possibleMoves, entity.user ? 'green-b' : 'red-b');
    }

    if (this.showAttackBar) {
      this.skillsInAttackBar = (this.selectedEntity as TileUnit).skills;
    }

    e.callback(tilesToHighlight);
  }

  getPossibleMoves(entity: TileUnit) {
    const canCross = this.gameActionService.getCanCross(entity);

    return this.showPossibleMoves(
      this.unitService.getPositionFromCoordinate(entity),
      canCross,
      true,
    ).filter(position => {
      return this.fieldService.canReachPosition(
        this.fieldService.getGridFromField(this.gameConfig),
        {
          i: this.selectedEntity?.x || 0,
          j: this.selectedEntity?.y || 0,
        },
        position,
      );
    });
  }

  getEnemyWhenCannotMove(unit: TileUnit, arrayOfTargets: TileUnit[]) {
    return this.getPossibleMoves(unit).find(move =>
      arrayOfTargets.some(
        aiUnit => aiUnit.x === move.i && aiUnit.y === move.j && aiUnit.health > 0,
      ),
    );
  }

  moveEntity(tile: Tile) {
    //Can not move AI units and dead units
    this.ignoreMove =
      (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) ||
      this.showAttackBar ||
      tile.entity !== undefined;
    if (
      this.selectedEntity?.user &&
      this.possibleMoves.length &&
      !this.ignoreMove &&
      !!this.possibleMoves.find(move => move.i === tile.x && move.j === tile.y)
    ) {
      //User's unit can not move (already made a move)
      const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);

      this.userUnits[userIndex] = {
        ...this.selectedEntity,
        x: tile.x,
        y: tile.y,
        canMove: false,
      };
      //Look for targets to attack
      let enemyWhenCannotMove = this.getEnemyWhenCannotMove(
        this.userUnits[userIndex],
        this.aiUnits,
      );

      if (enemyWhenCannotMove) {
        const enemyIndex = this.unitService.findUnitIndex(
          this.aiUnits,
          this.unitService.getCoordinateFromPosition(enemyWhenCannotMove),
        );

        enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
      }

      if (!enemyWhenCannotMove) {
        this.userUnits[userIndex] = this.gameActionService.recountCooldownForUnit({
          ...this.userUnits[userIndex],
          canAttack: false,
        });
      }

      this.updateGameFieldTile(tile.x, tile.y, createDeepCopy(this.userUnits[userIndex]));
      this.updateGameFieldTile(this.selectedEntity?.x, this.selectedEntity?.y, undefined, true);
      this.selectedEntity = null;
    }

    this.selectedEntity = null;
    this.possibleMoves = [];
    this.checkAiMoves(true);
  }

  checkAiMoves(aiMove: boolean) {
    const userFinishedTurn = this.userUnits.every(
      userHero => (!userHero.canMove && !userHero.canAttack) || !userHero.health,
    );

    if (userFinishedTurn && !this.gameActionService.isDead(this.aiUnits)) {
      this._turnCount.next(this.turnCount + 1);
      if (this.battleMode) {
        this.dropEnemy();
        this.turnUser = false;
        this.attackUser(aiMove);
      } else {
        this.turnUser = true;
        this.finishAiTurn(true);
      }
    }
  }

  startAutoFight(fastFight = false, oneTick = false) {
    this.autoFight = true;

    const tick = () => {
      this.attackUser(false);
      this.fieldService.resetMoveAndAttack(this.userUnits, false);
      this.checkAiMoves(true);

      if (this.checkAutoFightEnd() || oneTick) {
        this.autoFight = false;
        this.cdRef.markForCheck();

        return true;
      }

      return false;
    };

    if (fastFight) {
      for (let i = 0; ; i++) {
        if (tick()) break;
      }
    } else {
      const interval = setInterval(() => {
        tick() && clearInterval(interval);
      }, BATTLE_SPEED);
    }
  }

  checkAutoFightEnd() {
    return (
      this.gameActionService.isDead(this.aiUnits) || this.gameActionService.isDead(this.userUnits)
    );
  }

  getAiLeadingUnits(aiMove: boolean) {
    return this.gameActionService.getAiLeadingUnits(aiMove, this.aiUnits, this.userUnits);
  }

  getUserLeadingUnits(aiMove: boolean) {
    return this.gameActionService.getUserLeadingUnits(aiMove, this.aiUnits, this.userUnits);
  }

  finishAiTurn(aiMove: boolean) {
    const userUnits = this.getUserLeadingUnits(aiMove);
    const aiUnits = this.getAiLeadingUnits(aiMove);

    // Reset move/attack flags
    this.fieldService.resetMoveAndAttack([aiUnits, userUnits]);

    // Apply debuff damage
    for (let i = 0; i < userUnits.length; i++) {
      userUnits[i] = this.checkEffects(structuredClone(userUnits[i]), true, null);
    }

    if (!this.autoFight) {
      for (let i = 0; i < aiUnits.length; i++) {
        aiUnits[i] = this.checkEffects(structuredClone(aiUnits[i]), !aiMove, null);
      }

      // Check passive skills if AI just moved
      if (aiMove) {
        this.gameActionService.checkPassiveSkills(userUnits);
      }
    }

    // Update game state
    this.updateField(userUnits, aiUnits);
    this.turnUser = true;
    this.over = this.gameActionService.checkCloseFight(
      userUnits,
      aiUnits,
      this.gameResultsRedirect,
      this.battleEndFlag,
    );
  }

  updateField<T extends ReturnType<typeof this.getAiLeadingUnits>>(userUnits: T, aiUnits: T) {
    this.gameConfig = this.fieldService.getGameField(
      userUnits,
      aiUnits,
      this.fieldService.getDefaultGameField(),
    );
  }

  attackUser(aiMove = true) {
    const aiUnits = this.getAiLeadingUnits(aiMove);
    const userUnits = this.getUserLeadingUnits(aiMove);

    const moveAiUnit = (index: number, aiUnit: TileUnit, userUnit: TileUnit) => {
      const aiPos = this.unitService.getPositionFromCoordinate(aiUnit);
      const userPos = this.unitService.getPositionFromCoordinate(userUnit);

      //this.updateField(userUnits, aiUnits);
      const path = this.fieldService.getShortestPathCover(
        this.fieldService.getGridFromField(this.gameConfig),
        aiPos,
        userPos,
        true,
        false,
        true,
      );
      const moveTo = this.gameActionService.getCanGetToPosition(aiUnit, path, userPos);

      aiUnits[index] = {
        ...aiUnits[index],
        canMove: false,
        x: moveTo.i,
        y: moveTo.j,
      };
    };

    const updateAiAfterAttack = (index: number, updatedSkills?: TileUnitSkill[]) => {
      aiUnits[index] = {
        ...aiUnits[index],
        canAttack: false,
        skills: updatedSkills ?? aiUnits[index].skills,
      };
      //this.updateField(userUnits, aiUnits);
    };

    const performAttack = (userIndex: number, aiSkill: TileUnitSkill, index: number) => {
      const { skills: updatedSkills } = this.executeAction({
        attackerTeam: aiUnits,
        defenderTeam: userUnits,
        attackerIndex: index,
        defenderIndex: userIndex,
        skill: aiSkill,
        isAiMove: aiMove,
        findSkillIndex: (skills, s) => this.unitService.findSkillIndex(skills, s),
        getTargetTile: (defTeam, defIdx) => defTeam[defIdx] as unknown as TileUnit,
      });

      updateAiAfterAttack(index, updatedSkills);
    };

    const makeAiMove = (aiUnit: TileUnit, index: number) => {
      if (!aiUnit.health || !aiUnit.canMove) return;

      const orderedTargets = this.unitService.orderUnitsByDistance(aiUnit, userUnits) as TileUnit[];

      for (const userUnit of orderedTargets) {
        if (!userUnit.health) continue;

        moveAiUnit(index, aiUnit, userUnit);

        const enemyPosition = this.getEnemyWhenCannotMove(aiUnits[index], userUnits);

        if (enemyPosition) {
          const userIndex = this.unitService.findUnitIndex(
            userUnits,
            this.unitService.getCoordinateFromPosition(enemyPosition),
          );
          const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);

          if (aiSkill) {
            performAttack(userIndex, aiSkill, index);

            return;
          }
        }

        updateAiAfterAttack(index); // no valid enemy or skill

        return;
      }
    };

    // Apply passive buffs to all AI units
    this.gameActionService.checkPassiveSkills(aiUnits);

    for (let i = 0; i < aiUnits.length; i++) {
      this.gameActionService.aiUnitAttack(i, aiUnits, makeAiMove.bind(this));
    }

    // Finish AI turn — same behavior
    this.finishAiTurn(aiMove);
  }

  checkEffects(unit: TileUnit, decreaseRestoreCooldown = true, workWith: EffectsValues[] | null) {
    const response = this.gameActionService.checkEffects(
      unit,
      !this.autoFight ? true : decreaseRestoreCooldown,
      this.battleMode,
      workWith,
    );

    unit = response.unit;

    return unit;
  }

  highlightCells(path: Position[], className: string) {
    return this.highlightCellsInnerFunction(path, className);
  }

  finishTurn() {
    this.userUnits = this.userUnits.map(user =>
      this.gameActionService.recountCooldownForUnit({
        ...user,
        canMove: false,
        canAttack: false,
      }),
    );
    this.updateGridUnits(this.userUnits);
    this.checkAiMoves(true);
  }
}
