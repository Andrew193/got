import { inject, Injectable } from '@angular/core';
import {
  EqName,
  GearPart,
  SelectableUnit,
  Unit,
} from '../../../../models/units-related/unit.model';
import { EffectsValues } from '../../../../constants';
import { EffectsService } from '../../../effects/effects.service';

@Injectable({
  providedIn: 'root',
})
export class HeroesHelperService {
  eS = inject(EffectsService);

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

  getEquipmentForUnit(unit: Unit): Unit {
    //Level
    const leveledUnit = {
      ...unit,
      attack: +(unit.attack + unit.attackIncrement * unit.level).toFixed(0),
      defence: +(unit.defence + unit.defenceIncrement * unit.level).toFixed(0),
      health: +(unit.health + unit.healthIncrement * unit.level).toFixed(0),
      rage: +(unit.rage + (unit.level > 1 ? 2 * unit.level : 0)).toFixed(0),
      willpower: +(unit.willpower + (unit.level > 1 ? 2 * unit.level : 0)).toFixed(0),
      dmgReducedBy: +(
        +(unit.dmgReducedBy * 100 + (unit.level > 1 ? 0.5 : 0) * unit.level).toFixed(0) / 100
      ).toFixed(2),
    };

    //Rank
    let usedRank = 0;

    while (usedRank !== unit.rank) {
      usedRank++;
      leveledUnit.attack = +(leveledUnit.attack * unit.rankBoost).toFixed(0);
      leveledUnit.defence = +(leveledUnit.defence * unit.rankBoost).toFixed(0);
      leveledUnit.health = +(leveledUnit.health * unit.rankBoost).toFixed(0);
    }

    //Eq 1
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq1Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq1Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq1Level).toFixed(0);
    //Eq 2
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq2Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq2Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq2Level).toFixed(0);
    //Eq 3
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq3Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq3Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq3Level).toFixed(0);
    //Eq 4
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq4Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq4Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq4Level).toFixed(0);

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
}
