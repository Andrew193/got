import { Injectable } from '@angular/core';
import { AssistantMemory, Memory } from '../../../../models/interfaces/assistant.interface';

@Injectable({
  providedIn: 'root',
})
export class MemoryMapsService {
  private _baseMemory: Memory = {
    attack: 'The attack affects the damage dealt by this hero.',
    defence: 'Defense affects the amount of damage absorbed.',
    health: 'Health affects the survivability of this hero in battle.',
    rage: 'Rage affects the ability to impose a penalty on the enemy.',
    will: 'Will power affects the ability to resist penalties.',
    reduced: 'Absorption affects the amount of pure damage absorbed (stacks with defense).',
    mobility: 'Mobility affects the number of cells a hero can move in a turn.',
  };

  private tavernaMemory: Memory = {
    ...this._baseMemory,
  };

  getMemory(type: AssistantMemory) {
    if (type === AssistantMemory.taverna) {
      return this.tavernaMemory;
    }

    return {};
  }
}
