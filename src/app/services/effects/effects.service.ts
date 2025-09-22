import { Injectable } from '@angular/core';
import { Unit } from '../../models/unit.model';
import { Skill } from '../../models/skill.model';
import { Effect } from '../../models/effect.model';
import { heroType } from '../heroes/heroes.service';

@Injectable({
  providedIn: 'root',
})
export class EffectsService {
  effects = {
    burning: 'Горение',
    freezing: 'Заморозка',
    healthRestore: 'Восстановление',
    defBreak: 'Разлом брони',
    bleeding: 'Кровотечение',
    poison: 'Отравление',
    attackBuff: 'Бонус атаки',
    defBuff: 'Бонус защиты',
    attackBreak: 'Заржавелый Меч',
    defDestroy: 'Коррозия брони',
    root: 'Корень',
  };

  effectsDescriptions: { [key: string]: string } = {
    [this.effects.burning]:
      'Наносит противнику урон в размере 10% от его здоровья каждый ход.',
    [this.effects.freezing]:
      'Герой заморожен и может пройти только 1 клетку за ход.',
    [this.effects.healthRestore]: 'Восстановливает 5% здоровья каждый ход.',
    [this.effects.defBreak]: 'Защита героя снижается на 50 ед. за ход.',
    [this.effects.bleeding]:
      'Наносит противнику урон в размере 5% от его здоровья каждый ход.',
    [this.effects.poison]:
      'Наносит противнику урон в размере 7.5% от его здоровья каждый ход.',
    [this.effects.attackBuff]: 'Увеличивает атаку героя на 50%.',
    [this.effects.defBuff]: 'Увеличивает защиту героя на 50%.',
    [this.effects.attackBreak]: 'Уменьшает атаку героя на 50%.',
    [this.effects.defDestroy]: 'Уменьшает защиту героя на 50%.',
    [this.effects.root]: 'Герой скован корнями и не может двигаться.',
  };

  constructor() {}

  get effectsToHighlight() {
    return Object.values(this.effects);
  }

  getMobilityStatsBasedOnEffect(effect: Effect, unit: Unit) {
    let message = '';
    if (effect.type === this.effects.freezing) {
      unit.canCross = 1;
      message += unit.health
        ? `Герой заморожен и может пройти только 1 клетку за ход.`
        : '';
    }
    if (effect.type === this.effects.root) {
      unit.canCross = 0;
      message += unit.health
        ? `Герой скован корнями и не может двигаться.`
        : '';
    }
    return { unit, message: message };
  }

  recountStatsBasedOnEffect(effect: Effect, unit: Unit) {
    const result = this.getMobilityStatsBasedOnEffect(effect, unit);
    let message = result.message;
    unit = result.unit;

    if (effect.type === this.effects.defDestroy && effect.defBreak) {
      unit.defence += effect.defBreak;
      message += unit.health
        ? `Защита героя ${unit.name} была снижена на ${effect.defBreak} ед. из-за штрафа ${effect.type}.`
        : '';
    }
    return { unit, message: message };
  }

  restoreStatsAfterEffect(
    effect: Effect,
    config: { unit: Unit; message: string }
  ) {
    let message = '';
    if (
      effect.type === this.effects.freezing ||
      effect.type === this.effects.root
    ) {
      config.unit.canCross = config.unit.maxCanCross;
      message = config.unit.health
        ? `Герой ${config.unit.name} восстановил мобильность!`
        : '';
    }
    return { unit: config.unit, message: message ? message : config.message };
  }

  getMultForEffect(effect: Effect) {
    return {
      [this.effects.defBreak]: this.getDefBreak().m,
      [this.effects.attackBreak]: this.getAttackBreak().m,
    }[effect.type];
  }

  getEffectsWithIgnoreFilter(
    unit: Unit,
    skill: Skill,
    addRangeEffects = false
  ) {
    const debuffsToSet = (
      addRangeEffects ? skill.inRangeDebuffs : skill.debuffs
    )?.filter(debuff => !unit.ignoredDebuffs.includes(debuff.type));
    return [...unit.effects, ...(debuffsToSet || [])];
  }

  getBoostedParameterCover(unit: Unit, effects: Effect[]) {
    const isAttackHero = unit.heroType === heroType.ATTACK;
    return this.getBoostedParameter(
      isAttackHero ? unit.attack : unit.defence,
      effects,
      isAttackHero ? this.effects.attackBuff : this.effects.defBuff
    );
  }

