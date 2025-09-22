import { Injectable } from '@angular/core';
import { BossReward } from '../../models/reward-based.model';

@Injectable({
  providedIn: 'root',
})
export class DailyBossService {
  constructor() {}

  bossReward: { [key: number]: BossReward } = {
    1: {
      cooper: 10000,
      cooperWin: 100000,
      cooperDMG: 2500,
      silver: 100,
      silverWin: 100,
      silverDMG: 15000,
      gold: 50,
      goldWin: 50,
      goldDMG: 35000,
    },
    2: {
      cooper: 30000,
      cooperWin: 300000,
      cooperDMG: 25000,
      silver: 300,
      silverWin: 1000,
      silverDMG: 150000,
      gold: 150,
      goldWin: 300,
      goldDMG: 350000,
    },
    3: {
      cooper: 90000,
      cooperWin: 1000000,
      cooperDMG: 150000,
      silver: 900,
      silverWin: 3000,
      silverDMG: 200000,
      gold: 450,
      goldWin: 1000,
      goldDMG: 500000,
    },
    4: {
      cooper: 300000,
      cooperWin: 2300000,
      cooperDMG: 250000,
      silver: 3000,
      silverWin: 5000,
      silverDMG: 1000000,
      gold: 1000,
      goldWin: 3000,
      goldDMG: 2000000,
    },
  };

  uppBoss(version: number) {
    const versions: { [key: number]: any } = {
      1: {},
      2: {
        level: 20,
        rank: 2,
        eq1Level: 50,
        eq2Level: 50,
        eq3Level: 50,
        eq4Level: 50,
      },
      3: {
        level: 40,
        rank: 4,
        eq1Level: 100,
        eq2Level: 100,
        eq3Level: 100,
        eq4Level: 100,
      },
      4: {
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
}
