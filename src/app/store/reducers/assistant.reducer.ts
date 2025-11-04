import { AssistantRecord, AssistantState, StoreNames } from '../store.interfaces';
import { createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { AssistantActions } from '../actions/assistant.actions';
import { createSelectLoading } from '../selectors/assistant.selectors';

export const assistantRecordsAdapter = createEntityAdapter<AssistantRecord>();

const assistantRecordsInitialState = assistantRecordsAdapter.getInitialState({
  loading: false,
});

export const AssistantInitialState: AssistantState = {
  records: assistantRecordsInitialState,
};

export const AssistantFeature = createFeature({
  name: StoreNames.assistant,
  reducer: createReducer(
    AssistantInitialState,
    on(AssistantActions.addRequest, (state, action) => {
      return { ...state, records: assistantRecordsAdapter.addOne(action.data, state.records) };
    }),
    on(AssistantActions.resetRequests, state => {
      return { ...state, records: assistantRecordsAdapter.removeAll(state.records) };
    }),
    on(AssistantActions.toggleLoading, state => {
      return { ...state, records: { ...state.records, loading: !state.records.loading } };
    }),
  ),
  extraSelectors: baseSelectors => {
    const assistantSelectors = assistantRecordsAdapter.getSelectors(baseSelectors.selectRecords);

    return {
      selectRecordsLoading: () => createSelectLoading(baseSelectors.selectRecords),
      selectAssistantRecords: assistantSelectors.selectAll,
    };
  },
});

export const { selectRecordsLoading, selectAssistantRecords } = AssistantFeature;
