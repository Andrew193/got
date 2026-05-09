import { createFeature, createReducer, on } from '@ngrx/store';

import { DailyQuestActions } from '../actions/daily-quest.actions';
import { DailyQuestsState, StoreNames } from '../store.interfaces';

const initialState: DailyQuestsState = {
  quests: [],
  loading: false,
  error: null,
};

export const DailyQuestsFeature = createFeature({
  name: StoreNames.dailyQuests,
  reducer: createReducer(
    initialState,
    on(DailyQuestActions.loadQuests, state => ({ ...state, loading: true, error: null })),
    on(DailyQuestActions.loadQuestsSuccess, (_state, { quests }) => ({
      ..._state,
      quests,
      loading: false,
      error: null,
    })),
    on(DailyQuestActions.loadQuestsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(DailyQuestActions.completeQuestSuccess, (state, { questId }) => ({
      ...state,
      quests: state.quests.map(q => (q.id === questId ? { ...q, completed: true } : q)),
    })),
  ),
});
