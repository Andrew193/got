import type { QuestRecord } from '../../../server/types';
import { Currency } from '../services/users/users.interfaces';

export interface Quest extends QuestRecord {
  title: string;
  reward: Currency;
}
