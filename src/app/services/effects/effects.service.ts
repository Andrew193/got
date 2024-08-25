import {Injectable} from '@angular/core';
import {Unit} from "../../models/unit.model";
import {Skill} from "../../models/skill.model";
import {Effect} from "../../models/effect.model";
import {heroType} from "../heroes/heroes.service";

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
    defDestroy: "Коррозия брони",
    root: "Корень",
  }

  effectsDescriptions: {[key: string]: string} = {
    'Горение': "Наносит противнику урон в размере 10% от его здоровья каждый ход.",
    'Заморозка': "Герой заморожен и может пройти только 1 клетку за ход.",
    'Восстановление': "Восстановливает 5% здоровья каждый ход.",
    'Разлом брони': "Защита героя снижается на 50 ед. за ход.",
    'Кровотечение': "Наносит противнику урон в размере 5% от его здоровья каждый ход.",
    'Отравление': "Наносит противнику урон в размере 7.5% от его здоровья каждый ход.",
    'Бонус атаки': "Увеличивает атаку героя на 50%.",
    'Бонус защиты': "Увеличивает защиту героя на 50%.",
    'Заржавелый Меч': "Уменьшает атаку героя на 50%.",
    'Коррозия брони': "Уменьшает защиту героя на 50%.",
    'Корень': "Герой скован корнями и не может двигаться.",
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
    if (effect.type === this.effects.root) {
      unit.canCross = 0;
      message = unit.health ? `Герой скован корнями и не может двигаться.` : '';
    }
    if (effect.type === this.effects.defDestroy && effect.defBreak) {
      unit.defence += effect.defBreak;
      message = unit.health ? `Защита героя ${unit.name} была снижена на ${effect.defBreak} ед. из-за штрафа ${effect.type}.` : '';
    }
    return {unit, message: message};
  }

  restoreStatsAfterEffect(effect: Effect, config: { unit: Unit, message: string }) {
    let message = "";
    if (effect.type === this.effects.freezing
      || effect.type === this.effects.root) {
      config.unit.canCross = config.unit.maxCanCross;
      message = config.unit.health ? `Герой ${config.unit.name} восстановил мобильность!` : '';
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

  getBoostedParameterCover(unit: Unit, effects: Effect[]) {
    const isAttackHero = unit.heroType === heroType.ATTACK;
    return this.getBoostedParameter(isAttackHero ? unit.attack : unit.defence, effects, isAttackHero ? this.effects.attackBuff : this.effects.defBuff);
  }

  getBoostedParameter(parameter: number, effects: Effect[], type: string) {
    const shouldBoostAttack = effects.findIndex((effect) => effect.type === type);
    return shouldBoostAttack !== -1 ? parameter * 1.5 : parameter;
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
      imgSrc: "../../../assets/resourses/imgs/buffs/health_restore_buff.png",
      type: this.effects.healthRestore,
      duration: turns,
      m: 0.05,
      restore: true
    }
  }

  getBurning(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/burning.png",
      type: this.effects.burning,
      duration: turns,
      m: 0.1
    }
  }

  getFreezing(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/freezing_debuff.png",
      type: this.effects.freezing,
      duration: turns,
      m: 0,
    }
  }

  getRoot(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/root.png",
      type: this.effects.root,
      duration: turns,
      m: 0,
    }
  }

  getDefenceDestroy(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/def_destroy.png",
      type: this.effects.defDestroy,
      duration: turns,
      m: 0,
      defBreak: -50
    }
  }

  getPoison(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/poison.png",
      type: this.effects.poison,
      duration: turns,
      m: 0.075
    }
  }

  getBleeding(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/bleeding.png",
      type: this.effects.bleeding,
      duration: turns,
      m: 0.05
    }
  }

  getDefBreak(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/def_break.png",
      type: this.effects.defBreak,
      duration: turns,
      passive: true,
      m: 0.5
    }
  }

  getAttackBreak(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/debuffs/attack_break.png",
      type: this.effects.attackBreak,
      duration: turns,
      passive: true,
      m: 0.5
    }
  }

  getAttackBuff(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/buffs/attack_buff.png",
      type: this.effects.attackBuff,
      duration: turns,
      passive: true,
      m: 1.5
    }
  }

  getDefBuff(turns = 2): Effect {
    return {
      imgSrc: "../../../assets/resourses/imgs/buffs/def_buff.png",
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
      [this.effects.root]: this.getNumberForCommonEffects(health, m),
      [this.effects.defDestroy]: this.getNumberForCommonEffects(health, m),
      [this.effects.bleeding]: this.getNumberForCommonEffects(health, m),
      [this.effects.poison]: this.getNumberForCommonEffects(health, m),
      [this.effects.healthRestore]: this.getNumberForCommonEffects(health, m)
    }[name] as number
  }
}
