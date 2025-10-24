import { inject, Injectable } from '@angular/core';
import { Unit } from '../../../../models/units-related/unit.model';
import { EffectsValues } from '../../../../constants';
import { EffectsService } from '../../../effects/effects.service';

@Injectable({
  providedIn: 'root',
})
export class HeroesHelperService {
  eS = inject(EffectsService);

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

  getEffectsFromString(text: string) {
    const result = [];
    const effects = this.getEffectsToHighlight();

    for (const effect of effects) {
      if (text.includes(effect)) {
        result.push(`${effect} - ${this.getEffectsDescription(effect)}`);
      }
    }

    return result;
  }
}
