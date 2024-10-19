import {Component} from '@angular/core';
import {GameFieldService} from "../../../services/game-field/game-field.service";
import {UnitService} from "../../../services/unit/unit.service";
import {EffectsService} from "../../../services/effects/effects.service";
import {GameService} from "../../../services/game-action/game.service";
import {GameLoggerService} from "../../../services/game-logger/logger.service";
import {Skill} from "../../../models/skill.model";
import {Unit} from "../../../models/unit.model";
import {heroType} from "../../../services/heroes/heroes.service";
import {createDeepCopy} from "../../../helpers";
import {Position, Tile} from "../../../interface";
import {AbstractGameFieldComponent} from "../abstract-game-field/abstract-game-field.component";
import {BATTLE_SPEED} from "../../../constants";

@Component({
  selector: 'basic-game-field',
  standalone: true,
  template: '',
  imports: [],
})
export abstract class BasicGameFieldComponent extends AbstractGameFieldComponent {
  constructor(private fieldService: GameFieldService,
              private unitService: UnitService,
              private effectsService: EffectsService,
              private gameActionService: GameService,
              private gameLoggerService: GameLoggerService) {
    super(fieldService, gameLoggerService, unitService, effectsService);
  }

  attack(skill: Skill) {
    this.skillsInAttackBar = this.gameActionService.selectSkillsAndRecountCooldown(this.userUnits, this.selectedEntity as Unit);
    const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
    let user = this.userUnits[userIndex];
    const skillIndex = this.unitService.findSkillIndex(user.skills, skill);
    this.addBuffToUnit(this.userUnits, userIndex, skill)

    if(user.healer && skill.healAll) {
      this.makeHealerMove(null, skill, user, this.userUnits);
    }
    if(!user.healer || (user.healer && !user.onlyHealer)) {
      this.makeAttackMove(enemyIndex, this.effectsService.getBoostedParameterCover(user, user.effects) * skill.dmgM, this.effectsService.getBoostedParameterCover(this.aiUnits[enemyIndex], this.aiUnits[enemyIndex].effects), this.aiUnits, user, skill)
      this.universalRangeAttack(skill, this.clickedEnemy as Unit, this.aiUnits, false, user)
    }

    user = this.userUnits[userIndex];

    const skills = this.updateSkillsCooldown(createDeepCopy(user.skills), this.aiUnits, enemyIndex, skillIndex, skill, false, enemyIndex ? !(user.rage > this.aiUnits[enemyIndex].willpower) : false);
    this.userUnits[userIndex] = {...user, canAttack: false, canMove: false, skills: skills};
    this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits, this.gameResultsRedirect);
    this.updateGridUnits(this.aiUnits);
    this.updateGridUnits(this.userUnits);
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
    units[unitIndex] = this.unitService.addEffectToUnit(units, unitIndex, skill, addRangeEffects, this.effectsService.getEffectsWithIgnoreFilter)
  }

  addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill) {
    units[unitIndex] = this.unitService.addBuffToUnit(units, unitIndex, skill);
  }

  updateGridUnits(unitsArray: Unit[]) {
    this.gameConfig = this.unitService.updateGridUnits(unitsArray, this.gameConfig);
  }

  dropEnemy() {
    this.fieldService.unhighlightCells.apply(this);
    this.dropEnemyState();
  }

  highlightMakeMove(e: { entity: Unit, event?: MouseEvent }) {
    const {entity, event} = e;
    if (this.showAttackBar) {
      this.dropEnemy();
    }

    event?.stopPropagation();
    if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y) && (entity?.canMove || entity?.canAttack || entity.user === false)) {
      let possibleTargetsInAttackRadius;
      if (this.selectedEntity && this.selectedEntity.user) {
        possibleTargetsInAttackRadius = this.showPossibleMoves(this.unitService.getPositionFromUnit(this.selectedEntity), this.selectedEntity.attackRange, true)
      }

      this.clickedEnemy = this.selectedEntity?.user ? this.checkAndShowAttackBar(entity) : null;
      if (possibleTargetsInAttackRadius) {
        const canAttackThisTargetFromRange = possibleTargetsInAttackRadius.find((possibleTarget) => possibleTarget.i === this.clickedEnemy?.x && possibleTarget.j === this.clickedEnemy?.y)
        this.clickedEnemy = canAttackThisTargetFromRange ? this.clickedEnemy : null;
      }
      this.showAttackBar = !!this.clickedEnemy;

      if (!this.showAttackBar) {
        this.ignoreMove = false;
        this.selectedEntity = entity;
        this.possibleMoves = this.getPossibleMoves(entity);

        if (entity.attackRange >= entity.canCross && !entity.healer) {
          this.possibleAttackMoves = this.getPossibleMoves({...entity, canCross: entity.attackRange})
        } else if(entity.healer && false) {
          //Only healers (do not deal dmg)
          this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
        }

        if (!entity?.canMove || !entity?.canCross) {
          let enemyWhenCannotMove: any[] = this.possibleMoves.filter((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
          if (enemyWhenCannotMove.length) {
            const enemyIndexList = [];
            for (let i = 0; i < enemyWhenCannotMove.length; i++) {
              const enemy = enemyWhenCannotMove[i]
              const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getUnitFromPosition(enemy));
              enemyIndexList.push(enemyIndex);
            }

            enemyWhenCannotMove = enemyIndexList.map((enemyIndex) => {
              return this.aiUnits[enemyIndex].health ? this.unitService.getPositionFromUnit(this.aiUnits[enemyIndex]) : undefined
            })
          }
          if (enemyWhenCannotMove.length) {
            this.possibleMoves = [...enemyWhenCannotMove]
          } else {
            this.possibleMoves = [];
            this.userUnits[this.unitService.findUnitIndex(this.userUnits, this.selectedEntity)] = {
              ...this.selectedEntity,
              x: entity.x,
              y: entity.y,
              canMove: false,
              canAttack: false
            };
            this.updateGridUnits(this.userUnits);
          }
        }
        this.highlightCells(this.possibleMoves, entity.user ? "green-b" : "red-b")
      }

      if (this.showAttackBar) {
        this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
      }
    } else {
      this.ignoreMove = true;
      this.selectedEntity = null;
      this.fieldService.unhighlightCells.apply(this);
      this.possibleMoves = [];
    }
  }

  getPossibleMoves(entity: Unit) {
    return this.showPossibleMoves(this.unitService.getPositionFromUnit(entity), entity?.canMove ? entity.canCross || 1 : entity.attackRange, !entity?.canMove);
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
        const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getUnitFromPosition(enemyWhenCannotMove));
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
      this.fieldService.unhighlightCells.apply(this);
      this.selectedEntity = null;
    }
    this.checkAiMoves()
  }

  checkAiMoves(aiMove: boolean = true) {
    const userFinishedTurn = this.userUnits.every((userHero) => (!userHero.canMove && !userHero.canAttack) || !userHero.health);
    if (userFinishedTurn && !this.gameActionService.isDead(this.aiUnits)) {
      if (this.battleMode) {
        this.dropEnemy();
        this.turnUser = false;
        this.attackUser(aiMove);
      } else {
        this.turnUser = true;
        this.finishAiTurn(1, true, [])
      }
    }
  }

  startAutoFight(fastFight = false) {
    this.autoFight = true;
    if (fastFight) {
      for (let i = 0; ; i++) {
        this.attackUser(false);
        this.fieldService.resetMoveAndAttack(this.userUnits, false);
        this.checkAiMoves();
        if (this.checkAutoFightEnd()) {
          break;
        }
      }
    } else {
      const interval = setInterval(() => {
        this.attackUser(false);
        this.fieldService.resetMoveAndAttack(this.userUnits, false);
        this.checkAiMoves();
        if (this.checkAutoFightEnd()) {
          clearInterval(interval);
        }
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

  finishAiTurn(interval: any, aiMove: boolean, usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[]) {
    clearInterval(interval);
    //Update AI and user units arrays (update on ui and grid)
    this.fieldService.resetMoveAndAttack(this.getAiLeadingUnits(aiMove));
    this.fieldService.resetMoveAndAttack(this.getUserLeadingUnits(aiMove));
    //User's units take dmg from their debuffs
    for (let i = 0; i < this.getUserLeadingUnits(aiMove).length; i++) {
      this.getUserLeadingUnits(aiMove)[i] = this.checkDebuffs(this.getUserLeadingUnits(aiMove)[i]);
    }
    usedAiSkills.forEach((config) => {
      const unitIndex = this.getUserLeadingUnits(aiMove).findIndex((user) => config.unit.x === user.x && config.unit.y === user.y)
      if (config.AI.rage > this.getUserLeadingUnits(aiMove)[unitIndex].willpower) {
        this.addEffectToUnit(this.getUserLeadingUnits(aiMove), unitIndex, config.skill)
      }
    })

    if (aiMove && !this.autoFight) {
      this.gameActionService.checkPassiveSkills(this.getUserLeadingUnits(aiMove), this.log)
    }

    this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
    this.turnUser = true;
    this.gameActionService.checkCloseFight(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.gameResultsRedirect);
  }

  attackUser(aiMove = true) {
    this._turnCount.next(this.turnCount + 1);
    const usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[] = [];

    const makeAiMove = (aiUnit: Unit, index: number) => {
      //Unit makes a move only if this unit is not dead
      if (aiUnit.health && aiUnit.canMove) {
        //Start with the closest user unit
        const closestUserUnits = this.unitService.orderUnitsByDistance(aiUnit, this.getUserLeadingUnits(aiMove));
        //Try to get to the closest user unit to attack it or if this unit is not reachable, check the next one
        for (let i = 0; i < closestUserUnits.length; i++) {
          const userUnit = closestUserUnits[i] as Unit;
          if (userUnit.health) {
            //Get Ai unit position and look for targets and the shortest path to them
            const aiPosition = this.unitService.getPositionFromUnit(aiUnit);
            const userUnitPosition = this.unitService.getPositionFromUnit(userUnit as Unit);
            this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
            const shortestPathToUserUnit = this.fieldService.getShortestPathCover(this.fieldService.getGridFromField(this.gameConfig), aiPosition, userUnitPosition, true, false, true)

            //User's unit that can be attacked
            const canGetToUnit = this.gameActionService.getCanGetToPosition(aiUnit, shortestPathToUserUnit, userUnitPosition)
            //Move AI unit
            this.getAiLeadingUnits(aiMove)[index] = {
              ...this.getAiLeadingUnits(aiMove)[index],
              canMove: false,
              x: canGetToUnit.i,
              y: canGetToUnit.j
            }
            //Check if AI unit can attack
            let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.getAiLeadingUnits(aiMove)[index], this.getUserLeadingUnits(aiMove))
            if (enemyWhenCannotMove) {
              //Choose skill and target to attack
              const userIndex = this.unitService.findUnitIndex(this.getUserLeadingUnits(aiMove), this.unitService.getUnitFromPosition(enemyWhenCannotMove));
              const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
              const aiSkillIndex = this.unitService.findSkillIndex(aiUnit.skills, aiSkill);
              let skills: any[] = [];

              if(aiSkill) {
                //Attack user's unit
                this.addBuffToUnit(this.getAiLeadingUnits(aiMove), index, aiSkill)
                aiUnit = this.getAiLeadingUnits(aiMove)[index];

                if (aiUnit.healer && aiSkill.healAll) {
                  this.makeHealerMove(null, aiSkill, aiUnit, this.getAiLeadingUnits(aiMove));
                }
                if (!aiUnit.healer || (aiUnit.healer && !aiUnit.onlyHealer)) {
                  this.makeAttackMove(userIndex, this.effectsService.getBoostedParameterCover(aiUnit, aiUnit.effects) * aiSkill.dmgM, this.effectsService.getBoostedParameterCover(this.getUserLeadingUnits(aiMove)[userIndex], this.getUserLeadingUnits(aiMove)[userIndex].effects), this.getUserLeadingUnits(aiMove), aiUnit, aiSkill)
                  this.universalRangeAttack(aiSkill, this.getUserLeadingUnits(aiMove)[userIndex] as Unit, this.getUserLeadingUnits(aiMove), aiMove, aiUnit)
                }

                //Recount cooldowns for Ai unit after attack (set maximum cooldown for used skill)
                skills = this.updateSkillsCooldown(createDeepCopy(this.getAiLeadingUnits(aiMove)[index].skills), this.getUserLeadingUnits(aiMove), userIndex, aiSkillIndex, aiSkill, true, true)
                usedAiSkills.push({skill: aiSkill, unit: this.getUserLeadingUnits(aiMove)[userIndex], AI: aiUnit});
              }

              //Update AI units and game config
              this.getAiLeadingUnits(aiMove)[index] = {
                ...this.getAiLeadingUnits(aiMove)[index],
                canAttack: false,
                skills: skills
              };
              this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
              return;
            } else {
              //Dead AI units do not make moves
              this.getAiLeadingUnits(aiMove)[index] = {
                ...this.getAiLeadingUnits(aiMove)[index],
                canAttack: false
              };
            }
          }
        }
      }
    }

    this.gameActionService.checkPassiveSkills(this.getAiLeadingUnits(aiMove), this.log);
    for (let i = 0; i < this.getAiLeadingUnits(aiMove).length; i++) {
      this.gameActionService.aiUnitAttack(i, this.getAiLeadingUnits(aiMove), this.battleMode, makeAiMove.bind(this), this.log)
    }
    this.finishAiTurn(1, aiMove, usedAiSkills)
  }

  checkDebuffs(unit: Unit, decreaseRestoreCooldown = true) {
    const response = this.gameActionService.checkDebuffs(unit, decreaseRestoreCooldown, this.battleMode);
    unit = response.unit;
    this.log.push(...response.log);
    return unit;
  }

  highlightCells(path: Position[], className: string) {
    this.fieldService.unhighlightCells.apply(this);
    this.highlightCellsInnerFunction(path, className);
    this.possibleMoves = path.filter((move) => !!move);
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
