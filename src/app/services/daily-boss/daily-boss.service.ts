import { Injectable } from '@angular/core';
import { BossReward, BossRewardCurrency, BossRewardsConfig } from '../../models/reward-based.model';
import { CURRENCY_NAMES } from '../../constants';

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
export class DailyBossService {
  private bossReward: Record<BossDifficulty, BossReward> = {
    [BossDifficulty.easy]: {
      copper: 10000,
      copperWin: 100000,
      copperDMG: 2500,
      silver: 100,
      silverWin: 100,
      silverDMG: 15000,
      gold: 50,
      goldWin: 50,
      goldDMG: 35000,
    },
    [BossDifficulty.normal]: {
      copper: 30000,
      copperWin: 300000,
      copperDMG: 25000,
      silver: 300,
      silverWin: 1000,
      silverDMG: 150000,
      gold: 150,
      goldWin: 300,
      goldDMG: 350000,
    },
    [BossDifficulty.hard]: {
      copper: 90000,
      copperWin: 1000000,
      copperDMG: 150000,
      silver: 900,
      silverWin: 3000,
      silverDMG: 200000,
      gold: 450,
      goldWin: 1000,
      goldDMG: 500000,
    },
    [BossDifficulty.very_hard]: {
      copper: 300000,
      copperWin: 2300000,
      copperDMG: 250000,
      silver: 3000,
      silverWin: 5000,
      silverDMG: 1000000,
      gold: 1000,
      goldWin: 3000,
      goldDMG: 2000000,
    },
  };

  getBossReward(level: BossDifficulty): BossRewardsConfig<BossRewardCurrency> {
    const reward = this.bossReward[level];
    const coins: BossRewardCurrency[] = [
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

  uppBoss(version: BossDifficulty) {
    const versions: Record<BossDifficulty, any> = {
      [BossDifficulty.easy]: {},
      [BossDifficulty.normal]: {
        level: 20,
        rank: 2,
        eq1Level: 50,
        eq2Level: 50,
        eq3Level: 50,
        eq4Level: 50,
      },
      [BossDifficulty.hard]: {
        level: 40,
        rank: 4,
        eq1Level: 100,
        eq2Level: 100,
        eq3Level: 100,
        eq4Level: 100,
      },
      [BossDifficulty.very_hard]: {
        level: 60,
        rank: 6,
        eq1Level: 200,
        eq2Level: 200,
        eq3Level: 200,
        eq4Level: 200,
      },
    };

    return versions[version];
  }

  difficultyConfigs: DifficultyConfig[] = [
    { level: BossDifficulty.easy, heading: 'Super Easy' },
    { level: BossDifficulty.normal, heading: 'Easy' },
    { level: BossDifficulty.hard, heading: 'Medium' },
    { level: BossDifficulty.very_hard, heading: 'Hard' },
  ];
}
