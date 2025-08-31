import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, tap} from "rxjs";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {Router} from "@angular/router";
import {ApiService} from "../abstract/api/api.service";
import {frontRoutes, USER_TOKEN} from "../../constants";
import {Currency, User} from "./users.interfaces";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private url = "/users";

  private user = new BehaviorSubject<User | null>(null);
  $user = this.user.asObservable();

  apiService = inject(ApiService);

  constructor(private http: HttpClient,
              private router: Router,
              private localStorage: LocalStorageService) {
  }

  basicUser(user: Partial<User>): User {
    return {
      ...user,
      online: {
        onlineTime: 0,
        claimedRewards: [],
        lastLoyaltyBonus: ''
      },
      currency: {
        gold: 300,
        silver: 1000,
        cooper: 15000
      }
    } as User
  }

  createUser(user: Partial<User>, callback = (user: User) => {
  }) {
    this.http.post<User>(this.url, this.basicUser(user)).pipe(tap({
      next: (user) => {
        callback(user);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  login(user: Partial<User>, callback = (user: Partial<User> | []) => {
  }) {
    this.http.get<Partial<User[]>>(this.url, {
      params: {
        login: `${user.login}`,
        password: `${user.password}`
      }
    })
      .pipe(tap({
        next: (user) => {
          callback(user[0] || []);
          this.user.next(user[0] as User);
        },
        error: (error) => {
          console.log(error)
          this.router.navigate([frontRoutes.login])
        }
      })).subscribe();
  }

  updateCurrency(newCurrency: Currency, returnObs = false) {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    return this.apiService.putPostCover({
        ...user, currency: {
          gold: newCurrency.gold + user.currency.gold,
          silver: newCurrency.silver + user.currency.silver,
          cooper: newCurrency.cooper + user.currency.cooper
        }
      },
      {
        url: this.url,
        callback: (res) => {
          this.localStorage.setItem(this.localStorage.names.user, res);
        },
        returnObs: returnObs
      })
  }

  doesUserExist() {
    const user = (this.localStorage.getItem(USER_TOKEN) as User | undefined);
    return this.http.get<any>(this.url, {
      params: {
        login: user?.login || '',
        password: user?.password || ''
      },
      observe: "response"
    }).pipe(map((response) => {
        if (response.status === 200 && (response.body[0] as User).id === user?.id) {
          this.localStorage.setItem(USER_TOKEN, response.body[0]);
          this.user.next(response.body[0] as User);
          return true;
        }
        return false;
      }),
      tap({
        error: () => {
          this.router.navigate([frontRoutes.login])
        }
      }))
  }

  isAuth() {
    return !!this.localStorage.getItem(USER_TOKEN);
  }

  logout() {
    this.localStorage.removeItem(USER_TOKEN);
    this.router.navigate([frontRoutes.login])
  }

  updateOnline(config: { time?: number, claimed?: number, lastLoyaltyBonus?: string }, returnObs = false) {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    const data: User = {
      ...user,
      online: {
        ...user.online,
        ...((config.time || config.claimed === 24) ? {
          onlineTime: config.claimed === 24 ? 0 : user.online.onlineTime + (config as {
            time: number
          }).time
        } : {}),
        ...(config.claimed ? {claimedRewards: config.claimed === 24 ? [] : [...user.online.claimedRewards, config.claimed.toString()]} : {}),
        ...(config.lastLoyaltyBonus ? {lastLoyaltyBonus: config.lastLoyaltyBonus} : {}),
      }
    }

    return this.apiService.putPostCover(data,
      {
        url: this.url,
        callback: (res) => {
          this.localStorage.setItem(this.localStorage.names.user, res);
          this.user.next(res as User);
        },
        returnObs: returnObs
      })
  }
}
