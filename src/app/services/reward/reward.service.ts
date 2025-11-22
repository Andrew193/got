import { inject, Injectable } from '@angular/core';
import { HeroesFacadeService } from '../facades/heroes/heroes.service';
import { NumbersService } from '../numbers/numbers.service';
import { RewardValues } from '../../models/reward-based.model';
import { REWARD } from '../../constants';
import { Id } from '../../models/common.model';
import { Currency } from '../users/users.interfaces';

export type RewardBox = {
  probability: number;
  name: RewardValues;
};

export type DisplayReward = {
  name: RewardValues;
  amount: number;
  src: string;
  flipped: boolean;
} & Id;

export type RewardLoot = {
  min: number;
  max: number;
  name: RewardValues;
};

export type RewardNames = {
  copper: 'Copper';
  silver: 'Silver';
  shards: 'Shards';
  gold: 'Gold';
  chest: 'Chest';
  special0: 'Special 0';
  special1: 'Special 1';
};

export const basicRewardNames: RewardNames = {
  copper: 'Copper',
  silver: 'Silver',
  shards: 'Shards',
  gold: 'Gold',
  chest: 'Chest',
  special0: 'Special 0',
  special1: 'Special 1',
} as const;

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  private numberService = inject(NumbersService);
  heroService = inject(HeroesFacadeService);

  readonly rewardNames: RewardNames = basicRewardNames;

  readonly rewardLoot: RewardLoot[] = [
    { name: this.rewardNames.copper, ...REWARD.copper },
    { name: this.rewardNames.silver, ...REWARD.silver },
    { name: this.rewardNames.shards, ...REWARD.shards },
    { name: this.rewardNames.gold, ...REWARD.gold },
  ];

  private _mostResentRewardCurrency!: Currency;

  constructor() {
    this.resetMostResentRewardCurrency();
  }

  resetMostResentRewardCurrency() {
    this.mostResentRewardCurrency = {
      copper: 0,
      silver: 0,
      gold: 0,
    };
  }

  set mostResentRewardCurrency(data: Currency) {
    this._mostResentRewardCurrency = data;
  }

  get mostResentRewardCurrency() {
    return this._mostResentRewardCurrency;
  }

  getReward(amountOfRewards: 1, items: RewardBox[]): DisplayReward;
  getReward(amountOfRewards: number, items: RewardBox[]): DisplayReward[];
  getReward(amountOfRewards = 1, items: RewardBox[]): DisplayReward | DisplayReward[] {
    let rewards: DisplayReward[] = [];

    for (let i = 0; i < amountOfRewards; i++) {
      rewards = [...rewards, this.getLootFromBoxes(items)];
    }

    return amountOfRewards === 1 ? rewards[0] : rewards;
  }

  openBox(items: RewardBox[]): RewardBox {
    const rand = Math.random();
    const suitableRewards = [];

    for (const item of items) {
      if (rand <= item.probability) {
        suitableRewards.push(item);
      }
    }

    const sortedRewards = suitableRewards.sort((a, b) => b.probability - a.probability);

    return sortedRewards[sortedRewards.length - 1] || items[0];
  }

  getLootFromBoxes(items: RewardBox[]) {
    return this.getLootForReward(this.openBox(items));
  }

  getLootForReward(item: RewardBox): DisplayReward {
    const loot = this.rewardLoot.filter(reward => reward.name === item.name)[0];

    if (
      item.name === this.rewardNames.copper ||
      item.name === this.rewardNames.silver ||
      item.name === this.rewardNames.gold
    ) {
      return RewardService.getDisplayRewardBase(
        item,
        this.numberService.getNumberInRange(loot.min, loot.max),
      );
    } else if (item.name === this.rewardNames.shards) {
      const heroes = this.heroService.getAllHeroes();
      const heroIndex = this.numberService.getNumberInRange(0, heroes.length - 1);

      return RewardService.getDisplayRewardBase(
        item,
        this.numberService.getNumberInRange(loot.min, loot.max),
        { src: heroes[heroIndex].imgSrc },
      );
    } else if (item.name === this.rewardNames.chest) {
      return RewardService.getDisplayRewardBase(item, 1, {
        src: 'assets/resourses/imgs/icons/chest.png',
      });
    }

    return RewardService.getDisplayRewardBase(item, 1, { src: '' });
  }

  static getDisplayRewardBase(item: RewardBox, amount: number, config?: Partial<{ src: string }>) {
    return {
      amount: amount,
      name: item.name,
      src: config?.src ?? `assets/resourses/imgs/${item.name.toLowerCase()}.png`,
      flipped: false,
      id: crypto.randomUUID(),
    };
  }
}
