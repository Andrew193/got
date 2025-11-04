import { inject, Injectable } from '@angular/core';
import { AssistantMemory, Memory } from '../../../models/interfaces/assistant.interface';
import { MemoryMapsService } from './helpers/memory-maps.service';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private memoryMapService = inject(MemoryMapsService);

  private memoryType: AssistantMemory = AssistantMemory.taverna;
  private memory: Memory = this.memoryMapService.getMemory(this.memoryType);

  setMemoryType(type: AssistantMemory) {
    this.memoryType = type;
    this.memory = this.memoryMapService.getMemory(this.memoryType);
  }

  getMemory() {
    return this.memory;
  }

  getResponseFromMemory(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    const response = new Map();

    for (const key in this.memory) {
      if (lowerCaseQuery.includes(key)) {
        response.set(key, this.memory[key]);
      }
    }

    if (response.size) {
      console.log(Array.from(response));
    }

    return "Sorry, I didn't understand your question.";
  }
}
