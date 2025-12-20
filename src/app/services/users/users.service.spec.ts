import { UsersService } from './users.service';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  concat,
  concatAll,
  delay,
  from,
  map,
  Observable,
  of,
  throwError,
  toArray,
  withLatestFrom,
} from 'rxjs';
import { Router } from '@angular/router';
import { frontRoutes, USER_TOKEN } from '../../constants';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { Currency, User } from './users.interfaces';
import { Online } from '../online/online.service';
import { fakeUser } from '../../test-related';

describe('UsersService', () => {
  let userService: UsersService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;

  const userBase = { login: 'test', password: 'test' };

  function actionHandler<T>(response: T) {
    console.log('Login: ', response);
  }

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    localStorageSpy = jasmine.createSpyObj(
      'LocalStorageService',
      ['removeItem', 'getItem', 'setItem'],
      {
        names: {
          user: 'user',
        },
      },
    );

    localStorageSpy.getItem.and.callFake(key => {
      if (key === USER_TOKEN) {
        return fakeUser;
      }

      return { id: 1 };
    });

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LocalStorageService, useValue: localStorageSpy },
      ],
    });

    userService = TestBed.inject(UsersService);
  });

  it('UsersService should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('UsersService returns basic user', () => {
    const user = userService.basicUser(userBase);

    expect({ login: user.login, password: user.password }).toEqual(userBase);
  });

  it('UsersService creates a user', done => {
    const user = userService.basicUser(userBase);

    httpClientSpy.post.and.returnValue(of(user));

    userService.createUser(userBase, actionHandler).subscribe({
      next: res => {
        expect(res).toEqual(user);
        expect(httpClientSpy.post.calls.count()).toBe(3);
        done();
      },
    });
  });

  it('UsersService can not create a user', done => {
    httpClientSpy.post.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            statusText: 'Can not create a user',
          }),
      ).pipe(delay(1000)),
    );

    userService.createUser({}, actionHandler).subscribe({
      next: () => {
        done.fail('Expected an error, not created user');
      },
      error: (error: HttpErrorResponse) => {
        expect(error.statusText).toContain('not create');
        done();
      },
    });
  });

  it('UsersService logins a user', done => {
    const user = userService.basicUser(userBase);

    httpClientSpy.get.and.returnValue(of([user]));

    const login$ = userService.login(user, actionHandler).pipe(
      map(res => res[0]),
      withLatestFrom(userService.$user),
      map(response => {
        return {
          login: response[0] || null,
          _user: response[1],
        };
      }),
    );

    login$.subscribe(response => {
      //Login check
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.objectContaining({ params: jasmine.objectContaining(userBase) }),
      );
      expect(response.login).toEqual(user);

      //User check
      expect(response._user).toBeTruthy();
      expect(response._user).toEqual(response.login);
      done();
    });
  });

  it('UsersService can not login a user', done => {
    httpClientSpy.get.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Login error' })),
    );

    userService.login({}, actionHandler).subscribe({
      next: () => {
        done.fail('Expected an error.');
      },
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.statusText).toBe('Login error');
        expect(routerSpy.navigate.calls.count()).toBe(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith([frontRoutes.login]);
        done();
      },
    });
  });

  it('UsersService can logout', () => {
    userService.logout();

    //Clear user
    expect(localStorageSpy.removeItem).toHaveBeenCalledTimes(1);
    expect(localStorageSpy.removeItem).toHaveBeenCalledWith(USER_TOKEN);

    //Open login page
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith([frontRoutes.login]);
  });

  it('UsersService can update currency', done => {
    const newCurrency: Currency = {
      gold: 100,
      silver: 100,
      copper: 100,
    };

    httpClientSpy.put.and.callFake((url: string, body: User) => of(body) as any);

    const add$ = userService.updateCurrency(newCurrency) as Observable<User>;
    const reset$ = userService.updateCurrency(newCurrency, {
      hardSet: true,
    }) as Observable<User>;

    concat(add$, reset$)
      .pipe(toArray())
      .subscribe({
        next: ([add, reset]) => {
          //Check add
          expect(add.currency.copper).toBe(fakeUser.currency.copper + newCurrency.copper);
          expect(add.currency.silver).toBe(fakeUser.currency.silver + newCurrency.silver);
          expect(add.currency.gold).toBe(fakeUser.currency.gold + newCurrency.gold);

          //Check reset
          expect(reset.currency.copper).toBe(newCurrency.copper);
          expect(reset.currency.silver).toBe(newCurrency.silver);
          expect(reset.currency.gold).toBe(newCurrency.gold);
          done();
        },
        error: () => {
          done.fail('Failed to update or reset.');
        },
      });
  });

  it('UsersService can update online', done => {
    const newOnline: Online = {
      claimed: 24,
      lastLoyaltyBonus: '',
      time: 600,
    };

    httpClientSpy.put.and.callFake((url: string, body: User) => of(body) as any);

    const onOnlineEmpty$ = userService.updateOnline(newOnline) as Observable<User>;
    const onOnline600$ = userService.updateOnline({
      ...newOnline,
      claimed: 23,
    }) as Observable<User>;

    const array = [onOnlineEmpty$, onOnline600$] as const;

    from(array)
      .pipe(concatAll(), toArray())
      .subscribe({
        next: ([empty, with600]) => {
          //Check empty
          expect(empty.online.onlineTime).toEqual(0);

          //Check 600
          expect(with600.online.onlineTime).toEqual(600);
          expect(with600.online.claimedRewards).toContain('23');

          done();
        },
      });
  });

  it('UsersService calls user exist', fakeAsync(() => {
    const baseResponse = {
      status: 200,
      statusText: 'Exists',
    };

    function getResponse(url: string) {
      const response: Partial<HttpResponse<User[]>> = {
        body: [fakeUser],
        ...baseResponse,
        url: url,
      };

      return response.status === 500
        ? new HttpErrorResponse({ status: 500, statusText: 'Error 500' })
        : response;
    }

    httpClientSpy.get.and.callFake((url: string) => {
      const response = getResponse(url);

      return response instanceof HttpErrorResponse
        ? (throwError(() => response) as any)
        : (of(response).pipe(delay(400)) as any);
    });

    let doesUserExist = false;

    //Correct user
    userService.doesUserExist().subscribe(v => (doesUserExist = v));

    tick(400);
    expect(doesUserExist).toBeTruthy();

    //Break user
    baseResponse.status = 400;

    userService.doesUserExist().subscribe(v => (doesUserExist = v));

    tick(400);
    expect(doesUserExist).toBeFalse();

    //Get error
    baseResponse.status = 500;
    userService.doesUserExist().subscribe({
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith([frontRoutes.login]);
      },
    });
  }));
});
