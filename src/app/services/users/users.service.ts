import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { BasicLocalStorage, LocalStorageService } from '../localStorage/local-storage.service';
import { ApiService } from '../abstract/api/api.service';
import { API_ENDPOINTS, USER_TOKEN } from '../../constants';
import { Currency, User } from './users.interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyDifComponent } from '../../components/modal-window/currency/currency-dif/currency-dif.component';
import { NavigationService } from '../facades/navigation/navigation.service';
import { DepositService } from './currency/currency.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ApiService<User> {
  depositService = inject(DepositService);
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
      currency: {
        gold: 300,
        silver: 1000,
        copper: 15000,
      },
    } as User;
  }

  createUser<F extends (user: User) => void>(user: Partial<User>, callback: F) {
    return this.putPostCover(this.basicUser(user), {
      returnObs: true,
      url: this.url,
      callback: callback,
    }).pipe(
      map(value => (Array.isArray(value) ? value[0] : value)),
      switchMap(user =>
        this.depositService
          .initDepositForNewUser(user.id)
          .pipe(
            switchMap(value =>
              this.putPostCover(
                { ...user, depositId: value.id || '' },
                {
                  returnObs: true,
                  url: this.url,
                  callback: () => {},
                },
              ),
            ),
          )
          .pipe(map(response => (Array.isArray(response) ? response[0] : response))),
      ),
      tap({
        next: user => {
          callback(user);
        },
      }),
    );
  }

  login<F extends (user: User) => void>(user: Partial<User>, callback: F) {
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
            }
          },
          error: () => {
            this.nav.goToLogin();
          },
        }),
      );
  }

  updateCurrency<R extends boolean = false>(
    newCurrency: Currency,
    config: { returnObs?: R; hardSet?: boolean } = {
      returnObs: false as R,
      hardSet: false,
    },
  ): R extends true ? Observable<User | User[]> : Subscription {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    const payload: User = {
      ...user,
      currency: {
        gold: newCurrency.gold + (config.hardSet ? 0 : user.currency.gold),
        silver: newCurrency.silver + (config.hardSet ? 0 : user.currency.silver),
        copper: newCurrency.copper + (config.hardSet ? 0 : user.currency.copper),
      },
    };

    const returnObs = (config.returnObs ?? false) as R;

    return this.putPostCover<R, User>(payload, {
      url: this.url,
      callback: (response: User) => {
        this.localStorage.setItem(BasicLocalStorage.names.user, response);
        this.user.next(response);
        this._snackBar.openFromComponent(CurrencyDifComponent, {
          horizontalPosition: 'end',
          verticalPosition: 'top',
          duration: 5000,
          data: { old: user.currency, new: response.currency },
        });
      },
      returnObs,
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
    this.nav.goToLogin();
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
