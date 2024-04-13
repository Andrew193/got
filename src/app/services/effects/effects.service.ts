import {Injectable} from '@angular/core';
import {Unit} from "../../models/unit.model";
import {Skill} from "../../models/skill.model";
import {Effect} from "../../models/effect.model";

@Injectable({
  providedIn: 'root'
})
export class EffectsService {
  effects = {
    burning: "Горение",
    freezing: "Заморозка",
    healthRestore: "Восстановление",
    defBreak: "Разлом брони",
    bleeding: "Кровотечение",
    poison: "Отравление",
    attackBuff: "Бонус атаки",
    defBuff: "Бонус защиты",
    attackBreak: "Заржавелый Меч",
    defDestroy: "Коррозия брони"
  }

  constructor() {
  }

  get effectsToHighlight() {
    return Object.values(this.effects)
  }

  recountStatsBasedOnEffect(effect: Effect, unit: Unit) {
    let message = "";
    if (effect.type === this.effects.freezing) {
      unit.canCross = 1;
      message = unit.health ? `Герой заморожен и может пройти только 1 клетку за ход.` : '';
    }
    if (effect.type === this.effects.defDestroy && effect.defBreak) {
      unit.defence += effect.defBreak;
      message = unit.health ? `Защита героя ${unit.name} была снижена на ${effect.defBreak} ед. из-за штрафа ${effect.type}.` : '';
    }
    return {unit, message: message};
  }

  restoreStatsAfterEffect(effect: Effect, config: { unit: Unit, message: string }) {
    let message = "";
    if (effect.type === this.effects.freezing) {
      config.unit.canCross = config.unit.maxCanCross;
      message = config.unit.health ? `Герой ${config.unit.name} разморожен!` : '';
    }
    return {unit: config.unit, message: message ? message : config.message};
  }

  getMultForEffect(effect: Effect) {
    return {
      [this.effects.defBreak]: this.getDefBreak().m,
      [this.effects.attackBreak]: this.getAttackBreak().m
    }[effect.type]
  }

  getEffectsWithIgnoreFilter(unit: Unit, skill: Skill, addRangeEffects = false) {
    const debuffsToSet = (addRangeEffects ? skill.inRangeDebuffs : skill.debuffs)?.filter((debuff) => !unit.ignoredDebuffs.includes(debuff.type))
    return [...unit.effects, ...(debuffsToSet || [])]
  }

  getBoostedAttack(attack: number, effects: Effect[]) {
    const shouldBoostAttack = effects.findIndex((effect) => effect.type === this.effects.attackBuff);
    return shouldBoostAttack !== -1 ? attack * 1.5 : attack;
  }

  getBoostedDefence(defence: number, effects: Effect[]) {
    const shouldBoostAttack = effects.findIndex((effect) => effect.type === this.effects.defBuff);
    return shouldBoostAttack !== -1 ? defence * 1.5 : defence;
  }

  getHealthAfterDmg(health: number, dmg: number) {
    return +((health - dmg) > 0 ? health - dmg : 0).toFixed(0);
  }

  getHealthAfterRestore(health: number, maxHealth: number) {
    return +(health > maxHealth ? maxHealth : health).toFixed(0);
  }

  getNumberForCommonEffects(health: number, m: number) {
    return +(health * m).toFixed(0)
  }

  getHealthRestore(turns = 1): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/health_restore_buff.png",
      type: this.effects.healthRestore,
      duration: turns,
      m: 0.05,
      restore: true
    }
  }

  getBurning(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/burning.png",
      type: this.effects.burning,
      duration: turns,
      m: 0.1
    }
  }

  getFreezing(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/freezing_debuff.png",
      type: this.effects.freezing,
      duration: turns,
      m: 0,
    }
  }

  getDefenceDestroy(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/def_destroy.png",
      type: this.effects.defDestroy,
      duration: turns,
      m: 0,
      defBreak: -50
    }
  }

  getPoison(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/poison.png",
      type: this.effects.poison,
      duration: turns,
      m: 0.075
    }
  }

  getBleeding(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/bleeding.png",
      type: this.effects.bleeding,
      duration: turns,
      m: 0.05
    }
  }

  getDefBreak(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/def_break.png",
      type: this.effects.defBreak,
      duration: turns,
      passive: true,
      m: 0.5
    }
  }

  getAttackBreak(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/attack_break.png",
      type: this.effects.attackBreak,
      duration: turns,
      passive: true,
      m: 0.5
    }
  }

  getAttackBuff(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/attack_buff.png",
      type: this.effects.attackBuff,
      duration: turns,
      passive: true,
      m: 1.5
    }
  }

  getDefBuff(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/icons/def_buff.png",
      type: this.effects.defBuff,
      duration: turns,
      passive: true,
      m: 1.5
    }
  }

  getDebuffDmg(name: string, health: number, m: number): number {
    return {
      [this.effects.burning]: this.getNumberForCommonEffects(health, m),
      [this.effects.freezing]: this.getNumberForCommonEffects(health, m),
      [this.effects.defDestroy]: this.getNumberForCommonEffects(health, m),
      [this.effects.bleeding]: this.getNumberForCommonEffects(health, m),
      [this.effects.poison]: this.getNumberForCommonEffects(health, m),
      [this.effects.healthRestore]: this.getNumberForCommonEffects(health, m)
    }[name] as number
  }
}
