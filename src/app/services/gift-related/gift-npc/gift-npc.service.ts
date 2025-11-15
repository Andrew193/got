import { inject, Injectable } from '@angular/core';
import { HeroesFacadeService } from '../../facades/heroes/heroes.service';
import {
  basicRewardNames,
  DisplayReward,
  Reward,
  RewardService,
} from '../../reward/reward.service';
import {
  HeroesNamesCodes,
  HeroType,
  Rarity,
  Unit,
  UnitName,
  UnitWithReward,
} from '../../../models/units-related/unit.model';
import { RewardComponentInterface } from '../../../models/reward-based.model';
import { NumbersService } from '../../numbers/numbers.service';
import { GIFT_STORE_NPC_AMOUNT } from '../../../constants';

@Injectable({
  providedIn: 'root',
})
export class GiftNpcService implements RewardComponentInterface {
  numberService = inject(NumbersService);

  items: Reward[] = [
    { name: this.rewardService.rewardNames.copper, probability: 0.7 },
    { name: this.rewardService.rewardNames.chest, probability: 0.3 },
  ];

  specialGiftItems: Reward[] = [
    { name: this.rewardService.rewardNames.gold, probability: 0.2 },
    { name: this.rewardService.rewardNames.chest, probability: 0.3 },
    { name: this.rewardService.rewardNames.silver, probability: 0.5 },
  ];

  chestItems: Reward[] = [
    { name: this.rewardService.rewardNames.gold, probability: 0.4 },
    { name: this.rewardService.rewardNames.copper, probability: 0.2 },
    { name: this.rewardService.rewardNames.silver, probability: 0.4 },
  ];

  rewards: DisplayReward[] = [];

  constructor(
    private heroService: HeroesFacadeService,
    public rewardService: RewardService,
  ) {}

  convertToTileUnit(unit: Unit) {
    return this.heroService.getTileUnit(unit);
  }

  getSpecialGiftReward() {
    return this.rewardService.getReward(1, this.specialGiftItems);
  }

  getChestReward() {
    return this.rewardService.getReward(1, this.chestItems);
  }

  getGiftNPC() {
    const npc: UnitWithReward[] = [];

    while (true) {
      const i = this.numberService.getNumberInRange(0, 6);
      const j = this.numberService.getNumberInRange(0, 9);

      if (i !== 0 && j !== 0) {
        if (npc.findIndex(npc => npc.x === i && npc.y === j) === -1) {
          const reward = this.rewardService.getReward(1, this.items);

          npc.push({
            ...this.getNPC(reward.name),
            reward: reward,
            x: i,
            y: j,
          });
        }
      }

      if (npc.length === GIFT_STORE_NPC_AMOUNT) {
        break;
      }
    }

    return npc;
  }

  getWildling() {
    return this.heroService.getFreeTrapper();
  }

  getUserForNPC(unit: Partial<Unit> = {}): Unit {
    return {
      ...this.heroService.helper.getBasicUserConfig(),
      ...this.heroService.helper.getHeroBasicStats(HeroesNamesCodes.Ranger),
      rarity: Rarity.COMMON,
      heroType: HeroType.ATTACK,
      imgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Avatar_Unit_FreeFolksTrappers.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Icon_Avatar_FullBody_Wildling_08_FreeFolksTrappers.png',
      name: HeroesNamesCodes.Ranger,
      description: 'Night Watch Ranger.',
      skills: [
        {
          name: 'Collect',
          imgSrc: '../../../assets/resourses/imgs/icons/open.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          description: 'Opens chests and collects items.',
        },
        {
          name: 'Hit',
          imgSrc: '../../../assets/resourses/imgs/icons/open.png',
          dmgM: 2.2,
          cooldown: 2,
          remainingCooldown: 0,
          debuffs: [],
          description: 'Opens chests and collects items, and also deals significant damage.',
        },
      ],
      effects: [],
      synergy: [],
      ...unit,
    };
  }

  getNPC(name?: UnitName, description?: string): Unit {
    return {
      ...this.heroService.helper.getBasicUserConfig(),
      attackRange: 1,
      rarity: Rarity.COMMON,
      heroType: HeroType.DEFENCE,
      rankBoost: 1,
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
      imgSrc: '../../../assets/resourses/imgs/icons/chest.png',
      fullImgSrc: '../../../assets/resourses/imgs/icons/chest.png',
      name: name || basicRewardNames.chest,
      description: description || 'Сундук со случайной наградой. Был давно потерян в этих краях.',
      skills: [],
      effects: [],
      synergy: [],
    };
  }
}
