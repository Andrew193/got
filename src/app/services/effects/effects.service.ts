import { inject, Injectable } from '@angular/core';
import { TileUnitSkill } from '../../models/units-related/skill.model';
import { Effect, EffectForMult } from '../../models/effect.model';
import {
  ALL_EFFECTS,
  ALL_EFFECTS_MULTIPLIERS,
  ALL_MOBILITY_EFFECTS_MULTIPLIERS,
  Effects,
  effectsDescriptions,
  EffectsValues,
  MobilityEffects,
} from '../../constants';
import { NumbersService } from '../numbers/numbers.service';
import { TileUnit } from '../../models/field.model';
import { HeroType } from '../../models/units-related/unit.model';

@Injectable({
  providedIn: 'root',
})
export class EffectsService {
  private numberService = inject(NumbersService);

  effects: Effects = structuredClone(ALL_EFFECTS);

  effectsDescriptions: Record<EffectsValues, string> = effectsDescriptions(this.effects);

  get effectsToHighlight() {
    return Object.values(this.effects);
  }

  getMobilityStatsBasedOnEffect(effect: Effect, unit: TileUnit) {
    let message = '';
    const mobility: MobilityEffects[] = [this.effects.freezing, this.effects.root];

    // @ts-ignore
    if (mobility.includes(effect.type)) {
      const type = effect.type as MobilityEffects;

      unit.canCross = ALL_MOBILITY_EFFECTS_MULTIPLIERS[type];
      message += unit.health ? this.effectsDescriptions[effect.type] : '';
    }

    return { unit, message: message };
  }

  recountStatsBasedOnEffect(effect: Effect, unit: TileUnit) {
    const result = this.getMobilityStatsBasedOnEffect(effect, unit);
    let message = result.message;

    unit = result.unit;

    if (effect.type === this.effects.defDestroy && effect.defDestroy) {
      unit.defence += effect.defDestroy;
      message += unit.health
        ? `Hero's Defense ${unit.name} was reduced by ${effect.defDestroy}, due to ${effect.type}.`
        : '';
    }

    return { unit, message: message };
  }

  restoreStatsAfterEffect(effect: Effect, config: { unit: TileUnit; message: string }) {
    let message = '';

    if (effect.type === this.effects.freezing || effect.type === this.effects.root) {
      config.unit.canCross = config.unit.maxCanCross;
      message = config.unit.health ? `Unit ${config.unit.name} restored mobility!` : '';
    }

    return { unit: config.unit, message: message ? message : config.message };
  }

  getMultForEffect(effect: EffectForMult) {
    const map = {
      [this.effects.defBreak]: this.getDefBreak().m,
      [this.effects.attackBreak]: this.getAttackBreak().m,
    } as const satisfies Record<EffectForMult['type'], number>;

    return map[effect.type];
  }

  getEffectsWithIgnoreFilter(unit: TileUnit, skill: TileUnitSkill, addRangeEffects = false) {
    const debuffsToSet = (addRangeEffects ? skill.inRangeDebuffs : skill.debuffs)?.filter(
      debuff => !unit.ignoredDebuffs.includes(debuff.type),
    );

    return [...unit.effects, ...(debuffsToSet || [])];
  }

  getBoostedParameterCover(unit: TileUnit, effects: Effect[]) {
    const isAttackHero = unit.heroType === HeroType.ATTACK;

    return this.getBoostedParameter(
      isAttackHero ? unit.attack : unit.defence,
      effects,
      isAttackHero ? this.effects.attackBuff : this.effects.defBuff,
    );
  }

  private getBoostedParameter(parameter: number, effects: Effect[], type: EffectsValues) {
    const effect = effects.find(effect => effect.type === type);

    return this.numberService.getRoundMin(parameter * (effect?.m || 1));
  }

  getHealthAfterDmg(health: number, dmg: number) {
    return Math.round(health - dmg > 0 ? health - dmg : 0);
  }

  getHealthAfterRestore(health: number, maxHealth: number) {
    return this.numberService.getRoundMin(health, maxHealth);
  }

  getNumberForCommonEffects(int: number, m: number) {
    return this.numberService.toFixed(int * m);
  }

