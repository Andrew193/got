import {Injectable} from '@angular/core';
import {createDeepCopy} from "../../helpers";
import {ModalWindowService} from "../modal/modal-window.service";
import {EffectsService} from "../effects/effects.service";
import {UnitService} from "../unit/unit.service";
import {heroType} from "../heroes/heroes.service";
import {Unit} from "../../models/unit.model";
import {Skill} from "../../models/skill.model";
import {Effect} from "../../models/effect.model";
import {GameLoggerService} from "../game-logger/logger.service";
import {ModalStrategiesTypes} from "../../components/modal-window/modal-interfaces";
import {Position} from "../../models/field.model";
import {LogRecord} from "../../models/logger.model";

@Injectable({
  providedIn: 'root',
})
export class GameService {
  gameResult = {
    headerMessage: "",
    headerClass: "",
    closeBtnLabel: "",
    callback: () => {
    }
  }
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];

  constructor(private unitService: UnitService,
              private eS: EffectsService,
              private gameLoggerService: GameLoggerService,
              private modalWindowService: ModalWindowService) {
  }

  getFixedDefence(defence: number, unit: Unit) {
    const defReducedEffect = unit.effects.find((effect) => effect.type === this.eS.effects.defBreak)
    return !!defReducedEffect ? defence * this.eS.getMultForEffect(defReducedEffect) : defence
  }

  getCanGetToPosition(aiUnit: Unit, shortestPathToUserUnit: Position[], userUnitPosition: Position) {
    const canCrossLimit = aiUnit.canCross === 0 ? 1 : aiUnit.canCross;
    const isWithinCanCrossLimit = shortestPathToUserUnit.length > canCrossLimit - 1;
    const isAtAttackRange = aiUnit.attackRange >= shortestPathToUserUnit.length;
    const isAttackRangeOrCannotCross = aiUnit.attackRange > shortestPathToUserUnit.length || aiUnit.canCross === 0;

    // Simplified decision logic
    let canGetToUnit;
    if (isWithinCanCrossLimit && !isAtAttackRange) {
      canGetToUnit = aiUnit.canCross === 0
        ? this.unitService.getPositionFromCoordinate(aiUnit)
        : shortestPathToUserUnit[canCrossLimit - 1]
    } else if (isAttackRangeOrCannotCross) {
      if (!!aiUnit.canCross && shortestPathToUserUnit.length === 1 && aiUnit.attackRange > shortestPathToUserUnit.length) {
        canGetToUnit = isAtAttackRange ? this.unitService.getPositionFromCoordinate(aiUnit) : shortestPathToUserUnit[0];
      } else {
        canGetToUnit = this.unitService.getPositionFromCoordinate(aiUnit);
      }
    } else {
      const canCross = this.getCanCross(aiUnit);
      canGetToUnit = canCross === 0
        ? this.unitService.getPositionFromCoordinate(aiUnit)
        : shortestPathToUserUnit[canCross - 1] || shortestPathToUserUnit[0]
    }
    if (userUnitPosition && !shortestPathToUserUnit.length) {
      canGetToUnit = this.unitService.getPositionFromCoordinate(aiUnit);
    }
    return canGetToUnit;
  }

  getFixedAttack(attack: number, unit: Unit) {
    const attackReducedEffect = unit.effects.find((effect) => {
      return unit.heroType === heroType.ATTACK ?
        effect.type === this.eS.effects.attackBreak : effect.type === this.eS.effects.defBreak
    })
    return !!attackReducedEffect ? attack * this.eS.getMultForEffect(attackReducedEffect) : attack
  }

  //Check buffs ( health restore )
  checkPassiveSkills(units: Unit[], logs: LogRecord[]) {
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];
      if (unit.health) {
        unit.skills.forEach((skill) => {
          if (skill.passive && skill.restoreSkill) {
            const buffs = skill.buffs || [];
            for (let i = 0; i < buffs.length; i++) {
              units[index] = this.restoreHealthForUnit(unit, buffs[i], logs, skill);
            }
          } else if (skill.passive && skill.buffs) {
            skill.buffs.forEach((buff) => {
              units[index].effects = [...units[index].effects, buff]
            })
          }
        })
      }
    }
  }

  restoreHealthForUnit(unit: Unit, buff: Effect, logs: LogRecord[], skill: Skill) {
    const restoredHealth = this.eS.getNumberForCommonEffects(unit.maxHealth, buff.m);
    this.logRestoreHealth(logs, skill, unit, restoredHealth);
    unit.health = this.eS.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth)
    return unit;
  }

  logRestoreHealth(logs: LogRecord[], skill: Skill, unit: Unit, restoredHealth: number) {
    logs.push({
      info: true, imgSrc: skill.imgSrc,
      message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} восстановил ${restoredHealth} ед. !`
    })
  }

  checkEffectsForHealthRestore(unit: Unit, logs: LogRecord[]) {
    unit.effects.forEach((effect) => {
      if (effect.type === this.eS.effects.healthRestore) {
        unit = this.restoreHealthForUnit(unit, effect, logs, {imgSrc: effect.imgSrc} as Skill)
      }
    })
  }

  getReducedDmgForEffects(unit: Unit, dmg: number, debuff?: Effect) {
    let isDmgReduced = false;
    if (debuff) {
      isDmgReduced = unit.reducedDmgFromDebuffs.includes(debuff.type);
    }
    const dmgAfterReductionByPassiveSkills = !!unit.dmgReducedBy ? dmg - dmg * unit.dmgReducedBy : dmg;
    return +(isDmgReduced ? dmgAfterReductionByPassiveSkills - dmgAfterReductionByPassiveSkills * 0.25 : dmgAfterReductionByPassiveSkills).toFixed(0);
  }

  //Shows skills in attack bar ( user units ) and decreases cooldonws by 1 for used skills
  selectSkillsAndRecountCooldown(units: Unit[], selectedUnit: Unit, recountCooldown = true) {
    const unitIndex = this.unitService.findUnitIndex(units, selectedUnit);
    let skills: Skill[] = createDeepCopy(selectedUnit?.skills as Skill[]);
    if (recountCooldown) {
      skills = this.unitService.recountSkillsCooldown(skills);
    }
    units[unitIndex] = {...units[unitIndex], skills: skills};
    return skills;
  }

  recountCooldownForUnit(unit: Unit) {
    return {...unit, skills: this.unitService.recountSkillsCooldown(createDeepCopy(unit.skills))};
  }

  checkCloseFight(userUnits: Unit[], aiUnits: Unit[], callback: (realAiUnits: any) => void) {
    const realUserUnits = userUnits[0].user ? userUnits : aiUnits;
    const realAiUnits = !aiUnits[0].user ? aiUnits : userUnits;

    const allUserUnitsDead = this.isDead(realUserUnits);
    const allAiUnitsDead = this.isDead(realAiUnits);
    if (allUserUnitsDead || allAiUnitsDead) {
      this.gameResult = {
        headerClass: allUserUnitsDead ? "red-b" : "green-b",
        headerMessage: allUserUnitsDead ? "Вы проиграли" : "Вы победили",
        closeBtnLabel: allUserUnitsDead ? "Попробовать позже" : "Отлично",
        callback: () => {
          callback(realAiUnits)
        }
      }

      const config =
        this.modalWindowService.getModalConfig(this.gameResult.headerClass, this.gameResult.headerMessage, this.gameResult.closeBtnLabel, {
          open: true,
          callback: () => {
            callback(realAiUnits)
          },
          strategy: ModalStrategiesTypes.base
        });

      this.modalWindowService.openModal(config);
    }
  }

  isDead(units: Unit[]) {
    return units.every((userUnit) => !userUnit.health);
  }

  checkDebuffs(unit: Unit, decreaseRestoreCooldown = true, battleMode: boolean, canRestoreHealth: boolean) {
    let unitCopy: Unit = createDeepCopy(unit);

    const unitWithUpdatedCooldown = this.updateEffectDuration(unitCopy, decreaseRestoreCooldown, battleMode, canRestoreHealth)
    unitCopy = unitWithUpdatedCooldown.unit;

    const processEffectsResult = this.processEffects(createDeepCopy(unitCopy), battleMode);
    unitCopy = processEffectsResult.unit;
    unitCopy.effects = unitCopy.effects.filter((debuff) => !!debuff.duration);

    return {unit: unitCopy, log: [...unitWithUpdatedCooldown.log, ...processEffectsResult.log]};
  }

  private updateEffectDuration(unit: Unit, decreaseRestoreCooldown: boolean, battleMode: boolean, checkHealthRestore = false) {
    const log: LogRecord[] = [];
    unit.effects.forEach((effect: Effect, i, array) => {
      if (effect.duration > 0) {
        if (effect.restore) {
          if (checkHealthRestore) {
            array[i] = {...effect, duration: decreaseRestoreCooldown ? effect.duration - 1 : effect.duration}
            this.checkEffectsForHealthRestore(unit, log);
          }
        } else {
          array[i] = {...effect, duration: effect.duration - 1}
          if (!effect.passive) {
            const additionalDmg = this.getReducedDmgForEffects(unit, this.eS.getDebuffDmg(effect.type, unit.health, effect.m), effect);
            if (additionalDmg) {
              log.push(this.gameLoggerService.logEvent({
                damage: null,
                newHealth: null,
                addDmg: additionalDmg,
                battleMode: battleMode
              }, unit.user, effect, unit))
            }
            unit.health = this.eS.getHealthAfterDmg(unit.health, additionalDmg);
          }
        }
      }
    })
    return {log, unit};
  }

  getCanCross(entity: Unit) {
    const isFrozen = entity.effects.findIndex((effect) => effect.type === this.eS.effects.freezing)
    const isRooted = entity.effects.findIndex((effect) => effect.type === this.eS.effects.root)

    return entity?.canMove
      ? isRooted !== -1
        ? 0
        : isFrozen !== -1
          ? 1
          : entity.canCross || 1
      : entity.attackRange
  }

  processEffects(unit: Unit, battleMode: boolean) {
    const log: LogRecord[] = [];

    unit.effects.forEach((effect) => {
      let recountedUnit = this.eS.recountStatsBasedOnEffect(effect, unit);
      recountedUnit = !effect.duration ? this.eS.restoreStatsAfterEffect(effect, recountedUnit) : recountedUnit;
      unit = recountedUnit.unit;
      if (recountedUnit.message) {
        log.push(this.gameLoggerService.logEvent({
          damage: null,
          newHealth: null,
          battleMode: battleMode
        }, unit.user, effect, unit, recountedUnit.message))
      }
    })

    return {log, unit}
  }

  /**
   * Replacement for
   *   const aiUnitAttack = (index: number) => {
   *     //Get AI unit and look for debuffs ( deal dmg before making a move )
   *     let aiUnit = this[aiMove ? 'aiUnits' : 'userUnits'][index];
   *     this[aiMove ? 'aiUnits' : 'userUnits'][index] = this.checkDebuffs(createDeepCopy(aiUnit));
   *     aiUnit = this[aiMove ? 'aiUnits' : 'userUnits'][index];
   *     //AI makes a move
   *     makeAiMove(aiUnit, index);
   *     //Update skills cooldowns
   *     this.gameActionService.selectSkillsAndRecountCooldown(this[aiMove ? 'aiUnits' : 'userUnits'], this[aiMove ? 'aiUnits' : 'userUnits'][index]);
   *   }
   *   This is a servant function of the attackUser function
   */
  aiUnitAttack(index: number, units: Unit[], battleMode: boolean, makeAiMove: (aiUnit: Unit, index: number) => void, logs: LogRecord[]) {
    let aiUnit = units[index];
    const response = this.checkDebuffs(createDeepCopy(aiUnit), true, battleMode, true);
    units[index] = response.unit;
    logs.push(...response.log)
    aiUnit = units[index];

    makeAiMove(aiUnit, index);

    this.selectSkillsAndRecountCooldown(units, units[index]);
  }

  getAiLeadingUnits(aiMove: boolean) {
    return this[aiMove ? 'aiUnits' : 'userUnits']
  }

  getUserLeadingUnits(aiMove: boolean) {
    return this[aiMove ? 'userUnits' : 'aiUnits']
  }
}
