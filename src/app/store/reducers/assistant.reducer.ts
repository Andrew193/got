import { AssistantRecord, AssistantState, StoreNames } from '../store.interfaces';
import { createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { AssistantActions } from '../actions/assistant.actions';
import { createSelectLoading } from '../selectors/assistant.selectors';
import { Keyword } from '../../models/taverna/taverna.model';

export const assistantRecordsAdapter = createEntityAdapter<AssistantRecord>();
export const assistantKeywordsAdapter = createEntityAdapter<Keyword>({
  selectId: model => model.word,
});

const assistantRecordsInitialState = assistantRecordsAdapter.getInitialState({
  loading: false,
});
const assistantKeywordsInitialState = assistantKeywordsAdapter.getInitialState();

export const AssistantInitialState: AssistantState = {
  records: assistantRecordsInitialState,
  keywords: assistantKeywordsInitialState,
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
    on(AssistantActions.addKeywords, (state, action) => {
      const parsedKeywords = action.data.map(word => ({ word, active: false }) satisfies Keyword);

      return {
        ...state,
        keywords: assistantKeywordsAdapter.addMany(parsedKeywords, state.keywords),
      };
    }),
    on(AssistantActions.updateKeyword, (state, action) => {
      return {
        ...state,
        keywords: assistantKeywordsAdapter.updateOne(
          { id: action.data.word, changes: action.data },
          state.keywords,
        ),
      };
    }),
  ),
  extraSelectors: baseSelectors => {
    const assistantSelectors = assistantRecordsAdapter.getSelectors(baseSelectors.selectRecords);
    const assistantKeywordsSelectors = assistantKeywordsAdapter.getSelectors(
      baseSelectors.selectKeywords,
    );

    return {
      selectRecordsLoading: () => createSelectLoading(baseSelectors.selectRecords),
      selectAssistantRecords: assistantSelectors.selectAll,
      selectAllKeywords: assistantKeywordsSelectors.selectAll,
    };
  },
});

export const { selectRecordsLoading, selectAssistantRecords, selectAllKeywords } = AssistantFeature;
