import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, switchMap, tap } from 'rxjs';
import { BasicLocalStorage, LocalStorageService } from '../localStorage/local-storage.service';
import { ApiService } from '../abstract/api/api.service';
import {
  API_ENDPOINTS,
  BASIC_CURRENCY,
  LOGIN_ERROR,
  SNACKBAR_CONFIG,
  USER_TOKEN,
} from '../../constants';
import { Currency, User } from './users.interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyDifComponent } from '../../components/modal-window/currency/currency-dif/currency-dif.component';
import { NavigationService } from '../facades/navigation/navigation.service';
import { DepositService } from './currency/deposit.service';
import { GiftService } from '../gift-related/gift/gift.service';
import { DailyRewardService } from '../daily-reward/daily-reward.service';
import { DailyBossApiService } from '../facades/daily-boss/daily-boss-api.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ApiService<User> {
  depositService = inject(DepositService);
  giftService = inject(GiftService);
  dailyRewardService = inject(DailyRewardService);
  dailyBossApiService = inject(DailyBossApiService);

  nav = inject(NavigationService);
  localStorage = inject(LocalStorageService);

  private _snackBar = inject(MatSnackBar);

  private url = `/${API_ENDPOINTS.users}`;

  private user = new BehaviorSubject<User | null>(null);
  $user = this.user.asObservable();

  basicUser(user: Partial<User>): User {
    return {
      ...user,
      online: {
        onlineTime: 0,
        claimedRewards: [],
        lastLoyaltyBonus: '',
      },
      currency: BASIC_CURRENCY,
    } as User;
  }

  createUser<F extends (user: User) => void>(user: Partial<User>, callback: F) {
    const deposit$ = (user: User) =>
      this.depositService.initConfigForNewUser(user.id).pipe(
        delay(250),
        switchMap(value =>
          this.putPostCover(
            { ...user, depositId: value.id || '' },
            {
              url: this.url,
              callback: () => {},
            },
          ).pipe(
            map(response => (Array.isArray(response) ? response[0] : response)),
            switchMap(depositResponse =>
              gift$(user).pipe(
                delay(250),
                switchMap(() =>
                  dailyReward$(user).pipe(
                    delay(250),
                    switchMap(() => dailyBoss$(user).pipe(map(() => depositResponse))),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    const gift$ = (user: User) => this.giftService.initConfigForNewUser(user.id);
    const dailyReward$ = (user: User) => this.dailyRewardService.initConfigForNewUser(user.id);
    const dailyBoss$ = (user: User) => this.dailyBossApiService.initConfigForNewUser(user.id);

    return this.putPostCover(this.basicUser(user), {
      url: this.url,
      callback: callback,
    }).pipe(
      map(value => {
        debugger;

        return Array.isArray(value) ? value[0] : value;
      }),
      switchMap(user => deposit$(user)),
    );
  }

  login<F extends (user: User | Error) => void>(user: Partial<User>, callback: F) {
    return this.http
      .get<Partial<User[]>>(this.url, {
        params: {
          login: `${user.login}`,
          password: `${user.password}`,
        },
      })
      .pipe(
        tap({
          next: user => {
            if (user[0]) {
              callback(user[0]);
              this.user.next(user[0]);
            } else {
              callback(new Error(LOGIN_ERROR));
            }
          },
          error: () => {
            this.nav.goToLogin();
            callback(new Error(LOGIN_ERROR));
          },
        }),
      );
  }

  updateCurrency(
    newCurrency: Currency,
    config: { hardSet?: boolean } = {
      hardSet: false,
    },
  ): Observable<User | User[]> {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    const payload: User = {
      ...user,
      currency: {
        gold: newCurrency.gold + (config.hardSet ? 0 : user.currency.gold),
        silver: newCurrency.silver + (config.hardSet ? 0 : user.currency.silver),
        copper: newCurrency.copper + (config.hardSet ? 0 : user.currency.copper),
      },
    };

    return this.putPostCover<User>(payload, {
      url: this.url,
      callback: response => {
        this.localStorage.setItem(BasicLocalStorage.names.user, response);
        this.user.next(response);
        this._snackBar.openFromComponent(CurrencyDifComponent, {
          ...SNACKBAR_CONFIG,
          data: { old: user.currency, new: response.currency },
        });
      },
    });
  }

  doesUserExist() {
    const user = this.localStorage.getItem(USER_TOKEN) as User | undefined;

    return this.http
      .get<any>(this.url, {
        params: {
          login: user?.login || '',
          password: user?.password || '',
        },
        observe: 'response',
      })
      .pipe(
        map(response => {
          if (response.status === 200 && (response.body[0] as User).id === user?.id) {
            this.localStorage.setItem(USER_TOKEN, response.body[0]);
            this.user.next(response.body[0] as User);

            return true;
          }

          return false;
        }),
        tap({
          error: () => {
            this.nav.goToLogin();
          },
        }),
      );
  }

  isAuth() {
    return !!this.localStorage.getItem(USER_TOKEN);
  }

  logout() {
    this.localStorage.removeItem(USER_TOKEN);
    this.user.next(null);
    this._data.set(null);
    this.nav.goToLogin();
  }

  updateOnline(config: { time?: number; claimed?: number; lastLoyaltyBonus?: string }) {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    const data: User = {
      ...user,
      online: {
        ...user.online,
        ...(config.time || config.claimed === 24
          ? {
              onlineTime:
                config.claimed === 24
                  ? 0
                  : user.online.onlineTime +
                    (
                      config as {
                        time: number;
                      }
                    ).time,
            }
          : {}),
        ...(config.claimed
          ? {
              claimedRewards:
                config.claimed === 24
                  ? []
                  : [...user.online.claimedRewards, config.claimed.toString()],
            }
          : {}),
        ...(config.lastLoyaltyBonus ? { lastLoyaltyBonus: config.lastLoyaltyBonus } : {}),
      },
    };

    return this.putPostCover(data, {
      url: this.url,
      callback: response => {
        this.localStorage.setItem(BasicLocalStorage.names.user, response);
        this.user.next(response as User);
      },
    });
  }
}
