import { GiftService } from './gift.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { GiftConfig } from '../../models/gift.model';
import { of } from 'rxjs';
import { User } from '../users/users.interfaces';
import { TIME } from '../online/online.contrants';
import { FakeLocalStorage, fakeUser } from '../../test-related';

describe('GiftService', () => {
  let giftService: GiftService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  const giftConfig: GiftConfig = {
    lastLogin: '12/13/2024',
    userId: fakeUser.id,
  };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);

    httpClientSpy.get.and.returnValue(of([giftConfig]));
    httpClientSpy.post.and.callFake((url: string, body: Partial<User>) => {
      return of(body) as any;
    });
    httpClientSpy.put.and.returnValue(of(fakeUser));

    TestBed.configureTestingModule({
      providers: [
        GiftService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: LocalStorageService, useClass: FakeLocalStorage },
      ],
    });

    giftService = TestBed.inject(GiftService);
  });

  it('GiftService should be created', () => {
    expect(giftService).toBeTruthy();
  });

  it('GiftService should claim reward', done => {
    jasmine.clock().install();
    const date = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));

    jasmine.clock().mockDate(date);

    const callbackSpy = jasmine.createSpy('callback').and.callFake((response: User) => {
      expect(response.createdAt).toEqual(jasmine.any(Number));
      expect(response.createdAt).toBeTruthy();
      done();
    });

    const now = Date.now();

    giftService.claimGiftReward(giftConfig, callbackSpy);

    jasmine.clock().tick(TIME.oneMinuteMilliseconds);

    expect(callbackSpy).toHaveBeenCalledWith({
      lastLogin: '12/13/2024',
      userId: '1',
      createdAt: jasmine.any(Number),
    });
    expect(now + TIME.oneMinuteMilliseconds).toBe(Date.now());

    jasmine.clock().uninstall();
  });

  it('GiftService should return config', done => {
    const callbackSpy = jasmine.createSpy('callback');

    giftService.getConfig(callbackSpy).subscribe({
      next: response => {
        expect(response).toEqual([giftConfig]);
        done();
      },
    });
  });
});
