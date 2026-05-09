import type { QuestDefinition, QuestRecord } from '../../../server/types';

export type { QuestId, QuestRecord, QuestProgress } from '../../../server/types';

export interface Quest extends QuestRecord {
  title: string;
  reward: QuestDefinition['reward'];
}
