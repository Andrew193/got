import {inject, Injectable} from '@angular/core';
import {HeroesService} from "../heroes/heroes.service";
import {NumbersService} from "../numbers/numbers.service";
import {Currency, User} from "../users/users.interfaces";
import {Coin} from "../../models/reward-based.model";

export interface Reward {
  probability: number,
  name: string
}

export interface DisplayReward {
  name: string,
  amount: number,
  src: string,
  flipped: boolean
}

export interface RewardLoot {
  min: number,
  max: number,
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  numberService = inject(NumbersService);

  rewardNames = {
    cooper: "Cooper",
    silver: "Silver",
    shards: "Shards",
    gold: "Gold",
    chest: "Chest",
  }

  rewardLoot: RewardLoot[] = [
    {name: this.rewardNames.cooper, min: 10000, max: 40000},
    {name: this.rewardNames.silver, min: 50, max: 250},
    {name: this.rewardNames.shards, min: 1, max: 10},
    {name: this.rewardNames.gold, min: 20, max: 50},
  ]

  constructor(private heroService: HeroesService) {
  }

  convertUserCurrencyToCoin(currency: Currency): Coin[] {
    return [this.getCoin(currency.gold, this.rewardNames.gold), this.getCoin(currency.silver, this.rewardNames.silver), this.getCoin(currency.cooper, this.rewardNames.cooper)];
  }

  getReward(amountOfRewards = 1, items: Reward[]) {
    let rewards: DisplayReward[] = [];
    for (let i = 0; i < amountOfRewards; i++) {
      rewards = [...rewards, this.getLoot(items)];
    }
    return rewards;
  }

  openBox(items: Reward[]): Reward {
    const rand = Math.random();
    const suitableRewards = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (rand <= item.probability) {
        suitableRewards.push(item);
      }
    }
    const sortedRewards = suitableRewards.sort((a, b) => b.probability - a.probability);
    return sortedRewards[sortedRewards.length - 1] || items[0];
  }

  getLoot(items: Reward[]) {
    return this.getLootForReward(this.openBox(items))
  }

  getLootForReward(item: Reward): DisplayReward {
    const loot = this.rewardLoot.filter((reward) => reward.name === item.name)[0];

    if (item.name === this.rewardNames.cooper || item.name === this.rewardNames.silver || item.name === this.rewardNames.gold) {
      return this.getDisplayRewardBase(item, this.numberService.getNumberInRange(loot.min, loot.max));
    } else if (item.name === this.rewardNames.shards) {
      const heroes = this.heroService.getAllHeroes();
      const heroIndex = this.numberService.getNumberInRange(0, heroes.length - 1)
      return {amount: this.numberService.getNumberInRange(loot.min, loot.max), name: item.name, src: heroes[heroIndex].imgSrc, flipped: false}
    } else if (item.name === this.rewardNames.chest) {
      return {amount: 1, name: item.name, src: "assets/resourses/imgs/icons/chest.png", flipped: false}
    }
    return {amount: 1, src: "", name: item.name, flipped: false};
  }

  private getCoin(amount: number, name: string): Coin {
    const _name = name.toLowerCase();
    return {
      alt: _name,
      amount: amount,
      class: _name,
      imgSrc: `assets/resourses/imgs/${_name}.png`
    }
  }

  private getDisplayRewardBase(item: Reward, amount: number) {
    return {
      amount: amount,
      name: item.name,
      src: `assets/resourses/imgs/${item.name.toLowerCase()}.png`,
      flipped: false
    }
  }
}
