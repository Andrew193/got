import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GiftNpcService } from './gift-npc.service';
import { NumbersService } from '../../numbers/numbers.service';
import { HeroesService } from '../../facades/heroes/heroes.service';
import { basicRewardNames, RewardService } from '../../reward/reward.service';

describe('GiftNpcService', () => {
  let giftNpcService: GiftNpcService;
  let heroServiceSpy: { [K in keyof HeroesService]: ReturnType<typeof vi.fn> };
  let rewardServiceSpy: { [K in keyof RewardService]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    heroServiceSpy = { getFreeTrapper: vi.fn(), getBasicUserConfig: vi.fn() };
    rewardServiceSpy = {
      getReward: vi.fn(),
      getBasicUserConfig: vi.fn(),
      rewardNames: basicRewardNames,
    };

    TestBed.configureTestingModule({
      providers: [
        GiftNpcService,
        NumbersService,
        { provide: HeroesService, useValue: heroServiceSpy },
        { provide: RewardService, useValue: rewardServiceSpy },
      ],
    });

    giftNpcService = TestBed.inject(GiftNpcService);
    rewardServiceSpy.getReward.calls.reset();
  });

  it('GiftNpcService should be created', () => {
    expect(giftNpcService).toBeTruthy();
  });

  it('GiftNpcService should return special reward', () => {
    giftNpcService.getSpecialGiftReward();

    const array = Array(giftNpcService.specialGiftItems.length).fill(
      expect.objectContaining({
        name: expect.any(String),
        probability: expect.any(Number),
      }),
    );

    expect(rewardServiceSpy.getReward).toHaveBeenCalledWith(expect.any(Number), array);
  });

  it('GiftNpcService should open a chest', () => {
    giftNpcService.getChestReward();

    const array = Array(giftNpcService.chestItems.length).fill(
      expect.objectContaining({
        name: expect.any(String),
        probability: expect.any(Number),
      }),
    );

    expect(rewardServiceSpy.getReward).toHaveBeenCalledWith(expect.any(Number), array);
  });
});
