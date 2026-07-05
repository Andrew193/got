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
import { EffectsValues } from '../../../constants';
import { ChangeDetectorRef, OutputEmitterRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { BattleStateService } from '../../../services/game-related/battle-state/battle-state.service';
import { AutoFightService } from '../../../services/game-related/auto-fight/auto-fight.service';
import { BattleResultService } from '../../../services/game-related/battle-result/battle-result.service';
import { AiTurnService } from '../../../services/game-related/ai-turn/ai-turn.service';
import { PassiveAbilityService } from '../../../services/game-related/passive-ability/passive-ability.service';

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
  // Expose observables for template use
  readonly turnCount$ = this.battleStateS.turnCount$;
  readonly turnUser$ = this.battleStateS.turnUser$;

  constructor(
    private fieldService: GameFieldService,
    private unitService: UnitService,
    private eS: EffectsService,
    private gameActionService: GameService,
    protected override battleStateS: BattleStateService,
    protected autoFightS: AutoFightService,
    protected battleResultS: BattleResultService,
    protected aiTurnS: AiTurnService,
    private passiveAbilityS: PassiveAbilityService,
    override store: Store<any>,
  ) {
    super(fieldService, unitService, eS, battleStateS, store);
  }

  battleEndFlag!: OutputEmitterRef<Parameters<GameResultsRedirectType>>;
  cdRef!: ChangeDetectorRef;

  /** Game mode passed to BattleResultService for XP calculation (e.g. 'daily-boss', 'campaign', 'training'). */
  battleGameMode = 'training';

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

    const { blockBuffApplication } = this.passiveAbilityS.processBeforeAttack(defenderTeam);

    if (!blockBuffApplication && skill.addBuffsBeforeAttack) {
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
      GameService.extendEffectDurationBy = skill.extendsBuffsBy || 1;

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

    if (attacker.healer && skill.heal && skill.heal.healAll) {
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

    if (!blockBuffApplication && !skill.addBuffsBeforeAttack) {
      this.addBuffToUnit(attackerTeam, attackerIndex, skill);
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
    const result = this.battleResultS.checkBattleEnd(this.userUnits, this.aiUnits);

    if (result.battleEnded) {
      this.battleResultS.showBattleResult(
        result,
        this.aiUnits,
        this.gameResultsRedirect,
        this.battleEndFlag,
        this.battleGameMode,
      );
    }

    this.over = result.battleEnded;
    this.updateGridUnits([...this.aiUnits, ...this.userUnits]);
    this.dropEnemy();
    this.checkAiMoves();
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
    this.checkAiMoves();
  }

  checkAiMoves() {
    const userFinishedTurn = this.userUnits.every(
      userHero => (!userHero.canMove && !userHero.canAttack) || !userHero.health,
    );

    if (userFinishedTurn && !this.gameActionService.isDead(this.aiUnits)) {
      this.battleStateS.incrementTurnCount();

      // Check if max turns reached
      const result = this.battleResultS.checkBattleEnd(this.userUnits, this.aiUnits);

      if (result.battleEnded) {
        this.battleResultS.showBattleResult(
          result,
          this.aiUnits,
          this.gameResultsRedirect,
          this.battleEndFlag,
          this.battleGameMode,
        );

        return;
      }

      this.dropEnemy();
      this.battleStateS.setTurnUser(false);

      for (const hero of this.aiUnits.filter(u => u.health > 0)) {
        const result = this.passiveAbilityS.processRoundStart(hero, this.aiUnits, this.userUnits);

        this.aiUnits = [...result.allies];
        this.userUnits = [...result.enemies];
      }

      this.aiTurnS.executeAiTurn(this.aiUnits, this.userUnits, this.gameConfig, {
        executeAttack: (attackerIndex, attackerTeam, defenderIndex, defenderTeam, skill) => {
          const { attacker, skills } = this.executeAction({
            attackerTeam,
            defenderTeam,
            attackerIndex,
            defenderIndex,
            skill,
            isAiMove: true,
            findSkillIndex: (skills, s) => this.unitService.findSkillIndex(skills, s),
          });

          return { ...attacker, skills };
        },
      });

      this.finishHalfTurn(this.aiUnits, this.userUnits);
    }
  }

  startAutoFight(fastFight = false, oneTick = false) {
    this.autoFight = true;

    this.autoFightS.startAutoFight(fastFight, () => {
      const ended = this.executeAutoFightRound();

      if (ended || oneTick) {
        this.autoFight = false;
        this.cdRef.markForCheck();

        return true;
      }

      return false;
    });
  }

  checkAutoFightEnd() {
    return (
      this.gameActionService.isDead(this.aiUnits) ||
      this.gameActionService.isDead(this.userUnits) ||
      this.battleResultS.checkBattleEnd(this.userUnits, this.aiUnits).battleEnded
    );
  }

  private finishHalfTurn(actingTeam: TileUnit[], waitingTeam: TileUnit[]): void {
    // 1. Reset move/attack flags for both teams
    this.fieldService.resetMoveAndAttack([actingTeam, waitingTeam]);

    // 2. Tick effect durations for the acting team only
    for (let i = 0; i < actingTeam.length; i++) {
      actingTeam[i] = this.checkEffects(structuredClone(actingTeam[i]), true, null);
    }

    // 2a. In manual mode, also tick the waiting team once per round.
    // In auto-fight, finishHalfTurn is called twice per round (once per team),
    // so each team already ticks exactly once — no extra tick needed.
    if (!this.autoFight) {
      for (let i = 0; i < waitingTeam.length; i++) {
        waitingTeam[i] = this.checkEffects(structuredClone(waitingTeam[i]), true, null);
      }
    }

    // 3. Round-start passives for the waiting team only
    for (const hero of waitingTeam.filter(u => u.health > 0)) {
      const result = this.passiveAbilityS.processRoundStart(hero, waitingTeam, actingTeam);

      waitingTeam.splice(0, waitingTeam.length, ...result.allies);
      actingTeam.splice(0, actingTeam.length, ...result.enemies);
    }

    // 4. Passive restores/buffs for the waiting team
    this.gameActionService.checkPassiveSkills(waitingTeam);

    // 5. Recount skill cooldowns for the acting team only
    for (let i = 0; i < actingTeam.length; i++) {
      actingTeam[i] = this.gameActionService.recountCooldownForUnit(actingTeam[i]);
    }

    // 6. Rebuild gameConfig — determine which array maps to userUnits vs aiUnits
    const isActingPlayer = actingTeam === this.userUnits;
    const resolvedUserUnits = isActingPlayer ? actingTeam : waitingTeam;
    const resolvedAiUnits = isActingPlayer ? waitingTeam : actingTeam;

    this.updateField(resolvedUserUnits, resolvedAiUnits);

    // 7. Mark player's turn ready
    this.battleStateS.setTurnUser(true);

    // 8-10. Battle-end check
    const result = this.battleResultS.checkBattleEnd(this.userUnits, this.aiUnits);

    if (result.battleEnded) {
      this.battleResultS.showBattleResult(
        result,
        this.aiUnits,
        this.gameResultsRedirect,
        this.battleEndFlag,
        this.battleGameMode,
      );
    }

    this.over = result.battleEnded;
  }

  private executeAutoFightRound(): boolean {
    // ── Half-turn 1: player acts ──────────────────────────────────────────
    this.aiTurnS.executeAiTurn(this.userUnits, this.aiUnits, this.gameConfig, {
      executeAttack: (attackerIndex, attackerTeam, defenderIndex, defenderTeam, skill) => {
        const { attacker, skills } = this.executeAction({
          attackerTeam,
          defenderTeam,
          attackerIndex,
          defenderIndex,
          skill,
          isAiMove: false,
          findSkillIndex: (skills, s) => this.unitService.findSkillIndex(skills, s),
        });

        return { ...attacker, skills };
      },
    });

    this.finishHalfTurn(this.userUnits, this.aiUnits);

    if (this.checkAutoFightEnd()) {
      return true;
    }

    // Clear player move/attack flags before AI acts
    this.fieldService.resetMoveAndAttack(this.userUnits, false);

    // ── Half-turn 2: AI acts ──────────────────────────────────────────────
    this.aiTurnS.executeAiTurn(this.aiUnits, this.userUnits, this.gameConfig, {
      executeAttack: (attackerIndex, attackerTeam, defenderIndex, defenderTeam, skill) => {
        const { attacker, skills } = this.executeAction({
          attackerTeam,
          defenderTeam,
          attackerIndex,
          defenderIndex,
          skill,
          isAiMove: true,
          findSkillIndex: (skills, s) => this.unitService.findSkillIndex(skills, s),
        });

        return { ...attacker, skills };
      },
    });

    this.finishHalfTurn(this.aiUnits, this.userUnits);

    return this.checkAutoFightEnd();
  }

  updateField(userUnits: TileUnit[], aiUnits: TileUnit[]) {
    this.gameConfig = this.fieldService.getGameField(
      userUnits,
      aiUnits,
      this.fieldService.getDefaultGameField(),
    );
  }

  checkEffects(unit: TileUnit, decreaseRestoreCooldown = true, workWith: EffectsValues[] | null) {
    const response = this.gameActionService.checkEffects(
      unit,
      decreaseRestoreCooldown,
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
    this.checkAiMoves();
  }
}
