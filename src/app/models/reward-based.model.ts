import {DisplayReward, Reward} from "../services/reward/reward.service";
import {IdEntity} from "./common.model";

export interface DailyReward extends IdEntity {
  userId: string,
  day: number,
  totalDays: number,
  lastLogin: string
}

export interface RewardComponent {
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

export interface Coin {
  class: string,
  imgSrc: string,
  alt: string,
  amount: number
}
