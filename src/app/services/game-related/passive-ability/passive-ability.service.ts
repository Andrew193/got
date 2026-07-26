import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { createDeepCopy } from '../../../helpers';
import { TileUnit } from '../../../models/field.model';
import { EffectDurationConfigTargets, Skill } from '../../../models/units-related/skill.model';
import { GameBoardActions } from '../../../store/actions/game-board.actions';

export type PassiveAbilityResult = {
  allies: TileUnit[];
  enemies: TileUnit[];
  blockBuffApplication: boolean;
};

@Injectable({ providedIn: 'root' })
export class PassiveAbilityService {
  store = inject(Store);

  processBeforeAttack(defenderTeam: TileUnit[]): PassiveAbilityResult {
    if (!defenderTeam.length) {
      return { allies: [], enemies: [], blockBuffApplication: false };
    }

    const blockBuffApplication = defenderTeam.some(
      unit =>
        unit.health > 0 &&
        unit.skills.some(s => {
          const skill = s as unknown as Skill;

          return skill.passive === true && skill.blockAttackerBuffs === true;
        }),
    );

    return { allies: defenderTeam, enemies: [], blockBuffApplication };
  }

  processRoundStart(hero: TileUnit, allies: TileUnit[], enemies: TileUnit[]): PassiveAbilityResult {
    if (hero.health === 0) {
      return { allies, enemies, blockBuffApplication: false };
    }

    const passiveSkills = (hero.skills as Skill[]).filter(s => s.passive);

    if (passiveSkills.length === 0) {
      return { allies, enemies, blockBuffApplication: false };
    }

    let alliesCopy = createDeepCopy(allies);
    let enemiesCopy = createDeepCopy(enemies);

    // Манипуляция тиками эфектов
    for (const skill of passiveSkills) {
      if (skill.effectDurationConfig === undefined) {
        continue;
      }

      const { delta, effectTypes, targets } = skill.effectDurationConfig;
      const targetArrays: { arr: TileUnit[]; assign: (updated: TileUnit[]) => void }[] = [];

      if (
        targets === EffectDurationConfigTargets.ALLIES ||
        targets === EffectDurationConfigTargets.BOTH
      ) {
        targetArrays.push({ arr: alliesCopy, assign: updated => (alliesCopy = updated) });
      }

      if (
        targets === EffectDurationConfigTargets.ENEMIES ||
        targets === EffectDurationConfigTargets.BOTH
      ) {
        targetArrays.push({ arr: enemiesCopy, assign: updated => (enemiesCopy = updated) });
      }

      for (const { arr, assign } of targetArrays) {
        const updatedArr = arr.map(unit => {
          const newEffects = unit.effects
            .map(effect => {
              if (effectTypes.includes(effect.type)) {
                return { ...effect, duration: effect.duration + delta };
              }

              if (effect.passive === true) {
                return effect;
              }

              return effect;
            })
            .filter(effect => effect.passive === true || effect.duration > 0);

          return { ...unit, effects: newEffects };
        });

        assign(updatedArr);
      }
    }

    //Лечение
    for (const skill of passiveSkills) {
      if (skill.heal === undefined || skill.heal === false) {
        continue;
      }

      const healConfig = skill.heal;
      const healAmount = hero.maxHealth * healConfig.healM;

      const logHealRestore = (unit: TileUnit) => {
        this.store.dispatch(
          GameBoardActions.logRecord({
            info: true,
            imgSrc: skill.imgSrc,
            message: `${unit.user ? 'Player' : 'Bot'} ${unit.name} restored ${Math.round(healAmount)} points.`,
            id: crypto.randomUUID(),
          }),
        );
      };

      // If healSelf is true, heal only the caster (hero)
      if (healConfig.healSelf) {
        const heroIndex = alliesCopy.findIndex(unit => unit.x === hero.x && unit.y === hero.y);

        if (heroIndex !== -1 && alliesCopy[heroIndex].health > 0) {
          const newHealth = Math.min(alliesCopy[heroIndex].health + healAmount, alliesCopy[heroIndex].maxHealth);

          alliesCopy[heroIndex] = { ...alliesCopy[heroIndex], health: newHealth };
          logHealRestore(alliesCopy[heroIndex]);
        }
      } else if (healConfig.healAll) {
        alliesCopy = alliesCopy.map(unit => {
          if (unit.health === 0) {
            return unit;
          }

          const newHealth = Math.min(unit.health + healAmount, unit.maxHealth);
          const updatedUnit = { ...unit, health: newHealth };

          logHealRestore(unit);

          return updatedUnit;
        });
      } else {
        const livingAllies = alliesCopy.filter(unit => unit.health > 0);

        if (livingAllies.length === 0) {
          continue;
        }

        const target = livingAllies.reduce((min, unit) => (unit.health < min.health ? unit : min));
        const newHealth = Math.min(target.health + healAmount, target.maxHealth);

        alliesCopy = alliesCopy.map(unit => {
          if (unit !== target) {
            return unit;
          }

          return { ...unit, health: newHealth };
        });

        logHealRestore(target);
      }
    }

    //Нанесение урона
    for (const skill of passiveSkills) {
      if (skill.passive !== true || skill.dmgM === undefined) {
        continue;
      }

      const dmgAmount = hero.maxHealth * skill.dmgM;

      enemiesCopy = enemiesCopy.map(unit => {
        if (unit.health === 0) {
          return unit;
        }

        const newHealth = Math.max(unit.health - dmgAmount, 0);

        this.store.dispatch(
          GameBoardActions.logRecord({
            info: true,
            imgSrc: skill.imgSrc,
            message: `${unit.user ? 'Player' : 'Bot'} ${unit.name} received ${Math.round(dmgAmount)} points.`,
            id: crypto.randomUUID(),
          }),
        );

        return { ...unit, health: newHealth };
      });
    }

    //Манипуляция кулдаунов навыков
    for (const skill of passiveSkills) {
      if (skill.cooldownConfig === undefined) {
        continue;
      }

      const { cooldownDelta, targetAll, skillIds, targets } = skill.cooldownConfig;
      const targetArrays: { arr: TileUnit[]; assign: (updated: TileUnit[]) => void }[] = [];

      if (
        targets === EffectDurationConfigTargets.ALLIES ||
        targets === EffectDurationConfigTargets.BOTH
      ) {
        targetArrays.push({ arr: alliesCopy, assign: updated => (alliesCopy = updated) });
      }

      if (
        targets === EffectDurationConfigTargets.ENEMIES ||
        targets === EffectDurationConfigTargets.BOTH
      ) {
        targetArrays.push({ arr: enemiesCopy, assign: updated => (enemiesCopy = updated) });
      }

      for (const { arr, assign } of targetArrays) {
        const updatedArr = arr.map(unit => {
          const updatedSkills = (unit.skills as Skill[]).map(unitSkill => {
            if (unitSkill.passive === true) {
              return unitSkill;
            }

            if (targetAll === true || skillIds?.includes(unitSkill.name)) {
              const newRemainingCooldown = (unitSkill.remainingCooldown ?? 0) + cooldownDelta;
              const clampedValue = Math.max(
                0,
                Math.min(newRemainingCooldown, unitSkill.cooldown ?? 0),
              );

              return { ...unitSkill, remainingCooldown: clampedValue };
            }

            return unitSkill;
          });

          return { ...unit, skills: updatedSkills };
        });

        assign(updatedArr);
      }
    }

    return { allies: alliesCopy, enemies: enemiesCopy, blockBuffApplication: false };
  }
}