  getBoostedParameter(parameter: number, effects: Effect[], type: string) {
    const effect = effects.find(effect => effect.type === type);
    return parameter * (effect?.m || 1);
  }

  getHealthAfterDmg(health: number, dmg: number) {
    return +(health - dmg > 0 ? health - dmg : 0).toFixed(0);
  }

  getHealthAfterRestore(health: number, maxHealth: number) {
    return +(health > maxHealth ? maxHealth : health).toFixed(0);
  }

  getNumberForCommonEffects(int: number, m: number) {
    return +(int * m).toFixed(0);
  }

  getEffect(effectType: string, turns = 2, count?: number) {
    if (count) {
      return new Array(count)
        .fill(0)
        .map(() => this.effectsMap[effectType](turns));
    }
    return [this.effectsMap[effectType](turns)];
  }

  effectsMap: Record<string, (turns: number) => Effect> = {
    [this.effects.burning]: (turns: number) => this.getBurning(turns),
    [this.effects.healthRestore]: (turns: number) =>
      this.getHealthRestore(turns),
    [this.effects.freezing]: (turns: number) => this.getFreezing(turns),
    [this.effects.root]: (turns: number) => this.getRoot(turns),
    [this.effects.defDestroy]: (turns: number) => this.getDefenceDestroy(turns),
    [this.effects.poison]: (turns: number) => this.getPoison(turns),
    [this.effects.bleeding]: (turns: number) => this.getBleeding(turns),
    [this.effects.defBreak]: (turns: number) => this.getDefBreak(turns),
    [this.effects.attackBreak]: (turns: number) => this.getAttackBreak(turns),
    [this.effects.attackBuff]: (turns: number) => this.getAttackBuff(turns),
    [this.effects.defBuff]: (turns: number) => this.getDefBuff(turns),
  };

  private getHealthRestore(turns = 1): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/health_restore_buff.png',
      type: this.effects.healthRestore,
      duration: turns,
      m: 0.05,
      restore: true,
    };
  }

  private getBurning(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/burning.png',
      type: this.effects.burning,
      duration: turns,
      m: 0.1,
    };
  }

  private getFreezing(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/freezing_debuff.png',
      type: this.effects.freezing,
      duration: turns,
      m: 0,
    };
  }

  private getRoot(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/root.png',
      type: this.effects.root,
      duration: turns,
      m: 0,
    };
  }

  private getDefenceDestroy(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/def_destroy.png',
      type: this.effects.defDestroy,
      duration: turns,
      m: 0,
      defBreak: -50,
    };
  }

  private getPoison(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/poison.png',
      type: this.effects.poison,
      duration: turns,
      m: 0.075,
    };
  }

  private getBleeding(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/bleeding.png',
      type: this.effects.bleeding,
      duration: turns,
      m: 0.05,
    };
  }

  private getDefBreak(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/def_break.png',
      type: this.effects.defBreak,
      duration: turns,
      passive: true,
      m: 0.5,
    };
  }

  private getAttackBreak(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/attack_break.png',
      type: this.effects.attackBreak,
      duration: turns,
      passive: true,
      m: 0.5,
    };
  }

  private getAttackBuff(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/attack_buff.png',
      type: this.effects.attackBuff,
      duration: turns,
      passive: true,
      m: 1.5,
    };
  }

  private getDefBuff(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/def_buff.png',
      type: this.effects.defBuff,
      duration: turns,
      passive: true,
      m: 1.5,
    };
  }

  getDebuffDmg(name: string, int: number, m: number): number {
    return {
      [this.effects.burning]: this.getNumberForCommonEffects(int, m),
      [this.effects.freezing]: this.getNumberForCommonEffects(int, m),
      [this.effects.root]: this.getNumberForCommonEffects(int, m),
      [this.effects.defDestroy]: this.getNumberForCommonEffects(int, m),
      [this.effects.bleeding]: this.getNumberForCommonEffects(int, m),
      [this.effects.poison]: this.getNumberForCommonEffects(int, m),
      [this.effects.healthRestore]: this.getNumberForCommonEffects(int, m),
    }[name] as number;
  }
}
