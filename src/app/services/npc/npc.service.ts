import {inject, Injectable} from '@angular/core';
import {HeroesService, heroType, rarity} from "../heroes/heroes.service";
import {DisplayReward, Reward, RewardService} from "../reward/reward.service";
import {Unit, UnitWithReward} from "../../models/unit.model";
import {RewardComponent} from "../../models/reward-based.model";
import {NumbersService} from "../numbers/numbers.service";

@Injectable({
  providedIn: 'root'
})
export class NpcService implements RewardComponent {
  numberService = inject(NumbersService);

  items: Reward[] = [
    {name: this.rewardService.rewardNames.cooper, probability: 0.70},
    {name: this.rewardService.rewardNames.chest, probability: 0.30},
  ];

  specialGiftItems: Reward[] = [
    {name: this.rewardService.rewardNames.gold, probability: 0.20},
    {name: this.rewardService.rewardNames.chest, probability: 0.30},
    {name: this.rewardService.rewardNames.silver, probability: 0.50},
  ];

  chestItems: Reward[] = [
    {name: this.rewardService.rewardNames.gold, probability: 0.40},
    {name: this.rewardService.rewardNames.cooper, probability: 0.20},
    {name: this.rewardService.rewardNames.silver, probability: 0.40},
  ];

  rewards: DisplayReward[] = [];

  constructor(private heroService: HeroesService,
              public rewardService: RewardService) {
  }

  getSpecialGiftReward() {
    return this.rewardService.getReward(1, this.specialGiftItems)[0]
  }

  getChestReward() {
    return this.rewardService.getReward(1, this.chestItems)[0]
  }

  getGiftNPC() {
    const npc: UnitWithReward[] = []
    while (true) {
      const i = this.numberService.getNumberInRange(0, 6);
      const j = this.numberService.getNumberInRange(0, 9);
      if (i !== 0 && j !== 0) {
        if (npc.findIndex((npc) => npc.x === i && npc.y === j) === -1) {
          const reward = this.rewardService.getReward(1, this.items)[0]
          npc.push({...this.getNPC(reward.name), reward: reward, x: i, y: j, inBattle: false})
        }
      }

      if (npc.length === 10) {
        break;
      }
    }
    return npc;
  }

  getWildling() {
    return this.heroService.getFreeTrapper();
  }

  getUser(): Unit {
    return {
      ...this.heroService.getBasicUserConfig(),
      attackRange: 1,
      rarity: rarity.COMMON,
      heroType: heroType.ATTACK,
      rank: 1,
      level: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
      rankBoost: 1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 8169,
      healthIncrement: 89,
      attack: 1299,
      attackIncrement: 12,
      defence: 995,
      defenceIncrement: 10,
      maxHealth: 8169,
      rage: 20,
      willpower: 20,
      imgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/UI_Avatar_Unit_FreeFolksTrappers.png",
      fullImgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/UI_Icon_Avatar_FullBody_Wildling_08_FreeFolksTrappers.png",
      name: "Разведчик",
      description: "Разведчик Ночного Дозора.",
      skills: [
        {
          name: "Собрать",
          imgSrc: "../../../assets/resourses/imgs/icons/open.png",
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          description: "Открывает сундуки и собирает предметы."
        },
        {
          name: "Ударить",
          imgSrc: "../../../assets/resourses/imgs/icons/open.png",
          dmgM: 2.2,
          cooldown: 2,
          remainingCooldown: 0,
          debuffs: [],
          description: "Открывает сундуки и собирает предметы, а также наносит существенный урон."
        }
      ],
      effects: []
    }
  }

  getNPC(name?: string, description?: string): Unit {
    return {
      ...this.heroService.getBasicUserConfig(),
      attackRange: 1,
      rarity: rarity.COMMON,
      heroType: heroType.DEFENCE,
      rank: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
      rankBoost: 1,
      level: 1,
      healthIncrement: 0,
      attackIncrement: 0,
      defenceIncrement: 0,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 0,
      maxCanCross: 0,
      health: 1,
      attack: 1,
      defence: 1,
      maxHealth: 1,
      rage: 0,
      willpower: 0,
      imgSrc: "../../../assets/resourses/imgs/icons/chest.png",
      fullImgSrc: "../../../assets/resourses/imgs/icons/chest.png",
      name: name || "Chest",
      description: description || "Сундук со случайной наградой. Был давно потерян в этих краях.",
      skills: [],
      effects: []
    }
  }
}
