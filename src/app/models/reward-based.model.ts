import { DisplayReward, Reward, RewardNames } from '../services/reward/reward.service';
import { IdEntity } from './common.model';

export interface DailyReward extends IdEntity {
  userId: string;
  day: number;
  totalDays: number;
  lastLogin: string;
}

export interface RewardComponentInterface {
  items: Reward[];
  rewards: DisplayReward[];
}

type BossRewardCurrency = 'cooper' | 'silver' | 'gold';

export type BossReward = Record<
  BossRewardCurrency | `${BossRewardCurrency}Win` | `${BossRewardCurrency}DMG`,
  number
>;

export type RewardValues = RewardNames[keyof RewardNames];
export type RewardKeys = keyof RewardNames;
export type RewardKeysForLoot = Extract<RewardKeys, BossRewardCurrency | 'shards'>;

export type RewardLootConstant = Record<RewardKeysForLoot, { min: number; max: number }>;

export type CoinNames = Lowercase<Extract<RewardValues, Capitalize<BossRewardCurrency>>>;

export interface Coin {
  class: CoinNames;
  imgSrc: string;
  alt: string;
  amount: number;
}
