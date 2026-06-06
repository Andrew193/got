import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { createDeepCopy } from '../../../helpers';
import { TileUnit } from '../../../models/field.model';
import { Skill } from '../../../models/units-related/skill.model';
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

    for (const skill of passiveSkills) {
      if (skill.effectDurationConfig === undefined) {
        continue;
      }

      const { delta, effectTypes, targets } = skill.effectDurationConfig;
      const targetArrays: { arr: TileUnit[]; assign: (updated: TileUnit[]) => void }[] = [];

      if (targets === 'allies' || targets === 'both') {
        targetArrays.push({ arr: alliesCopy, assign: updated => (alliesCopy = updated) });
      }

      if (targets === 'enemies' || targets === 'both') {
        targetArrays.push({ arr: enemiesCopy, assign: updated => (enemiesCopy = updated) });
      }

      for (const { arr, assign } of targetArrays) {
        const updatedArr = arr.map(unit => {
          const newEffects = unit.effects
            .map(effect => {
              if (effect.passive === true) {
                return effect;
              }

              if (effectTypes.includes(effect.type)) {
                return { ...effect, duration: effect.duration + delta };
              }

              return effect;
            })
            .filter(effect => effect.passive === true || effect.duration > 0);

          return { ...unit, effects: newEffects };
        });

        assign(updatedArr);
      }
    }

    for (const skill of passiveSkills) {
      if (skill.heal === undefined || skill.heal === false) {
        continue;
      }

      const healConfig = skill.heal;
      const healAmount = hero.maxHealth * healConfig.healM;

      if (healConfig.healAll) {
        alliesCopy = alliesCopy.map(unit => {
          if (unit.health === 0) {
            return unit;
          }

          const newHealth = Math.min(unit.health + healAmount, unit.maxHealth);
          const updatedUnit = { ...unit, health: newHealth };

          this.store.dispatch(
            GameBoardActions.logRecord({
              info: true,
              imgSrc: skill.imgSrc,
              message: `${unit.user ? 'Player' : 'Bot'} ${unit.name} restored ${Math.round(healAmount)} points.`,
              id: crypto.randomUUID(),
            }),
          );

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

        this.store.dispatch(
          GameBoardActions.logRecord({
            info: true,
            imgSrc: skill.imgSrc,
            message: `${target.user ? 'Player' : 'Bot'} ${target.name} restored ${Math.round(healAmount)} points.`,
            id: crypto.randomUUID(),
          }),
        );
      }
    }

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

    for (const skill of passiveSkills) {
      if (skill.cooldownConfig === undefined) {
        continue;
      }

      const { cooldownDelta, targetAll, skillIds, targets } = skill.cooldownConfig;
      const targetArrays: { arr: TileUnit[]; assign: (updated: TileUnit[]) => void }[] = [];

      if (targets === 'allies' || targets === 'both') {
        targetArrays.push({ arr: alliesCopy, assign: updated => (alliesCopy = updated) });
      }

      if (targets === 'enemies' || targets === 'both') {
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
