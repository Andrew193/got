import {TestBed} from '@angular/core/testing';
import {GiftNpcService} from './gift-npc.service';
import {NumbersService} from "../numbers/numbers.service";
import {HeroesService} from "../heroes/heroes.service";
import {basicRewardNames, RewardService} from "../reward/reward.service";

describe('GiftNpcService', () => {
  let giftNpcService: GiftNpcService;
  let heroServiceSpy: jasmine.SpyObj<HeroesService>;
  let rewardServiceSpy: jasmine.SpyObj<RewardService>

  beforeEach(() => {
    heroServiceSpy = jasmine.createSpyObj('HeroesService', ['getFreeTrapper', 'getBasicUserConfig']);
    rewardServiceSpy = jasmine.createSpyObj('RewardService', ['getReward', 'getBasicUserConfig'], {rewardNames: basicRewardNames});

    TestBed.configureTestingModule({
      providers: [
        GiftNpcService,
        NumbersService,
        {provide: HeroesService, useValue: heroServiceSpy},
        {provide: RewardService, useValue: rewardServiceSpy},
      ]
    })

    giftNpcService = TestBed.inject(GiftNpcService);
    rewardServiceSpy.getReward.calls.reset();
  })

  it('GiftNpcService should be created', () => {
    expect(giftNpcService).toBeTruthy();
  });

  it('GiftNpcService should return special reward', () => {
    giftNpcService.getSpecialGiftReward();

    const array = Array(giftNpcService.specialGiftItems.length).fill(jasmine.objectContaining({name: jasmine.any(String), probability: jasmine.any(Number)}));

    expect(rewardServiceSpy.getReward).toHaveBeenCalledWith(jasmine.any(Number), array);
  });

  it('GiftNpcService should open a chest', () => {
    giftNpcService.getChestReward();

    const array = Array(giftNpcService.chestItems.length).fill(jasmine.objectContaining({name: jasmine.any(String), probability: jasmine.any(Number)}));

    expect(rewardServiceSpy.getReward).toHaveBeenCalledWith(jasmine.any(Number), array);
  })
});
