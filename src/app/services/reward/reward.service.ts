import { inject, Injectable } from '@angular/core';
import { HeroesService } from '../heroes/heroes.service';
import { NumbersService } from '../numbers/numbers.service';
import { Currency } from '../users/users.interfaces';
import { Coin, CoinNames, RewardValues } from '../../models/reward-based.model';
import { REWARD } from '../../constants';

export type Reward = {
  probability: number;
  name: RewardValues;
};

export type DisplayReward = {
  name: RewardValues;
  amount: number;
  src: string;
  flipped: boolean;
};

export type RewardLoot = {
  min: number;
  max: number;
  name: RewardValues;
};

export type RewardNames = {
  cooper: 'Cooper';
  silver: 'Silver';
  shards: 'Shards';
  gold: 'Gold';
  chest: 'Chest';
  special0: 'Special 0';
  special1: 'Special 1';
};

export const basicRewardNames: RewardNames = {
  cooper: 'Cooper',
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

  readonly rewardNames: RewardNames = basicRewardNames;

  readonly rewardLoot: RewardLoot[] = [
    { name: this.rewardNames.cooper, ...REWARD.cooper },
    { name: this.rewardNames.silver, ...REWARD.silver },
    { name: this.rewardNames.shards, ...REWARD.shards },
    { name: this.rewardNames.gold, ...REWARD.gold },
  ];

  constructor(private heroService: HeroesService) {}

  convertUserCurrencyToCoin(currency: Currency): Coin[] {
    debugger;

    return [
      this.getCoin(currency.gold, this.rewardNames.gold.toLowerCase() as CoinNames),
      this.getCoin(currency.silver, this.rewardNames.silver.toLowerCase() as CoinNames),
      this.getCoin(currency.cooper, this.rewardNames.cooper.toLowerCase() as CoinNames),
    ];
  }

  getReward(amountOfRewards: 1, items: Reward[]): DisplayReward;
  getReward(amountOfRewards: number, items: Reward[]): DisplayReward[];
  getReward(amountOfRewards = 1, items: Reward[]): DisplayReward | DisplayReward[] {
    let rewards: DisplayReward[] = [];

    for (let i = 0; i < amountOfRewards; i++) {
      rewards = [...rewards, this.getLoot(items)];
    }

    return amountOfRewards === 1 ? rewards[0] : rewards;
  }

  openBox(items: Reward[]): Reward {
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

  getLoot(items: Reward[]) {
    return this.getLootForReward(this.openBox(items));
  }

  getLootForReward(item: Reward): DisplayReward {
    const loot = this.rewardLoot.filter(reward => reward.name === item.name)[0];

    if (
      item.name === this.rewardNames.cooper ||
      item.name === this.rewardNames.silver ||
      item.name === this.rewardNames.gold
    ) {
      return this.getDisplayRewardBase(
        item,
        this.numberService.getNumberInRange(loot.min, loot.max),
      );
    } else if (item.name === this.rewardNames.shards) {
      const heroes = this.heroService.getAllHeroes();
      const heroIndex = this.numberService.getNumberInRange(0, heroes.length - 1);

      return {
        amount: this.numberService.getNumberInRange(loot.min, loot.max),
        name: item.name,
        src: heroes[heroIndex].imgSrc,
        flipped: false,
      };
    } else if (item.name === this.rewardNames.chest) {
      return {
        amount: 1,
        name: item.name,
        src: 'assets/resourses/imgs/icons/chest.png',
        flipped: false,
      };
    }

    return { amount: 1, src: '', name: item.name, flipped: false };
  }

  private getCoin(amount: number, name: CoinNames): Coin {
    debugger;

    return {
      alt: name,
      amount: amount,
      class: name,
      imgSrc: `assets/resourses/imgs/${name}.png`,
    };
  }

  private getDisplayRewardBase(item: Reward, amount: number) {
    return {
      amount: amount,
      name: item.name,
      src: `assets/resourses/imgs/${item.name.toLowerCase()}.png`,
      flipped: false,
    };
  }
}
