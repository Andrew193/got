import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AssistantRecord, StoreNames } from '../store.interfaces';

export const AssistantActions = createActionGroup({
  source: StoreNames.assistant,
  events: {
    addRequest: props<{ data: AssistantRecord }>(),
    resetRequests: emptyProps(),
    toggleLoading: emptyProps(),
  },
});
