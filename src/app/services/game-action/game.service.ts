import { Injectable } from '@angular/core';
import { createDeepCopy } from '../../helpers';
import { ModalWindowService } from '../modal/modal-window.service';
import { EffectsService } from '../effects/effects.service';
import { UnitService } from '../unit/unit.service';
import { Skill, SkillSrc, TileUnitSkill } from '../../models/skill.model';
import { Effect, EffectForMult } from '../../models/effect.model';
import { GameLoggerService } from '../game-logger/logger.service';
import { ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';
import { GameResultsRedirectType, Position, TileUnit } from '../../models/field.model';
import { LogRecord } from '../../models/logger.model';
import { HeroType } from '../../models/unit.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gameResult = {
    headerMessage: '',
    headerClass: '',
    closeBtnLabel: '',
    callback: () => {},
  };
  private aiUnits: TileUnit[] = [];
  private userUnits: TileUnit[] = [];

  constructor(
    private unitService: UnitService,
    private eS: EffectsService,
    private gameLoggerService: GameLoggerService,
    private modalWindowService: ModalWindowService,
  ) {}

  getFixedDefence(defence: number, unit: TileUnit) {
    const defReducedEffect = unit.effects.find(
      (effect): effect is EffectForMult => effect.type === this.eS.effects.defBreak,
    );

    return defReducedEffect ? defence * this.eS.getMultForEffect(defReducedEffect) : defence;
  }

  getCanGetToPosition(
    aiUnit: TileUnit,
    shortestPathToUserUnit: Position[],
    userUnitPosition: Position,
  ) {
    const canCrossLimit = aiUnit.canCross === 0 ? 1 : aiUnit.canCross;
    const isWithinCanCrossLimit = shortestPathToUserUnit.length > canCrossLimit - 1;
    const isAtAttackRange = aiUnit.attackRange >= shortestPathToUserUnit.length;
    const isAttackRangeOrCannotCross =
      aiUnit.attackRange > shortestPathToUserUnit.length || aiUnit.canCross === 0;

    // Simplified decision logic
    let canGetToUnit;

    if (isWithinCanCrossLimit && !isAtAttackRange) {
      canGetToUnit =
        aiUnit.canCross === 0
          ? this.unitService.getPositionFromCoordinate(aiUnit)
          : shortestPathToUserUnit[canCrossLimit - 1];
    } else if (isAttackRangeOrCannotCross) {
      if (
        !!aiUnit.canCross &&
        shortestPathToUserUnit.length === 1 &&
        aiUnit.attackRange > shortestPathToUserUnit.length
      ) {
        canGetToUnit = isAtAttackRange
          ? this.unitService.getPositionFromCoordinate(aiUnit)
          : shortestPathToUserUnit[0];
      } else {
        canGetToUnit = this.unitService.getPositionFromCoordinate(aiUnit);
      }
    } else {
      const canCross = this.getCanCross(aiUnit);

      canGetToUnit =
        canCross === 0
          ? this.unitService.getPositionFromCoordinate(aiUnit)
          : shortestPathToUserUnit[canCross - 1] || shortestPathToUserUnit[0];
    }

    if (userUnitPosition && !shortestPathToUserUnit.length) {
      canGetToUnit = this.unitService.getPositionFromCoordinate(aiUnit);
    }

    return canGetToUnit;
  }

  getFixedAttack(attack: number, unit: TileUnit) {
    const attackReducedEffect = unit.effects.find((effect): effect is EffectForMult => {
      return unit.heroType === HeroType.ATTACK
        ? effect.type === this.eS.effects.attackBreak
        : effect.type === this.eS.effects.defBreak;
    });

    return attackReducedEffect ? attack * this.eS.getMultForEffect(attackReducedEffect) : attack;
  }

  //Check buffs ( health restore )
  checkPassiveSkills(units: TileUnit[], logs: LogRecord[]) {
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];

      if (unit.health) {
        unit.skills.forEach(skill => {
          if (skill.passive && skill.restoreSkill) {
            const buffs = skill.buffs || [];

            for (const buff of buffs) {
              units[index] = this.restoreHealthForUnit(unit, buff, logs, skill);
            }
          } else if (skill.passive && skill.buffs) {
            skill.buffs.forEach(buff => {
              units[index].effects = [...units[index].effects, buff];
            });
          }
        });
      }
    }
  }

  restoreHealthForUnit(unit: TileUnit, buff: Effect, logs: LogRecord[], skill: SkillSrc) {
    const restoredHealth = this.eS.getNumberForCommonEffects(unit.maxHealth, buff.m);

    this.logRestoreHealth(logs, skill, unit, restoredHealth);
    unit.health = this.eS.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth);

    return unit;
  }

  private logRestoreHealth(
    logs: LogRecord[],
    skill: SkillSrc,
    unit: TileUnit,
    restoredHealth: number,
  ) {
    logs.push({
      info: true,
      imgSrc: skill.imgSrc,
      message: `${unit.user ? 'Player' : 'Bote'} ${unit.name} restored ${restoredHealth} points. !`,
    });
  }

  private checkEffectsForHealthRestore(unit: TileUnit, logs: LogRecord[]) {
    unit.effects.forEach(effect => {
      if (effect.type === this.eS.effects.healthRestore) {
        unit = this.restoreHealthForUnit(unit, effect, logs, {
          imgSrc: effect.imgSrc,
        });
      }
    });
  }

  private getReducedDmgForEffects(unit: TileUnit, dmg: number, debuff?: Effect) {
    let isDmgReduced = false;

    if (debuff) {
      isDmgReduced = unit.reducedDmgFromDebuffs.includes(debuff.type);
    }

    const dmgAfterReductionByPassiveSkills = unit.dmgReducedBy
      ? dmg - dmg * unit.dmgReducedBy
      : dmg;

    return +(
      isDmgReduced
        ? dmgAfterReductionByPassiveSkills - dmgAfterReductionByPassiveSkills * 0.25
        : dmgAfterReductionByPassiveSkills
    ).toFixed(0);
  }

  //Shows skills in attack bar (user units) and decreases cooldowns by 1 for used skills
  selectSkillsAndRecountCooldown(
    units: TileUnit[],
    selectedUnit: TileUnit,
    recountCooldown = true,
  ) {
    const unitIndex = this.unitService.findUnitIndex(units, selectedUnit);
    let skills: TileUnitSkill[] = createDeepCopy(selectedUnit?.skills as Skill[]);

    if (recountCooldown) {
      skills = this.unitService.recountSkillsCooldown(skills);
    }

    units[unitIndex] = { ...units[unitIndex], skills: skills };

    return skills;
  }

  recountCooldownForUnit(unit: TileUnit) {
    return {
      ...unit,
      skills: this.unitService.recountSkillsCooldown(unit.skills),
    };
  }

  checkCloseFight(userUnits: TileUnit[], aiUnits: TileUnit[], callback: GameResultsRedirectType) {
    const realUserUnits = userUnits[0].user ? userUnits : aiUnits;
    const realAiUnits = !aiUnits[0].user ? aiUnits : userUnits;

    const allUserUnitsDead = this.isDead(realUserUnits);
    const allAiUnitsDead = this.isDead(realAiUnits);

    if (allUserUnitsDead || allAiUnitsDead) {
      this.gameResult = {
        headerClass: allUserUnitsDead ? 'red-b' : 'green-b',
        headerMessage: allUserUnitsDead ? 'You lost' : 'You won',
        closeBtnLabel: allUserUnitsDead ? 'Try again later' : 'Great',
        callback: () => {
          callback(realAiUnits, !allUserUnitsDead);
        },
      };

      const config = this.modalWindowService.getModalConfig(
        this.gameResult.headerClass,
        this.gameResult.headerMessage,
        this.gameResult.closeBtnLabel,
        {
          open: true,
          callback: () => {
            callback(realAiUnits, !allUserUnitsDead);
          },
          strategy: ModalStrategiesTypes.base,
        },
      );

      this.modalWindowService.openModal(config);
    }
  }

  isDead(units: TileUnit[]) {
    return units.every(userUnit => !userUnit.health);
  }

  checkDebuffs(unit: TileUnit, decreaseCooldown = true, battleMode: boolean) {
    const unitWithUpdatedCooldown = this.updateEffectDuration(unit, decreaseCooldown, battleMode);

    unit = unitWithUpdatedCooldown.unit;

    const processEffectsResult = this.processEffects(createDeepCopy(unit), battleMode);

    unit = processEffectsResult.unit;
    unit.effects = unit.effects.filter(debuff => !!debuff.duration);

    return {
      unit: unit,
      log: [...unitWithUpdatedCooldown.log, ...processEffectsResult.log],
    };
  }

  private updateEffectDuration(unit: TileUnit, decreaseCooldown: boolean, battleMode: boolean) {
    const log: LogRecord[] = [];

    unit.effects.forEach((effect: Effect, i, array) => {
      const newDuration = decreaseCooldown ? effect.duration - 1 : effect.duration;

      if (effect.duration > 0) {
        array[i] = { ...effect, duration: newDuration };

        if (effect.restore) {
          this.checkEffectsForHealthRestore(unit, log);
        } else {
          if (!effect.passive) {
            const additionalDmg = this.getReducedDmgForEffects(
              unit,
              this.eS.getDebuffDmg(effect.type, unit.health, effect.m),
              effect,
            );

            if (additionalDmg) {
              log.push(
                this.gameLoggerService.logEvent(
                  {
                    damage: null,
                    newHealth: null,
                    addDmg: additionalDmg,
                    battleMode: battleMode,
                  },
                  unit.user,
                  effect,
                  unit,
                ),
              );
            }

            unit.health = this.eS.getHealthAfterDmg(unit.health, additionalDmg);
          }
        }
      }
    });

    return { log, unit };
  }

  getCanCross(entity: TileUnit) {
    const isFrozen = entity.effects.findIndex(effect => effect.type === this.eS.effects.freezing);
    const isRooted = entity.effects.findIndex(effect => effect.type === this.eS.effects.root);

    return entity?.canMove
      ? isRooted !== -1
        ? 0
        : isFrozen !== -1
          ? 1
          : entity.canCross || 1
      : entity.attackRange;
  }

  private processEffects(unit: TileUnit, battleMode: boolean) {
    const log: LogRecord[] = [];

    unit.effects.forEach(effect => {
      let recountedUnit = this.eS.recountStatsBasedOnEffect(effect, unit);

      recountedUnit = !effect.duration
        ? this.eS.restoreStatsAfterEffect(effect, recountedUnit)
        : recountedUnit;
      unit = recountedUnit.unit;
      if (recountedUnit.message) {
        log.push(
          this.gameLoggerService.logEvent(
            {
              damage: null,
              newHealth: null,
              battleMode: battleMode,
            },
            unit.user,
            effect,
            unit,
            recountedUnit.message,
          ),
        );
      }
    });

    return { log, unit };
  }

  aiUnitAttack(
    index: number,
    units: TileUnit[],
    makeAiMove: (aiUnit: TileUnit, index: number) => void,
  ) {
    makeAiMove(units[index], index);

    this.selectSkillsAndRecountCooldown(units, units[index]);
  }

  getAiLeadingUnits(aiMove: boolean) {
    return this[aiMove ? 'aiUnits' : 'userUnits'];
  }

  getUserLeadingUnits(aiMove: boolean) {
    return this[aiMove ? 'userUnits' : 'aiUnits'];
  }
}
