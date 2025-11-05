import { inject, Injectable } from '@angular/core';
import { AssistantMemory, Memory } from '../../../models/interfaces/assistant.interface';
import { MemoryMapsService } from './helpers/memory-maps.service';
import { AssistantRecord } from '../../../store/store.interfaces';

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
    const responseParts = new Map();

    for (const key in this.memory) {
      if (lowerCaseQuery.includes(key)) {
        responseParts.set(key, this.memory[key]);
      }
    }

    if (responseParts.size) {
      const response = `Of course, let me explain.`;

      return (
        response +
        [
          ...responseParts.values(),
          `If there's anything else you'd like to tell me, don't hesitate to ask.`,
        ].join('')
      );
    }

    return "Sorry, I didn't understand your question.";
  }

  createRequest(message: string, request: boolean): AssistantRecord {
    return {
      message: request ? message : this.getResponseFromMemory(message),
      request,
      id: crypto.randomUUID(),
    };
  }
}
