import {DisplayReward, Reward, RewardNames} from "../services/reward/reward.service";
import {IdEntity} from "./common.model";

export interface DailyReward extends IdEntity {
  userId: string,
  day: number,
  totalDays: number,
  lastLogin: string
}

export interface RewardComponentInterface {
  items: Reward[];
  rewards: DisplayReward[];
}

export interface BossReward {
  cooper: number,
  cooperWin: number,
  cooperDMG: number,
  silver: number,
  silverWin: number,
  silverDMG: number,
  gold: number,
  goldWin: number,
  goldDMG: number,
}

export type RewardValues = RewardNames[keyof RewardNames];
export type RewardKeys = keyof RewardNames;
export type RewardKeysForLoot = Extract<RewardKeys, 'cooper' | 'silver' | 'gold' | 'shards'>

export type RewardLootConstant = {
  [P in RewardKeysForLoot]: {
    min: number,
    max: number
  }
}

export type CoinNames = Lowercase<Extract<RewardValues, 'Cooper' | 'Silver' | 'Gold'>>

export interface Coin {
  class: CoinNames,
  imgSrc: string,
  alt: string,
  amount: number
}
