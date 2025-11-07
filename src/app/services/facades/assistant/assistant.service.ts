import { inject, Injectable } from '@angular/core';
import { AssistantMemory, Memory } from '../../../models/interfaces/assistant.interface';
import { MemoryMapsService } from './helpers/memory-maps.service';
import { AssistantRecord } from '../../../store/store.interfaces';
import { TextService } from '../../text/text.service';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private memoryMapService = inject(MemoryMapsService);
  private textService = inject(TextService);

  private memoryType!: AssistantMemory;
  private memory!: Memory;

  setMemoryType(type: AssistantMemory) {
    this.memoryType = type;
    this.memory = this.memoryMapService.getMemory(this.memoryType);
  }

  getMemory() {
    return this.memory;
  }

  getMemoryKeys() {
    return Object.keys(this.getMemory());
  }

  getResponseFromMemory(query: string, callback?: (responseParts: Map<string, string>) => void) {
    const lowerCaseQuery = query.toLowerCase();
    const responseParts = new Map();

    for (const key in this.memory) {
      if (lowerCaseQuery.includes(key)) {
        responseParts.set(key, this.memory[key]);
      }
    }

    if (responseParts.size) {
      const response = `Of course, let me explain. `;

      callback && callback(responseParts);

      return (
        response +
        [
          ...responseParts.values(),
          `If there's anything else you'd like to tell me, don't hesitate to ask.`,
        ].join('')
      );
    }

    callback && callback(responseParts);

    return "Sorry, I didn't understand your question.";
  }

  createRequest(message: string, request: boolean): AssistantRecord {
    const preparedMessage = request ? message : this.getResponseFromMemory(message);
    const keywords = this.textService.getKeywordsFromText(preparedMessage, this.getMemoryKeys());

    return {
      message: preparedMessage,
      request,
      keywords,
      assistantMemoryType: this.memoryType,
      id: crypto.randomUUID(),
    };
  }
}
