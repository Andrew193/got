import { inject, Injectable } from '@angular/core';
import {
  BattleRewardsConfig,
  BattleRewardCurrency,
  BossReward,
} from '../../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../../constants';
import { UsersService } from '../../users/users.service';

export enum BattleDifficulty {
  easy,
  normal,
  hard,
  very_hard,
}

export const BattleDifficultyNumbers = {
  easy: 0,
  normal: 1,
  hard: 2,
  very_hard: 3,
} as const;

export type BattleDifficultyNumbersKeys = keyof typeof BattleDifficultyNumbers;

type DifficultyConfig = {
  level: BattleDifficulty;
  heading: string;
};

@Injectable({
  providedIn: 'root',
})
export class BattleRewardsService {
  usersService = inject(UsersService);

  difficultyConfigs: DifficultyConfig[] = [
    { level: BattleDifficulty.easy, heading: 'Super Easy' },
    { level: BattleDifficulty.normal, heading: 'Easy' },
    { level: BattleDifficulty.hard, heading: 'Medium' },
    { level: BattleDifficulty.very_hard, heading: 'Hard' },
  ];

  declare reward: Record<BattleDifficulty, BossReward>;

  getRewardDescription(
    config: BattleDifficulty | BossReward,
  ): BattleRewardsConfig<BattleRewardCurrency> {
    const reward = typeof config === 'number' ? this.reward[config] : config;

    const coins: BattleRewardCurrency[] = [
      CURRENCY_NAMES.copper,
      CURRENCY_NAMES.silver,
      CURRENCY_NAMES.gold,
    ];

    return coins.map(type => ({
      base: reward[type],
      win: reward[`${type}Win`],
      dmg: reward[`${type}DMG`],
      alias: type,
    }));
  }
}
