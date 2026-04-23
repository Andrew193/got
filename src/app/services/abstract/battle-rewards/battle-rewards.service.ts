import { Injectable } from '@angular/core';
import {
  BattleRewardsConfig,
  BattleRewardCurrency,
  BossReward,
} from '../../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../../constants';

export enum BossDifficulty {
  easy,
  normal,
  hard,
  very_hard,
}

type DifficultyConfig = {
  level: BossDifficulty;
  heading: string;
};

@Injectable({
  providedIn: 'root',
})
export abstract class BattleRewardsService {
  difficultyConfigs: DifficultyConfig[] = [
    { level: BossDifficulty.easy, heading: 'Super Easy' },
    { level: BossDifficulty.normal, heading: 'Easy' },
    { level: BossDifficulty.hard, heading: 'Medium' },
    { level: BossDifficulty.very_hard, heading: 'Hard' },
  ];

  abstract bossReward: Record<BossDifficulty, BossReward>;

  getBossRewardDescription(level: BossDifficulty): BattleRewardsConfig<BattleRewardCurrency> {
    const reward = this.bossReward[level];
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
