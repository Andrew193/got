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
    on(DailyQuestActions.markQuestAsCompletedSuccess, (state, { questId }) => ({
      ...state,
      quests: state.quests.map(q =>
        q.id === questId && q.status === 'pending'
          ? { ...q, status: 'ready_to_claim' as const }
          : q,
      ),
    })),
    on(DailyQuestActions.claimQuestRewardSuccess, (state, { questId }) => ({
      ...state,
      quests: state.quests.map(q =>
        q.id === questId && q.status === 'ready_to_claim'
          ? { ...q, status: 'claimed' as const }
          : q,
      ),
    })),
  ),
});
