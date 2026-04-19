import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GiftService } from './gift.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { GiftConfig } from '../../../models/gift.model';
import { of } from 'rxjs';
import { TIME } from '../../online/online.contrants';
import { FakeLocalStorage, fakeUser } from '../../../test-related';

describe('GiftService', () => {
  let giftService: GiftService;
  let httpClientSpy: { [K in keyof HttpClient]: ReturnType<typeof vi.fn> };
  const giftConfig: GiftConfig = {
    lastLogin: '12/13/2024',
    userId: fakeUser.id,
  };

  beforeEach(() => {
    httpClientSpy = { get: vi.fn(), post: vi.fn(), put: vi.fn() };

    httpClientSpy.get.mockReturnValue(of([giftConfig]));
    httpClientSpy.post.mockImplementation((url: string, body: Partial<User>) => {
      return of(body) as any;
    });
    httpClientSpy.put.mockReturnValue(of(fakeUser));

    TestBed.configureTestingModule({
      providers: [
        GiftService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: LocalStorageService, useClass: FakeLocalStorage },
      ],
    });

    giftService = TestBed.inject(GiftService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('GiftService should be created', () => {
    expect(giftService).toBeTruthy();
  });

  it('GiftService should claim reward', () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));

    vi.setSystemTime(date);

    const callbackSpy = vi.fn();

    const now = Date.now();

    giftService.claimGiftReward(giftConfig, callbackSpy);

    vi.advanceTimersByTime(TIME.oneMinuteMilliseconds);

    expect(callbackSpy).toHaveBeenCalledWith({
      lastLogin: '12/13/2024',
      userId: '1',
      createdAt: expect.any(Number),
    });
    expect(now + TIME.oneMinuteMilliseconds).toBe(Date.now());

    vi.useRealTimers();
  });

  it('GiftService should return config', () => {
    expect(giftService).toBeTruthy();
  });
});
