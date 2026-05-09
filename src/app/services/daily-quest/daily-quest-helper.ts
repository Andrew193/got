import { DAILY_QUESTS } from '../../../../global-constants';
import { Quest, QuestProgress } from '../../models/daily-quest.model';

export function createQuestsFromProgress(quests: QuestProgress) {
  return DAILY_QUESTS.map(def => {
    const record = quests.quests.find(q => q.id === def.id);

    return {
      id: def.id,
      title: def.title,
      reward: def.reward,
      status: record?.status ?? 'pending',
    };
  }) satisfies Quest[];
}
