import { inject, Injectable } from '@angular/core';
import {
  EqName,
  GearPart,
  HeroesNamesCodes,
  HeroType,
  SelectableUnit,
  Unit,
  UnitBasicStats,
} from '../../../../models/units-related/unit.model';
import { EffectsValues } from '../../../../constants';
import { EffectsService } from '../../../effects/effects.service';
import { NumbersService } from '../../../numbers/numbers.service';
import { Skill } from '../../../../models/units-related/skill.model';
import { Effect } from '../../../../models/effect.model';

type SkillForDescriptionCreation = Omit<Skill, 'description'>;

@Injectable({
  providedIn: 'root',
})
export class HeroesHelperService {
  eS = inject(EffectsService);
  numberService = inject(NumbersService);

  //Gear related
  gearDescriptions: Record<EqName, string> = {
    eq1: 'The breastplate is a very important piece of armor for any warrior.',
    eq2: "Scrags are a very important piece of armor for any warrior. You can't fight much with bare feet.",
    eq3: 'An amulet is a very important piece of armor for any warrior. Fortitude and faith are very important.',
    eq4: 'A relic of this hero. Gives a bonus to parameters.',
  };

  getGearDescription(name: EqName) {
    return this.gearDescriptions[name];
  }

  gearParts: GearPart[] = [
    { alias: 'healthIncrement', src: 'health_icon', color: 'health-color' },
    { alias: 'attackIncrement', src: 'attack_icon', color: 'attack-color' },
    { alias: 'defenceIncrement', src: 'def_icon', color: 'defence-color' },
  ];

  getGearLevelByName(name: EqName, hero: Unit) {
    return (
      {
        eq1: hero.eq1Level,
        eq2: hero.eq2Level,
        eq3: hero.eq3Level,
        eq4: hero.eq4Level,
      } satisfies Record<EqName, number>
    )[name];
  }

  get effects() {
    return this.eS.effects;
  }

  getBasicUserConfig() {
    return {
      x: 3,
      y: 6,
      user: true,
      canMove: true,
      canAttack: true,
      rank: 1,
      level: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
    };
  }

  //Up hero
  getEquipmentForUnit(unit: Unit): Unit {
    //Level
    const leveledUnit = {
      ...unit,
      attack: this.numberService.toFixed(unit.attack + unit.attackIncrement * unit.level),
      defence: this.numberService.toFixed(unit.defence + unit.defenceIncrement * unit.level),
      health: this.numberService.toFixed(unit.health + unit.healthIncrement * unit.level),
      rage: this.numberService.toFixed(unit.rage + (unit.level > 1 ? 2 * unit.level : 0)),
      willpower: this.numberService.toFixed(unit.willpower + (unit.level > 1 ? 2 * unit.level : 0)),
      dmgReducedBy: this.numberService.toFixed(
        this.numberService.toFixed(
          unit.dmgReducedBy * 100 + (unit.level > 1 ? 0.5 : 0) * unit.level,
        ) / 100,
        2,
      ),
    };

    //Rank
    let usedRank = 0;

    while (usedRank !== unit.rank) {
      usedRank++;
      leveledUnit.attack = this.numberService.toFixed(leveledUnit.attack * unit.rankBoost);
      leveledUnit.defence = this.numberService.toFixed(leveledUnit.defence * unit.rankBoost);
      leveledUnit.health = this.numberService.toFixed(leveledUnit.health * unit.rankBoost);
    }

    //Eq 1
    leveledUnit.attack += this.numberService.toFixed(
      leveledUnit.attackIncrement * leveledUnit.eq1Level,
    );
    leveledUnit.defence += this.numberService.toFixed(
      leveledUnit.defenceIncrement * leveledUnit.eq1Level,
    );
    leveledUnit.health += this.numberService.toFixed(
      leveledUnit.healthIncrement * leveledUnit.eq1Level,
    );
    //Eq 2
    leveledUnit.attack += this.numberService.toFixed(
      leveledUnit.attackIncrement * leveledUnit.eq2Level,
    );
    leveledUnit.defence += this.numberService.toFixed(
      leveledUnit.defenceIncrement * leveledUnit.eq2Level,
    );
    leveledUnit.health += this.numberService.toFixed(
      leveledUnit.healthIncrement * leveledUnit.eq2Level,
    );
    //Eq 3
    leveledUnit.attack += this.numberService.toFixed(
      leveledUnit.attackIncrement * leveledUnit.eq3Level,
    );
    leveledUnit.defence += this.numberService.toFixed(
      leveledUnit.defenceIncrement * leveledUnit.eq3Level,
    );
    leveledUnit.health += this.numberService.toFixed(
      leveledUnit.healthIncrement * leveledUnit.eq3Level,
    );
    //Eq 4
    leveledUnit.attack += this.numberService.toFixed(
      leveledUnit.attackIncrement * leveledUnit.eq4Level,
    );
    leveledUnit.defence += this.numberService.toFixed(
      leveledUnit.defenceIncrement * leveledUnit.eq4Level,
    );
    leveledUnit.health += this.numberService.toFixed(
      leveledUnit.healthIncrement * leveledUnit.eq4Level,
    );

    leveledUnit.maxHealth = leveledUnit.health;

    return leveledUnit;
  }

