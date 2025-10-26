import { inject, Injectable } from '@angular/core';
import { createDeepCopy } from '../../../helpers';
import { ModalWindowService } from '../../modal/modal-window.service';
import { EffectsService } from '../../effects/effects.service';
import { UnitService } from '../../unit/unit.service';
import { Skill, SkillSrc, TileUnitSkill } from '../../../models/units-related/skill.model';
import { Effect, EffectForMult } from '../../../models/effect.model';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { GameResultsRedirectType, Position, TileUnit } from '../../../models/field.model';
import { HeroType } from '../../../models/units-related/unit.model';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../../store/actions/game-board.actions';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  store = inject(Store);

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
    private modalWindowService: ModalWindowService,
  ) {}

  getFixedDefence(defence: number, unit: TileUnit) {
    debugger;
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
  checkPassiveSkills(units: TileUnit[]) {
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];

      if (unit.health) {
        unit.skills.forEach(skill => {
          if (skill.passive && skill.restoreSkill) {
            const buffs = skill.buffs || [];

            for (const buff of buffs) {
              units[index] = this.restoreHealthForUnit(unit, buff, skill).unit;
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

  restoreHealthForUnit(unit: TileUnit, buff: Effect, skill: SkillSrc) {
    const restoredHealth = this.eS.getNumberForCommonEffects(unit.maxHealth, buff.m);

    this.logRestoreHealth(skill, unit, restoredHealth);
    unit.health = this.eS.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth);

    return { unit };
  }

  private logRestoreHealth(skill: SkillSrc, unit: TileUnit, restoredHealth: number) {
    this.store.dispatch(
      GameBoardActions.logRecord({
        info: true,
        imgSrc: skill.imgSrc,
        message: `${unit.user ? 'Player' : 'Bote'} ${unit.name} restored ${restoredHealth} points. !`,
        id: crypto.randomUUID(),
      }),
    );
  }

  private checkEffectsForHealthRestore(unit: TileUnit) {
    unit.effects.forEach(effect => {
      if (effect.type === this.eS.effects.healthRestore) {
        const response = this.restoreHealthForUnit(unit, effect, {
          imgSrc: effect.imgSrc,
        });

        unit = response.unit;
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
    const processEffectsResult = this.processEffects(unitWithUpdatedCooldown.unit, battleMode);

    unit = {
      ...processEffectsResult.unit,
      effects: processEffectsResult.unit.effects.filter(debuff => !!debuff.duration),
    };

    return { unit: unit };
  }

  private updateEffectDuration(unit: TileUnit, decreaseCooldown: boolean, battleMode: boolean) {
    if (unit.health) {
      unit.effects.forEach((effect: Effect, i, array) => {
        const newDuration = decreaseCooldown ? effect.duration - 1 : effect.duration;

        if (effect.duration > 0) {
          array[i] = { ...effect, duration: newDuration };

          if (effect.restore) {
            this.checkEffectsForHealthRestore(unit);
          } else {
            if (!effect.passive) {
              const additionalDmg = this.getReducedDmgForEffects(
                unit,
                this.eS.getDebuffDmg(effect.type, unit.health, effect.m),
                effect,
              );

              if (additionalDmg) {
                this.store.dispatch(
                  GameBoardActions.logEvent(
                    structuredClone({
                      config: {
                        damage: null,
                        newHealth: null,
                        addDmg: additionalDmg,
                        battleMode: battleMode,
                      },
                      isUser: unit.user,
                      skill: effect,
                      unit: unit,
                    }),
                  ),
                );
              }

              unit.health = this.eS.getHealthAfterDmg(unit.health, additionalDmg);
            }
          }
        }
      });
    }

    return { unit };
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
    unit.effects.forEach(effect => {
      let recountedUnit = this.eS.recountStatsBasedOnEffect(effect, unit);

      recountedUnit = !effect.duration
        ? this.eS.restoreStatsAfterEffect(effect, recountedUnit)
        : recountedUnit;
      unit = recountedUnit.unit;
      if (recountedUnit.message) {
        this.store.dispatch(
          GameBoardActions.logEvent(
            structuredClone({
              config: {
                damage: null,
                newHealth: null,
                battleMode: battleMode,
              },
              isUser: unit.user,
              skill: effect,
              unit: unit,
              message: recountedUnit.message,
            }),
          ),
        );
      }
    });

    return { unit };
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
