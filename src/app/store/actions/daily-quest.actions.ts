import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Quest } from '../../models/daily-quest.model';
import { StoreNames } from '../store.interfaces';
import { QuestId } from '../../../../server/types';

export const DailyQuestActions = createActionGroup({
  source: StoreNames.dailyQuests,
  events: {
    loadQuests: emptyProps(),
    loadQuestsSuccess: props<{ quests: Quest[] }>(),
    loadQuestsFailure: props<{ error: string }>(),
    markQuestAsCompleted: props<{ questId: QuestId }>(),
    markQuestAsCompletedSuccess: props<{ questId: QuestId }>(),
    markQuestAsCompletedFailure: props<{ error: string }>(),
    claimQuestReward: props<{ questId: QuestId }>(),
    claimQuestRewardSuccess: props<{ questId: QuestId }>(),
    claimQuestRewardFailure: props<{ error: string }>(),
  },
});
