import {Component} from '@angular/core';
import {GameFieldService} from "../../../services/game-field/game-field.service";
import {UnitService} from "../../../services/unit/unit.service";
import {EffectsService} from "../../../services/effects/effects.service";
import {GameService} from "../../../services/game-action/game.service";
import {GameLoggerService} from "../../../services/game-logger/logger.service";
import {Skill} from "../../../models/skill.model";
import {Unit} from "../../../models/unit.model";
import {createDeepCopy} from "../../../helpers";
import {AbstractGameFieldComponent} from "../abstract-game-field/abstract-game-field.component";
import {BATTLE_SPEED} from "../../../constants";
import {Position, Tile, TilesToHighlight} from "../../../models/field.model";

@Component({
    selector: 'basic-game-field',
    template: '',
    imports: []
})
export abstract class BasicGameFieldComponent extends AbstractGameFieldComponent {
  constructor(private fieldService: GameFieldService,
              private unitService: UnitService,
              private eS: EffectsService,
              private gameActionService: GameService,
              private gameLoggerService: GameLoggerService) {
    super(fieldService, gameLoggerService, unitService, eS);
  }

  attack(skill: Skill) {
    this.skillsInAttackBar = this.gameActionService.selectSkillsAndRecountCooldown(this.userUnits, this.selectedEntity as Unit);
    const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
    let user = this.userUnits[userIndex];
    const skillIndex = this.unitService.findSkillIndex(user.skills, skill);
    this.addBuffToUnit(this.userUnits, userIndex, skill);

    if (skill.addBuffsBeforeAttack) {
      user = this.userUnits[userIndex];
    }

    if (user.healer && skill.healAll) {
      this.makeHealerMove(null, skill, user, this.userUnits);
    }
    if (!user.healer || (user.healer && !user.onlyHealer)) {
      this.makeAttackMove(enemyIndex, this.eS.getBoostedParameterCover(user, user.effects) * skill.dmgM, this.eS.getBoostedParameterCover(this.aiUnits[enemyIndex], this.aiUnits[enemyIndex].effects), this.aiUnits, user, skill)
      this.universalRangeAttack(skill, this.clickedEnemy as Unit, this.aiUnits, false, user)
    }

    user = this.userUnits[userIndex];

    const skills = this.updateSkillsCooldown(createDeepCopy(user.skills), this.aiUnits, enemyIndex, skillIndex, skill, false, !(user.rage > this.aiUnits[enemyIndex].willpower));
    this.userUnits[userIndex] = {...user, canAttack: false, canMove: false, skills: skills};
    this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits, this.gameResultsRedirect);
    this.updateGridUnits([...this.aiUnits, ...this.userUnits]);
    this.dropEnemy();
    this.checkAiMoves();
  }

  updateSkillsCooldown(originalSkills: Skill[], units: Unit[], unitIndex: number, skillIndex: number, skill: Skill, addTurn = false, ignoreEffect = false) {
    const skills = createDeepCopy(originalSkills);
    if (!ignoreEffect) {
      this.addEffectToUnit(units, unitIndex, skill);
    }
    skills[skillIndex] = {
      ...skills[skillIndex],
      remainingCooldown: skills[skillIndex].cooldown ? addTurn ? skills[skillIndex].cooldown + 1 : skills[skillIndex].cooldown : 0
    }
    return skills;
  }

  addEffectToUnit(units: Unit[], unitIndex: number, skill: Skill, addRangeEffects = false) {
    units[unitIndex] = this.unitService.addEffectToUnit(units, unitIndex, skill, addRangeEffects, this.eS.getEffectsWithIgnoreFilter)
  }

  addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill) {
    units[unitIndex] = this.unitService.addBuffToUnit(units, unitIndex, skill);
  }

  updateGridUnits(unitsArray: Unit[]) {
    this.gameConfig = this.unitService.updateGridUnits(unitsArray, this.gameConfig);
  }

  dropEnemy() {
    this.dropEnemyState();
  }

  highlightMakeMove(e: { entity: Unit, event?: MouseEvent, callback: (tiles: TilesToHighlight[]) => void }) {
    // ORIGINAL LOGIC
    // highlightMakeMove(e: { entity: Unit, event?: MouseEvent, callback: (tiles: TilesToHighlight[]) => void }) {
    //   const {entity, event} = e;
    //   if (this.showAttackBar) {
    //     this.dropEnemy();
    //   }
    //
    //   event?.stopPropagation();
    //   if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y) && (entity?.canMove || entity?.canAttack || entity.user === false)) {
    //
    //     let possibleTargetsInAttackRadius;
    //     if (this.selectedEntity && this.selectedEntity.user) {
    //       possibleTargetsInAttackRadius = this.showPossibleMoves(this.unitService.getPositionFromUnit(this.selectedEntity), this.selectedEntity.attackRange, true)
    //     }
    //
    //     this.clickedEnemy = this.selectedEntity?.user ? this.checkAndShowAttackBar(entity) : null;
    //     if (possibleTargetsInAttackRadius) {
    //       const canAttackThisTargetFromRange = possibleTargetsInAttackRadius.find((possibleTarget) => possibleTarget.i === this.clickedEnemy?.x && possibleTarget.j === this.clickedEnemy?.y)
    //       this.clickedEnemy = canAttackThisTargetFromRange ? this.clickedEnemy : null;
    //     }
    //     this.showAttackBar = !!this.clickedEnemy;
    //
    //     if (!this.showAttackBar) {
    //       this.ignoreMove = false;
    //       this.selectedEntity = entity;
    //       this.possibleMoves = this.getPossibleMoves(entity);
    //
    //       if (entity.attackRange >= entity.canCross && !entity.healer) {
    //         this.possibleAttackMoves = this.getPossibleMoves({...entity, canCross: entity.attackRange})
    //       } else if (entity.healer) {
    //         //Only healers (do not deal dmg)
    //         this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
    //       }
    //
    //       if (!entity?.canMove || !entity?.canCross) {
    //         let enemyWhenCannotMove: any[] = this.possibleMoves.filter((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
    //         if (enemyWhenCannotMove.length) {
    //           const enemyIndexList = [];
    //           for (let i = 0; i < enemyWhenCannotMove.length; i++) {
    //             const enemy = enemyWhenCannotMove[i]
    //             const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getUnitFromPosition(enemy));
    //             enemyIndexList.push(enemyIndex);
    //           }
    //
    //           enemyWhenCannotMove = enemyIndexList.map((enemyIndex) => {
    //             return this.aiUnits[enemyIndex].health ? this.unitService.getPositionFromUnit(this.aiUnits[enemyIndex]) : undefined
    //           })
    //         }
    //         if (enemyWhenCannotMove.length) {
    //           this.possibleMoves = [...enemyWhenCannotMove]
    //         } else {
    //           this.possibleMoves = [];
    //           this.userUnits[this.unitService.findUnitIndex(this.userUnits, this.selectedEntity)] = {
    //             ...this.selectedEntity,
    //             x: entity.x,
    //             y: entity.y,
    //             canMove: false,
    //             canAttack: false
    //           };
    //           console.log('updateGridUnits')
    //           this.updateGridUnits(this.userUnits);
    //         }
    //       }
    //
    //       this.highlightCells(this.possibleMoves, entity.user ? "green-b" : "red-b");
    //     }
    //
    //     if (this.showAttackBar) {
    //       this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
    //     }
    //   } else {
    //     this.ignoreMove = true;
    //     this.selectedEntity = null;
    //   }
    //
    //   e.callback(this.tilesToHighlight);
    // }
    const { entity, event } = e;

    if (this.showAttackBar) this.dropEnemy();

    event?.stopPropagation();

    const isSelected =
      entity.x === this.selectedEntity?.x &&
      entity.y === this.selectedEntity?.y;

    const canInteract = entity?.canMove || entity?.canAttack || !entity.user;
    if (isSelected || !canInteract) {
      this.ignoreMove = true;
      this.selectedEntity = null;
      e.callback(this.tilesToHighlight);
      return;
    }

    let possibleTargetsInAttackRadius;
    if (this.selectedEntity?.user) {
      possibleTargetsInAttackRadius = this.showPossibleMoves(
        this.unitService.getPositionFromCoordinate(this.selectedEntity),
        this.selectedEntity.attackRange,
        true
      );
    }

    this.clickedEnemy = this.selectedEntity?.user
      ? this.checkAndShowAttackBar(entity)
      : null;

    if (possibleTargetsInAttackRadius) {
      const canAttack = possibleTargetsInAttackRadius.some(
        (target) =>
          target.i === this.clickedEnemy?.x &&
          target.j === this.clickedEnemy?.y
      );
      if (!canAttack) this.clickedEnemy = null;
    }

    this.showAttackBar = !!this.clickedEnemy;

    if (!this.showAttackBar) {
      this.ignoreMove = false;
      this.selectedEntity = entity;
      this.possibleMoves = this.getPossibleMoves(entity);

      if (entity.attackRange >= entity.canCross && !entity.healer) {
        this.possibleAttackMoves = this.getPossibleMoves({
          ...entity,
          canCross: entity.attackRange,
        });
      } else if (entity.healer) {
        this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
      }

      if (!entity?.canMove || !entity?.canCross) {
        const enemyMoves = this.possibleMoves
          .map((move) => this.aiUnits.find((ai) => ai.x === move.i && ai.y === move.j)).filter(Boolean);
        if (enemyMoves.length) {
          this.possibleMoves = enemyMoves
            .map((enemy: any) => enemy.health ? this.unitService.getPositionFromCoordinate(enemy) : undefined).filter(Boolean) as Position[];
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

      this.highlightCells(this.possibleMoves, entity.user ? 'green-b' : 'red-b');
    }

    if (this.showAttackBar) {
      this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
    }

    e.callback(this.tilesToHighlight);
  }

  getPossibleMoves(entity: Unit) {
    //Original code:
    //     return this.showPossibleMoves(this.unitService.getPositionFromUnit(entity), entity?.canMove ? entity.canCross || 1 : entity.attackRange, !entity?.canMove);
    const canCross = this.gameActionService.getCanCross(entity);
    return this.showPossibleMoves(this.unitService.getPositionFromCoordinate(entity), canCross, true)
      .filter((position) => {
        return this.fieldService.canReachPosition(this.fieldService.getGridFromField(this.gameConfig), {
          i: this.selectedEntity?.x || 0,
          j: this.selectedEntity?.y || 0
        }, position)
      })
  }

  getEnemyWhenCannotMove(unit: Unit, arrayOfTargets: Unit[]) {
    return this.getPossibleMoves(unit).find((move) => arrayOfTargets.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j && aiUnit.health > 0));
  }

  moveEntity(tile: Tile) {
    //Can not move AI units and dead units
    this.ignoreMove = (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) || this.showAttackBar || tile.entity !== undefined
    if (this.selectedEntity?.user && this.possibleMoves.length && !this.ignoreMove && !!this.possibleMoves.find((move) => move.i === tile.x && move.j === tile.y)) {
      //User's unit can not move (already made a move)
      const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
      this.userUnits[userIndex] = {...this.selectedEntity, x: tile.x, y: tile.y, canMove: false};
      //Look for targets to attack
      let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.userUnits[userIndex], this.aiUnits)
      if (enemyWhenCannotMove) {
        const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getCoordinateFromPosition(enemyWhenCannotMove));
        enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
      }
      if (!enemyWhenCannotMove) {
        this.userUnits[userIndex] = this.gameActionService.recountCooldownForUnit({
          ...this.userUnits[userIndex],
          canAttack: false
        })
      }

      this.updateGameFieldTile(tile.x, tile.y, createDeepCopy(this.userUnits[userIndex]))
      this.updateGameFieldTile(this.selectedEntity?.x, this.selectedEntity?.y, undefined, true)
      this.selectedEntity = null;
    }
    this.selectedEntity = null;
    this.possibleMoves = [];
    this.checkAiMoves();
  }

  checkAiMoves(aiMove: boolean = true) {
    const userFinishedTurn = this.userUnits.every((userHero) => (!userHero.canMove && !userHero.canAttack) || !userHero.health);
    if (userFinishedTurn && !this.gameActionService.isDead(this.aiUnits)) {
      this._turnCount.next(this.turnCount + 1);
      if (this.battleMode) {
        this.dropEnemy();
        this.turnUser = false;
        this.attackUser(aiMove);
      } else {
        this.turnUser = true;
        this.finishAiTurn(true, [])
      }
    }
  }

  startAutoFight(fastFight = false, oneTick = false) {
    this.autoFight = true;
    const tick = () => {
      this.attackUser(false);
      this.fieldService.resetMoveAndAttack(this.userUnits, false);
      this.checkAiMoves();
      if (this.checkAutoFightEnd() || oneTick) {
        this.autoFight = false;
        return true;
      }
      return false;
    }

    if (fastFight) {
      for (let i = 0; ; i++) {
        if(tick()) break
      }
    } else {
      const interval = setInterval(() => {
        tick() && clearInterval(interval);
      }, BATTLE_SPEED)
    }
  }

  checkAutoFightEnd() {
    return this.gameActionService.isDead(this.aiUnits) || this.gameActionService.isDead(this.userUnits);
  }

  getAiLeadingUnits(aiMove: boolean) {
    return this.gameActionService.getAiLeadingUnits.bind(this)(aiMove);
  }

  getUserLeadingUnits(aiMove: boolean) {
    return this.gameActionService.getUserLeadingUnits.bind(this)(aiMove);
  }

  finishAiTurn(aiMove: boolean, usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[]) {
    // Original code:
    // finishAiTurn(aiMove: boolean, usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[]) {
    //   //Update AI and user units arrays (update on ui and grid)
    //   this.fieldService.resetMoveAndAttack([...this.getAiLeadingUnits(aiMove), ...this.getUserLeadingUnits(aiMove)]);
    //   //User's units take dmg from their debuffs
    //   for (let i = 0; i < this.getUserLeadingUnits(aiMove).length; i++) {
    //     this.getUserLeadingUnits(aiMove)[i] = this.checkDebuffs(this.getUserLeadingUnits(aiMove)[i], true, true);
    //   }
    //   usedAiSkills.forEach((config) => {
    //     const unitIndex = this.getUserLeadingUnits(aiMove).findIndex((user) => config.unit.x === user.x && config.unit.y === user.y)
    //     if (config.AI.rage > this.getUserLeadingUnits(aiMove)[unitIndex].willpower) {
    //       this.addEffectToUnit(this.getUserLeadingUnits(aiMove), unitIndex, config.skill)
    //     }
    //   })
    //
    //   if (aiMove && !this.autoFight) {
    //     this.gameActionService.checkPassiveSkills(this.getUserLeadingUnits(aiMove), this.log)
    //   }
    //
    //   this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
    //   this.turnUser = true;
    //   this.gameActionService.checkCloseFight(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.gameResultsRedirect);
    // }
    const userUnits = this.getUserLeadingUnits(aiMove);
    const aiUnits = this.getAiLeadingUnits(aiMove);

    // Reset move/attack flags
    this.fieldService.resetMoveAndAttack([aiUnits, userUnits]);

    // Apply debuff damage
    for (let i = 0; i < userUnits.length; i++) {
      userUnits[i] = this.checkDebuffs(userUnits[i], true, true);
    }

    // Apply effects from used AI skills
    usedAiSkills.forEach(({ skill, unit, AI }) => {
      const targetIndex = userUnits.findIndex(
        (u) => u.x === unit.x && u.y === unit.y
      );
      if (targetIndex !== -1 && AI.rage > userUnits[targetIndex].willpower) {
        this.addEffectToUnit(userUnits, targetIndex, skill);
      }
    });

    // Check passive skills if AI just moved
    if (aiMove && !this.autoFight) {
      this.gameActionService.checkPassiveSkills(userUnits, this.log);
    }

    // Update game state
    this.gameConfig = this.fieldService.getGameField(
      userUnits,
      aiUnits,
      this.fieldService.getDefaultGameField()
    );
    this.turnUser = true;
    this.gameActionService.checkCloseFight(userUnits, aiUnits, this.gameResultsRedirect);
  }

  attackUser(aiMove = true) {
    const usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[] = [];
    const aiUnits = this.getAiLeadingUnits(aiMove);
    const userUnits = this.getUserLeadingUnits(aiMove);

    const updateField = () => {
      this.gameConfig = this.fieldService.getGameField(userUnits, aiUnits, this.fieldService.getDefaultGameField());
    };

    const moveAiUnit = (index: number, aiUnit: Unit, userUnit: Unit) => {
      const aiPos = this.unitService.getPositionFromCoordinate(aiUnit);
      const userPos = this.unitService.getPositionFromCoordinate(userUnit);
      updateField();
      const path = this.fieldService.getShortestPathCover(
        this.fieldService.getGridFromField(this.gameConfig),
        aiPos, userPos, true, false, true
      );
      const moveTo = this.gameActionService.getCanGetToPosition(aiUnit, path, userPos);

      aiUnits[index] = {
        ...aiUnits[index],
        canMove: false,
        x: moveTo.i,
        y: moveTo.j,
      };
    };

    const updateAiAfterAttack = (index: number, updatedSkills?: Skill[]) => {
      aiUnits[index] = {
        ...aiUnits[index],
        canAttack: false,
        skills: updatedSkills ?? aiUnits[index].skills,
      };
      updateField();
    };

    const performAttack = (aiUnit: Unit, userIndex: number, aiSkill: Skill, index: number) => {
      this.addBuffToUnit(aiUnits, index, aiSkill);
      if (aiSkill.addBuffsBeforeAttack) {
        aiUnit = aiUnits[index];
      }

      if (aiUnit.healer && aiSkill.healAll) {
        this.makeHealerMove(null, aiSkill, aiUnit, aiUnits);
      }

      if (!aiUnit.healer || (aiUnit.healer && !aiUnit.onlyHealer)) {
        const userTarget = userUnits[userIndex];
        const dmg = this.eS.getBoostedParameterCover(aiUnit, aiUnit.effects) * aiSkill.dmgM;
        const defence = this.eS.getBoostedParameterCover(userTarget, userTarget.effects);
        this.makeAttackMove(userIndex, dmg, defence, userUnits, aiUnit, aiSkill);
        this.universalRangeAttack(aiSkill, userTarget, userUnits, aiMove, aiUnit);
      }

      const updatedSkills = this.updateSkillsCooldown(
        createDeepCopy(aiUnits[index].skills),
        userUnits,
        userIndex,
        this.unitService.findSkillIndex(aiUnit.skills, aiSkill),
        aiSkill,
        true,
        true
      );

      usedAiSkills.push({ skill: aiSkill, unit: userUnits[userIndex], AI: aiUnit });
      updateAiAfterAttack(index, updatedSkills);
    };

    const makeAiMove = (aiUnit: Unit, index: number) => {
      if (!aiUnit.health || !aiUnit.canMove) return;

      const orderedTargets = this.unitService.orderUnitsByDistance(aiUnit, userUnits) as Unit[];

      for (const userUnit of orderedTargets) {
        if (!userUnit.health) continue;

        moveAiUnit(index, aiUnit, userUnit);

        const enemyPosition = this.getEnemyWhenCannotMove(aiUnits[index], userUnits);
        if (enemyPosition) {
          const userIndex = this.unitService.findUnitIndex(userUnits, this.unitService.getCoordinateFromPosition(enemyPosition));
          const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
          if (aiSkill) {
            performAttack(aiUnit, userIndex, aiSkill, index);
            return;
          }
        }

        updateAiAfterAttack(index); // no valid enemy or skill
        return;
      }
    };

    // Apply passive buffs to all AI units
    this.gameActionService.checkPassiveSkills(aiUnits, this.log);

    for (let i = 0; i < aiUnits.length; i++) {
      this.gameActionService.aiUnitAttack(
        i,
        aiUnits,
        this.battleMode,
        makeAiMove.bind(this),
        this.log
      );
    }

    // Finish AI turn — same behavior
    this.finishAiTurn(aiMove, usedAiSkills);
  }

  checkDebuffs(unit: Unit, decreaseRestoreCooldown = true, canRestoreHealth: boolean) {
    const response = this.gameActionService.checkDebuffs(unit, decreaseRestoreCooldown, this.battleMode, canRestoreHealth);
    unit = response.unit;
    this.log.push(...response.log);
    return unit;
  }

  highlightCells(path: Position[], className: string) {
    this.tilesToHighlight = this.highlightCellsInnerFunction(path, className);
  }

  finishTurn() {
    this.userUnits = this.userUnits.map((user) => this.gameActionService.recountCooldownForUnit({
      ...user,
      canMove: false,
      canAttack: false
    }))
    this.updateGridUnits(this.userUnits);
    this.checkAiMoves();
  }
}