  getEffect(effectType: EffectsValues, turns?: number, count?: 0): Effect;
  getEffect(effectType: EffectsValues, turns: number, count: number): Effect[];
  getEffect(effectType: EffectsValues, turns = 2, count = 0): Effect | Effect[] {
    if (count > 0) {
      return new Array(count).fill(0).map(() => this.effectsMap[effectType](turns));
    }

    return this.effectsMap[effectType](turns);
  }

  effectsMap: Record<EffectsValues, (turns: number) => Effect> = {
    //Buffs
    [this.effects.healthRestore]: (turns: number) => this.getHealthRestore(turns),
    //Mobility
    [this.effects.freezing]: (turns: number) => this.getFreezing(turns),
    [this.effects.root]: (turns: number) => this.getRoot(turns),
    //Debuffs
    [this.effects.burning]: (turns: number) => this.getBurning(turns),
    [this.effects.poison]: (turns: number) => this.getPoison(turns),
    [this.effects.bleeding]: (turns: number) => this.getBleeding(turns),
    //Deff
    [this.effects.defBreak]: (turns: number) => this.getDefBreak(turns),
    [this.effects.defDestroy]: (turns: number) => this.getDefenceDestroy(turns),
    [this.effects.defBuff]: (turns: number) => this.getDefBuff(turns),
    //Attack
    [this.effects.attackBreak]: (turns: number) => this.getAttackBreak(turns),
    [this.effects.attackBuff]: (turns: number) => this.getAttackBuff(turns),
  };

  private getHealthRestore(turns = 1): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/health_restore_buff.png',
      type: this.effects.healthRestore,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.healthRestore],
      restore: true,
    };
  }

  private getBurning(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/burning.png',
      type: this.effects.burning,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.burning],
    };
  }

  private getFreezing(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/freezing_debuff.png',
      type: this.effects.freezing,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.freezing],
    };
  }

  private getRoot(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/root.png',
      type: this.effects.root,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.root],
    };
  }

  private getDefenceDestroy(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/def_destroy.png',
      type: this.effects.defDestroy,
      duration: turns,
      m: 0,
      defDestroy: ALL_EFFECTS_MULTIPLIERS[this.effects.defDestroy],
    };
  }

  private getPoison(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/poison.png',
      type: this.effects.poison,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.poison],
    };
  }

  private getBleeding(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/bleeding.png',
      type: this.effects.bleeding,
      duration: turns,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.bleeding],
    };
  }

  private getDefBreak(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/def_break.png',
      type: this.effects.defBreak,
      duration: turns,
      passive: true,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.defBreak],
    };
  }

  private getAttackBreak(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/debuffs/attack_break.png',
      type: this.effects.attackBreak,
      duration: turns,
      passive: true,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.attackBreak],
    };
  }

  private getAttackBuff(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/attack_buff.png',
      type: this.effects.attackBuff,
      duration: turns,
      passive: true,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.attackBuff],
    };
  }

  private getDefBuff(turns = 2): Effect {
    return {
      imgSrc: '../../../assets/resourses/imgs/buffs/def_buff.png',
      type: this.effects.defBuff,
      duration: turns,
      passive: true,
      m: ALL_EFFECTS_MULTIPLIERS[this.effects.defBuff],
    };
  }

  getDebuffDmg(name: EffectsValues, int: number, m: number): number {
    const map: Record<EffectsValues, number> = {
      //Buffs
      [this.effects.healthRestore]: this.getNumberForCommonEffects(int, m),
      //Debuffs
      [this.effects.burning]: this.getNumberForCommonEffects(int, m),
      [this.effects.bleeding]: this.getNumberForCommonEffects(int, m),
      [this.effects.poison]: this.getNumberForCommonEffects(int, m),
      //Mobility
      [this.effects.freezing]: this.getNumberForCommonEffects(int, m),
      [this.effects.root]: this.getNumberForCommonEffects(int, m),
      //Defence
      [this.effects.defBreak]: 1,
      [this.effects.defBuff]: 1,
      [this.effects.defDestroy]: this.getNumberForCommonEffects(int, m),
      //Attack
      [this.effects.attackBuff]: 1,
      [this.effects.attackBreak]: 1,
    };

    return map[name];
  }
}
