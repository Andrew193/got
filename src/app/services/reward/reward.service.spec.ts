import {TestBed} from "@angular/core/testing";
import {Reward, RewardService} from "./reward.service";
import {HeroesService} from "../heroes/heroes.service";
import {Unit} from "../../models/unit.model";
import {Currency} from "../users/users.interfaces";
import {REWARD} from "../../constants";

describe('RewardService', () => {
  let rewardService: RewardService;
  let heroServiceSpy: jasmine.SpyObj<HeroesService>;

  beforeEach(() => {
    const units: Unit[] = [{
      rank: 0,
      rarity: 0,
      heroType: 0,
      eq1Level: 0,
      eq2Level: 0,
      eq3Level: 0,
      eq4Level: 0,
      level: 0,
      rankBoost: 0,
      healthIncrement: 0,
      attackIncrement: 0,
      defenceIncrement: 0,
      dmgReducedBy: 0,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      user: false,
      imgSrc: "",
      canMove: false,
      canCross: 0,
      maxCanCross: 0,
      canAttack: false,
      attackRange: 0,
      description: "Test unit description",
      health: 0,
      maxHealth: 0,
      name: "Test unit",
      attack: 0,
      defence: 0,
      rage: 0,
      willpower: 0,
      skills: [],
      effects: [],
      x: 0,
      y: 0
    }];

    heroServiceSpy = jasmine.createSpyObj('HeroesService', ['getAllHeroes']);

    TestBed.configureTestingModule({
      providers: [
        RewardService,
        {provide: HeroesService, useValue: heroServiceSpy}
      ]
    })

    rewardService = TestBed.inject(RewardService);
    heroServiceSpy.getAllHeroes.and.returnValue(units);
  })

  it('RewardService should be created', () => {
    expect(rewardService).toBeTruthy();
  });

  it('RewardService should return valid reward names', () => {
    const rewardNames = rewardService.rewardNames;

    expect(Object.values(rewardNames).length).toBeGreaterThan(1);
  })

  it('RewardService should return correct reward loot', () => {
    const rewardLoot = rewardService.rewardLoot;
    const rewardNames = Object.values(rewardService.rewardNames);

    const correctSignature = rewardLoot.every((loot) => {
      const correctMinMax = (loot.min >= 0 && loot.min <= loot.max) && (loot.max >= loot.min);

      return correctMinMax && rewardNames.includes(loot.name);
    })

    expect(correctSignature).toBeTrue();
  })

  it('RewardService should convert currency to coin', () => {
    const currency: Currency = {cooper: 100, gold: 10, silver: 1};

    const coins = rewardService.convertUserCurrencyToCoin(currency);

    expect(coins.length).toBe(3);

    const [gold, silver, cooper] = coins;

    expect(gold.amount).toBe(10);
    expect(silver.amount).toBe(1);
    expect(cooper.amount).toBe(100);
  })

  it('RewardService should give reward', () => {
    const rewards: Reward[] = [{
      probability: 1,
      name: "Cooper"
    }];

    const rewardToCheck = rewardService.getReward(1, rewards);

    expect(rewardToCheck[0].name).toBe(rewards[0].name);
  })

  it('RewardService should open box', () => {
    const rewards: Reward[] = [{
      probability: 0,
      name: "Cooper"
    }, {
      probability: 1,
      name: "Gold"
    }];

    let openedBox = rewardService.openBox(rewards);

    expect(openedBox.name).toBe('Gold');

    rewards[0].probability = 1;
    rewards[1].probability = 0;
    openedBox = rewardService.openBox(rewards);

    expect(openedBox.name).toBe('Cooper');
  })

  it('RewardService should return loot', () => {
    const rewards: Reward[] = [{
      probability: 0.01,
      name: "Cooper"
    }, {
      probability: 1,
      name: "Gold"
    }];

    const loot = rewardService.getLoot(rewards);

    expect(loot.name).toBe('Gold');
    expect(loot.amount).toBeGreaterThanOrEqual(REWARD.gold.min);
    expect(loot.amount).toBeLessThanOrEqual(REWARD.gold.max);
  })
});
