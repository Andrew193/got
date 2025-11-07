import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AssistantRecord, StoreNames } from '../store.interfaces';
import { Keyword } from '../../models/taverna/taverna.model';
import { AssistantMemory } from '../../models/interfaces/assistant.interface';

export const AssistantActions = createActionGroup({
  source: StoreNames.assistant,
  events: {
    addRequest: props<{ data: AssistantRecord }>(),
    resetRequests: emptyProps(),
    toggleLoading: emptyProps(),
    addKeywords: props<{ data: Keyword[] }>(),
    updateKeyword: props<{ data: Keyword }>(),
    dropAssistant: props<{ memoryType: AssistantMemory }>(),
  },
});
