import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { BasicLocalStorage, LocalStorageService } from '../localStorage/local-storage.service';
import { Router } from '@angular/router';
import { ApiService } from '../abstract/api/api.service';
import { frontRoutes, USER_TOKEN } from '../../constants';
import { Currency, User } from './users.interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyDifComponent } from '../../components/modal-window/currency/currency-dif/currency-dif.component';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ApiService<User> {
  private _snackBar = inject(MatSnackBar);

  private url = '/users';

  private user = new BehaviorSubject<User | null>(null);
  $user = this.user.asObservable();

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
  ) {
    super();
  }

  basicUser(user: Partial<User>): User {
    return {
      ...user,
      online: {
        onlineTime: 0,
        claimedRewards: [],
        lastLoyaltyBonus: '',
      },
      currency: {
        gold: 300,
        silver: 1000,
        cooper: 15000,
      },
    } as User;
  }

  createUser(user: Partial<User>, callback = (user: User) => {}) {
    return this.http.post<User>(this.url, this.basicUser(user)).pipe(
      tap({
        next: user => {
          callback(user);
        },
      }),
    );
  }

  login(user: Partial<User>, callback = (user: Partial<User> | []) => {}) {
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
            callback(user[0] || []);
            this.user.next(user[0] as User);
          },
          error: () => {
            this.router.navigate([frontRoutes.login]);
          },
        }),
      );
  }

  updateCurrency(
    newCurrency: Currency,
    config: { returnObs?: boolean; hardSet?: boolean } = {
      returnObs: false,
      hardSet: false,
    },
  ) {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    return this.putPostCover(
      {
        ...user,
        currency: {
          gold: newCurrency.gold + (config.hardSet ? 0 : user.currency.gold),
          silver: newCurrency.silver + (config.hardSet ? 0 : user.currency.silver),
          cooper: newCurrency.cooper + (config.hardSet ? 0 : user.currency.cooper),
        },
      },
      {
        url: this.url,
        callback: response => {
          this.localStorage.setItem(BasicLocalStorage.names.user, response);
          this.user.next(response);
          this._snackBar.openFromComponent(CurrencyDifComponent, {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 5000,
            data: {
              old: user.currency,
              new: response.currency,
            },
          });
        },
        returnObs: config.returnObs || false,
      },
    );
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
            this.router.navigate([frontRoutes.login]);
          },
        }),
      );
  }

  isAuth() {
    return !!this.localStorage.getItem(USER_TOKEN);
  }

  logout() {
    this.localStorage.removeItem(USER_TOKEN);
    this.router.navigate([frontRoutes.login]);
  }

  updateOnline(
    config: { time?: number; claimed?: number; lastLoyaltyBonus?: string },
    returnObs = false,
  ) {
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
      returnObs: returnObs,
    });
  }
}