  getRank(level: number) {
    return level <= 10
      ? 1
      : level <= 20
        ? 2
        : level <= 30
          ? 3
          : level <= 40
            ? 4
            : level <= 50
              ? 5
              : 6;
  }

  getEffectsToHighlight() {
    return this.eS.effectsToHighlight;
  }

  getEffectsDescription(effect: EffectsValues) {
    return this.eS.effectsDescriptions[effect];
  }

  getSelectableUnit(units: Unit[]): SelectableUnit[] {
    return units.map(_ => ({ name: _.name, imgSrc: _.imgSrc }));
  }

  getHeroBasicStats(unitType: HeroesNamesCodes): UnitBasicStats {
    const configMap: Record<HeroesNamesCodes, Omit<UnitBasicStats, 'name'>> = {
      [HeroesNamesCodes.LadyOfDragonStone]: {
        attackRange: 2,
        rankBoost: 1.3,
        dmgReducedBy: 0.25,
        canCross: 2,
        maxCanCross: 2,
        health: 11237,
        healthIncrement: 195,
        maxHealth: 11237,
        attack: 1899,
        attackIncrement: 23,
        defence: 1585,
        defenceIncrement: 15,
        rage: 50,
        willpower: 35,
        ignoredDebuffs: [this.effects.burning, this.effects.bleeding],
        reducedDmgFromDebuffs: [this.effects.poison],
      },
      [HeroesNamesCodes.RedKeepAlchemist]: {
        attackRange: 4,
        rankBoost: 1.2,
        dmgReducedBy: 0,
        canCross: 4,
        maxCanCross: 4,
        health: 6237,
        healthIncrement: 95,
        maxHealth: 6237,
        attack: 2899,
        attackIncrement: 43,
        defence: 685,
        defenceIncrement: 4,
        rage: 80,
        willpower: 0,
        ignoredDebuffs: [this.effects.burning, this.effects.bleeding, this.effects.poison],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.TargaryenKnight]: {
        attackRange: 1,
        rankBoost: 1.2,
        dmgReducedBy: 0.25,
        canCross: 2,
        maxCanCross: 2,
        health: 18837,
        healthIncrement: 284,
        attack: 829,
        attackIncrement: 11,
        defence: 2985,
        defenceIncrement: 29,
        maxHealth: 15837,
        rage: 25,
        willpower: 50,
        ignoredDebuffs: [this.effects.burning],
        reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      },
      [HeroesNamesCodes.WhiteWolf]: {
        attackRange: 1,
        rankBoost: 1.1,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 5837,
        healthIncrement: 98,
        attack: 1029,
        attackIncrement: 13,
        defence: 785,
        defenceIncrement: 6,
        maxHealth: 5837,
        rage: 15,
        willpower: 10,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.Priest]: {
        attackRange: 1,
        rankBoost: 1.15,
        dmgReducedBy: 0.15,
        canCross: 2,
        maxCanCross: 2,
        health: 9737,
        healthIncrement: 37,
        attack: 699,
        attackIncrement: 4,
        defence: 1499,
        defenceIncrement: 9,
        maxHealth: 9737,
        rage: 0,
        willpower: 70,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.BrownWolf]: {
        attackRange: 1,
        rankBoost: 1.05,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 4837,
        healthIncrement: 47,
        attack: 899,
        attackIncrement: 9,
        defence: 685,
        defenceIncrement: 3,
        maxHealth: 4837,
        rage: 0,
        willpower: 0,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.IceRiverHunter]: {
        attackRange: 1,
        rankBoost: 1.1,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 8370,
        healthIncrement: 100,
        attack: 1199,
        attackIncrement: 14,
        defence: 985,
        defenceIncrement: 12,
        maxHealth: 8370,
        rage: 15,
        willpower: 20,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.RelinaShow]: {
        attackRange: 2,
        rankBoost: 1.1,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 19169,
        healthIncrement: 189,
        attack: 1999,
        attackIncrement: 23,
        defence: 1795,
        defenceIncrement: 19,
        maxHealth: 19169,
        rage: 35,
        willpower: 30,
        ignoredDebuffs: [this.effects.poison, this.effects.freezing, this.effects.root],
        reducedDmgFromDebuffs: [this.effects.bleeding],
      },
      [HeroesNamesCodes.FreeTrapper]: {
        attackRange: 2,
        rankBoost: 1.1,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 8169,
        healthIncrement: 89,
        attack: 1299,
        attackIncrement: 12,
        defence: 995,
        defenceIncrement: 10,
        maxHealth: 8169,
        rage: 20,
        willpower: 20,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [this.effects.poison],
      },
      [HeroesNamesCodes.Giant]: {
        attackRange: 1,
        rankBoost: 1.05,
        dmgReducedBy: 0.5,
        canCross: 1,
        maxCanCross: 1,
        health: 33837,
        healthIncrement: 590,
        attack: 3529,
        attackIncrement: 19,
        defence: 6385,
        defenceIncrement: 29,
        maxHealth: 33837,
        rage: 60,
        willpower: 15,
        ignoredDebuffs: [this.effects.freezing],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.NightKing]: {
        attackRange: 2,
        rankBoost: 1.3,
        dmgReducedBy: 0.5,
        canCross: 4,
        maxCanCross: 4,
        health: 19937,
        healthIncrement: 312,
        attack: 2329,
        attackIncrement: 25,
        defence: 2085,
        defenceIncrement: 19,
        maxHealth: 19937,
        rage: 125,
        willpower: 150,
        ignoredDebuffs: [this.effects.freezing],
        reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      },
      [HeroesNamesCodes.WhiteWalkerGeneral]: {
        attackRange: 1,
        rankBoost: 1.2,
        dmgReducedBy: 0.3,
        canCross: 3,
        maxCanCross: 3,
        health: 15937,
        healthIncrement: 219,
        attack: 2129,
        attackIncrement: 16,
        defence: 1985,
        defenceIncrement: 15,
        maxHealth: 15937,
        rage: 105,
        willpower: 120,
        ignoredDebuffs: [this.effects.freezing],
        reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      },
      [HeroesNamesCodes.WhiteWalkerCapitan]: {
        attackRange: 1,
        rankBoost: 1.1,
        dmgReducedBy: 0.15,
        canCross: 2,
        maxCanCross: 2,
        health: 11937,
        healthIncrement: 145,
        attack: 1829,
        attackIncrement: 15,
        defence: 1655,
        defenceIncrement: 12,
        maxHealth: 11937,
        rage: 75,
        willpower: 95,
        ignoredDebuffs: [this.effects.freezing],
        reducedDmgFromDebuffs: [],
      },
      [HeroesNamesCodes.JonKing]: {
        attackRange: 1,
        rankBoost: 1.3,
        dmgReducedBy: 0.1,
        canCross: 2,
        maxCanCross: 2,
        health: 12837,
        healthIncrement: 219,
        attack: 1729,
        attackIncrement: 18,
        defence: 1385,
        defenceIncrement: 14,
        maxHealth: 12837,
        rage: 25,
        willpower: 25,
        ignoredDebuffs: [this.effects.freezing, this.effects.attackBreak],
        reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.burning],
      },
      [HeroesNamesCodes.DailyBossVersion1]: {
        attackRange: 1,
        rankBoost: 1.5,
        dmgReducedBy: 0.25,
        canCross: 3,
        maxCanCross: 3,
        health: 39237,
        healthIncrement: 3195,
        attack: 1829,
        attackIncrement: 23,
        defence: 1485,
        defenceIncrement: 15,
        maxHealth: 39237,
        rage: 145,
        willpower: 50,
        ignoredDebuffs: [this.effects.burning],
        reducedDmgFromDebuffs: [this.effects.bleeding],
      },
      [HeroesNamesCodes.Ranger]: {
        attackRange: 1,
        rankBoost: 1,
        dmgReducedBy: 0,
        canCross: 2,
        maxCanCross: 2,
        health: 8169,
        healthIncrement: 89,
        attack: 1299,
        attackIncrement: 12,
        defence: 995,
        defenceIncrement: 10,
        maxHealth: 8169,
        rage: 20,
        willpower: 20,
        ignoredDebuffs: [],
        reducedDmgFromDebuffs: [],
      },
    };

