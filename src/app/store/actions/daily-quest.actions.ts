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
    completeQuest: props<{ questId: QuestId }>(),
    completeQuestSuccess: props<{ questId: QuestId }>(),
    completeQuestFailure: props<{ error: string }>(),
  },
});
