import { Injectable } from '@angular/core';
import { AssistantMemory, Memory } from '../../../../models/interfaces/assistant.interface';
import { ALL_EFFECTS, DEFENCE_REDUCTION, effectsDescriptions } from '../../../../constants';

export type SynonymsMap = Record<string, string[]>;

@Injectable({
  providedIn: 'root',
})
export class MemoryMapsService {
  private _synonyms: SynonymsMap = {
    willpower: ['will power'],
  };

  private _baseMemory: Memory = {
    attack: 'The attack affects the damage dealt by a hero.',
    defence: `Defense affects the amount of damage absorbed. It reduces dmg by ${DEFENCE_REDUCTION * 100}%. If your defense is 1000 points,
    then you can block 400 damage.`,
    health: `Health affects a hero's survivability in battle. While health is above 0, a hero can move and use abilities.
     If health is 0, a hero cannot do anything.`,
    rage: `Rage affects the ability to inflict a penalty on an opponent. If Rage equals or exceeds Will power, a penalty can be inflicted.`,
    willpower:
      'Will power affects the ability to resist penalties. If Will power exceeds Rage, a penalty can not be inflicted.',
    reduced: 'Absorption affects the amount of pure damage absorbed (stacks with defense).',
    mobility: 'Mobility affects the number of cells a hero can move in a turn.',
  };

  private tavernaMemory: Memory = {
    ...this._baseMemory,
    ...Object.fromEntries(
      Object.entries(effectsDescriptions(ALL_EFFECTS)).map(([key, value]) => {
        return [
          key.toLowerCase(),
          `${key} ${value[0].toLowerCase() + value.slice(1, value.length)}`,
        ];
      }),
    ),
    rarity:
      'There are 4 levels of rarity: Legendary, Epic, Rare and Common. Their power level is indicated by order.',
    type: `There are two types of heroes: Attack and Defence. Attack heroes deal damage, but they have low health
    and defense. Defense heroes are support heroes, but that doesn't mean they can't deal damage.`,
  };

  getMemory(type: AssistantMemory) {
    return this.addSynonymsToMemory(
      (() => {
        if (type === AssistantMemory.taverna) {
          return this.tavernaMemory;
        }

        return {};
      })(),
    );
  }

  addSynonymsToMemory(memory: Memory) {
    const toAdd: Memory = {};

    for (const alias in memory) {
      if (Object.hasOwn(this._synonyms, alias)) {
        for (const synonym of this._synonyms[alias]) {
          toAdd[synonym] = memory[alias];
        }
      }
    }

    return { ...memory, ...toAdd };
  }
}