    return { ...configMap[unitType], name: unitType };
  }

  getPassiveSkillDescription(
    unitType: HeroesNamesCodes,
    effects: Effect[] = [],
    passiveEffects?: Effect[],
  ) {
    const base = this.getHeroBasicStats(unitType);
    let description = '';

    if (base.dmgReducedBy) {
      description += `Takes ${this.numberService.convertToPersent(base.dmgReducedBy)}% less damage from enemy attacks.`;
    }

    if (base.reducedDmgFromDebuffs.length) {
      description += `Takes 25% less damage from ${base.reducedDmgFromDebuffs.length === 1 ? 'debuff' : 'debuffs'}:
      ${base.reducedDmgFromDebuffs.join(', ')}.`;
    }

    if (base.ignoredDebuffs.length) {
      description += `This hero is immune to: ${base.ignoredDebuffs.join(', ')}.`;
    }

    if (effects.length) {
      const effectsConfig = this.convertEffectsToDescriptionString(effects);

      description += `Receives: ${effectsConfig} at the start of the game.`;
    }

    if (passiveEffects && passiveEffects.length) {
      const effectsConfig = this.convertEffectsToDescriptionString(passiveEffects);

      description += `At the start of each turn receives: ${effectsConfig}.`;
    }

    if (base.attackRange > 1) {
      description += `Can attack from a distance of ${base.attackRange} cells.`;
    }

    return description.replaceAll('.', '. ');
  }

  getAndSetSkillDescription(heroType: HeroType) {
    return (skill: SkillForDescriptionCreation) => {
      let description = '';

      // @ts-ignore
      let dmgPersent = this.numberService.convertToPersent(!skill.passive ? skill.dmgM : 0);
      const primaryStat = heroType === HeroType.DEFENCE ? 'defence' : 'attack';

      description += `Deals ${dmgPersent}% of ${primaryStat} damage to an enemy.`;

      if (skill.heal) {
        dmgPersent = this.numberService.convertToPersent(skill.heal.healM);
        description += `Before attacking, restores ${skill.heal.healAll ? 'all allies' : 'an ally'} health equal to ${dmgPersent}% of ${skill.heal.healAll ? 'their' : `this ally`} maximum health.`;
      }

      if (skill.buffs) {
        description += `Receives: ${this.convertEffectsToDescriptionString(skill.buffs)} ${skill.addBuffsBeforeAttack ? 'before attack' : 'after attack'}.`;
      }

      if (skill.debuffs?.length) {
        description += `Applies to them: ${this.convertEffectsToDescriptionString(skill.debuffs)}.`;
      }

      if (skill.attackInRange) {
        dmgPersent = this.numberService.convertToPersent(skill.attackInRange.attackInRangeM);
        description += `Also attacks enemies within ${skill.attackInRange.attackRange} ${skill.attackInRange.attackRange > 1 ? 'cells' : 'cell'} radius for ${dmgPersent}% of ${primaryStat}.`;
      }

      if (skill.inRangeDebuffs) {
        const debuffsConfig = this.convertEffectsToDescriptionString(skill.inRangeDebuffs);

        description += `Applies to them: ${debuffsConfig}.`;
      }

      if (skill.activateDebuffs && skill.activateDebuffs.length) {
        description += `Activates: ${skill.activateDebuffs.join(',')}. On the target.`;
      }

      if (skill.extendsBuffs && skill.extendsBuffs.length) {
        description += `Extends the duration of: ${skill.extendsBuffs.join(',')}. On the team by ${skill.extendsBuffsBy || 1} turn(s).`;
      }

      return { ...skill, description: description.replaceAll('.', '. ') } as Skill;
    };
  }

  convertEffectsToDescriptionString(effects: Effect[]) {
    const effectsMap = new Map<string, string>();

    effects.forEach(effect => {
      if (!effectsMap.has(effect.type)) {
        effectsMap.set(
          effect.type,
          `${effect.type} for ${effect.duration} ${effect.duration > 1 ? 'turns' : 'turn'} (1)`,
        );
      } else {
        const value = effectsMap.get(effect.type) as string;
        const amount = +value.slice(value.indexOf('(') + 1, value.length - 1);

        effectsMap.set(
          effect.type,
          `${effect.type} for ${effect.duration} ${effect.duration > 1 ? 'turns' : 'turn'} (${amount + 1})`,
        );
      }
    });

    return Array.from(effectsMap.values()).join(', ');
  }
}
