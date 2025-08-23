import {Injectable} from '@angular/core';
import {HeroesService} from "../heroes/heroes.service";

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
  rewardNames = {
    cooper: "Cooper",
    silver: "Silver",
    shards: "Shards",
    gold: "Gold",
    chest: "Chest",
  }

  rewardLoot: RewardLoot[] = [
    {name: this.rewardNames.cooper, min: 10000, max: 40000},
    {name: this.rewardNames.silver, min: 50, max: 500},
    {name: this.rewardNames.shards, min: 1, max: 10},
    {name: this.rewardNames.gold, min: 20, max: 50},
  ]

  constructor(private heroService: HeroesService) {
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

  getNumberInRange(min: number, max: number) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
  }

  getLoot(items: Reward[]) {
    return this.getLootForReward(this.openBox(items))
  }

  getLootForReward(item: Reward): DisplayReward {
    const loot = this.rewardLoot.filter((reward) => reward.name === item.name)[0];
    if (item.name === this.rewardNames.cooper) {
      return {
        amount: this.getNumberInRange(loot.min, loot.max),
        name: item.name,
        src: "assets/resourses/imgs/copper.png",
        flipped: false
      }
    } else if (item.name === this.rewardNames.silver) {
      return {
        amount: this.getNumberInRange(loot.min, loot.max),
        name: item.name,
        src: "assets/resourses/imgs/silver.png",
        flipped: false
      }
    } else if (item.name === this.rewardNames.shards) {
      const heroes = this.heroService.getAllHeroes();
      const heroIndex = this.getNumberInRange(0, heroes.length - 1)
      return {amount: this.getNumberInRange(loot.min, loot.max), name: item.name, src: heroes[heroIndex].imgSrc, flipped: false}
    } else if (item.name === this.rewardNames.gold) {
      return {amount: this.getNumberInRange(loot.min, loot.max), name: item.name, src: "assets/resourses/imgs/gold.png", flipped: false}
    } else if (item.name === this.rewardNames.chest) {
      return {amount: 1, name: item.name, src: "assets/resourses/imgs/icons/chest.png", flipped: false}
    }
    return {amount: 1, src: "", name: item.name, flipped: false};
  }
}
