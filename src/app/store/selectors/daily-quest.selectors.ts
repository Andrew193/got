import { createSelector } from '@ngrx/store';

import { QuestId } from '../../../../server/types';
import { DailyQuestsFeature } from '../reducers/daily-quest.reducer';

export const selectDailyQuests = DailyQuestsFeature.selectQuests;
export const selectDailyQuestsLoading = DailyQuestsFeature.selectLoading;
export const selectDailyQuestsError = DailyQuestsFeature.selectError;

export const selectQuestById = (questId: QuestId) =>
  createSelector(selectDailyQuests, quests => quests.find(q => q.id === questId) ?? null);
