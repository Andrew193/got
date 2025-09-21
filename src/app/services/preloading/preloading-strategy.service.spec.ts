import { TestBed } from '@angular/core/testing';

import { PreloadingStrategyService } from './preloading-strategy.service';
import {UsersService} from "../users/users.service";
import {User} from "../users/users.interfaces";
import {concat, of, toArray} from "rxjs";
import {Route} from "@angular/router";
import {frontRoutes} from "../../constants";

describe('PreloadingStrategyService', () => {
  let preloadingStrategyService: PreloadingStrategyService;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  beforeEach(() => {
    const user: User = {
      createdAt: 0,
      currency: {
        gold: 0,
        silver: 0,
        cooper: 0
      },
      id: "1",
      login: 'rest',
      online: {
        onlineTime: 0,
        claimedRewards: [],
        lastLoyaltyBonus: ''
      },
      password: 'test'
    };

    usersServiceSpy = jasmine.createSpyObj('UsersService', [], {
      '$user': of(user)
    });

    TestBed.configureTestingModule({
      providers: [
        PreloadingStrategyService,
        {provide: UsersService, useValue: usersServiceSpy}
      ]
    })

    preloadingStrategyService = TestBed.inject(PreloadingStrategyService);
  })

  it('PreloadingStrategyService should be created', () => {
    expect(preloadingStrategyService).toBeTruthy();
  });

  it('PreloadingStrategyService should execute preload', (done) => {
    const loadSpy = jasmine.createSpy('load');
    loadSpy.and.returnValue(of(true));

    const testRoute: Route = {
      path: frontRoutes.taverna
    }

    const wrongTestRoute: Route = {
      path: frontRoutes.ironBank
    }

    const okTest$ = preloadingStrategyService.preload(testRoute, loadSpy);
    const notOkTest$ = preloadingStrategyService.preload(wrongTestRoute, loadSpy);

    concat(okTest$, notOkTest$)
      .pipe(toArray())
      .subscribe(([ok, notOk]) => {
        expect(ok).toBeTrue();
        expect(notOk).toBeNull();
        done()
    })
  })
});
