import { DisplayReward, RewardBox, RewardNames } from '../services/reward/reward.service';
import { IdEntity, LastLogin } from './common.model';
import { Cur } from './iron-bank.model';

export interface DailyReward extends IdEntity, LastLogin {
  userId: string;
  day: number;
  totalDays: number;
}

export interface RewardComponentInterface {
  items: RewardBox[];
  rewards: DisplayReward[];
}

export type BattleRewardCurrency = Lowercase<Cur>;

export type BattleRewardsConfig<T extends BattleRewardCurrency> = {
  [P in T]: Record<'base' | 'win' | 'dmg', number> & Record<'alias', P>;
}[T][];

export type BossReward = Record<
  BattleRewardCurrency | `${BattleRewardCurrency}Win` | `${BattleRewardCurrency}DMG`,
  number
>;

export type RewardValues = RewardNames[keyof RewardNames];
export type RewardKeys = keyof RewardNames;
export type RewardKeysForLoot = Extract<RewardKeys, BattleRewardCurrency | 'shards'>;

export type RewardLootConstant = Record<RewardKeysForLoot, { min: number; max: number }>;

export type CoinNames = Lowercase<Extract<RewardValues, Capitalize<BattleRewardCurrency>>>;

export interface Coin {
  class: CoinNames;
  imgSrc: string;
  alt: string;
  amount: number;
}
