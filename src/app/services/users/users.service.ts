import {Injectable, Injector} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {map, tap} from "rxjs";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {Router} from "@angular/router";
import {ApiService} from "../abstract/api/api.service";
import {frontRoutes} from "../../constants";

export interface Currency {
  gold: number,
  silver: number,
  cooper: number
}

export interface User {
  id: string,
  login: string | null | undefined,
  password: string | null | undefined,
  currency: Currency
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  url = "/users";
  userToken = "user"

  constructor(private http: HttpClient,
              private router: Router,
              private injector: Injector,
              private localStorage: LocalStorageService) {
  }

  basicUser(user: Partial<User>): User {
    return {
      ...user,
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
        },
        error: (error) => {
          console.log(error)
          this.router.navigate([frontRoutes.login])
        }
      })).subscribe();
  }

  updateCurrency(newCurrency: Currency, returnObs = false) {
    const apiService = this.injector.get(ApiService);
    const user = this.localStorage.getItem(this.userToken) as User;

    return apiService.putPostCover({
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
    const user = (this.localStorage.getItem(this.userToken) as User | undefined);
    return this.http.get<any>(this.url, {
      params: {
        login: user?.login || '',
        password: user?.password || ''
      },
      observe: "response"
    }).pipe(map((response) => {
        if (response.status === 200 && (response.body[0] as User).id === user?.id) {
          this.localStorage.setItem(this.userToken, response.body[0]);
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
    return !!this.localStorage.getItem(this.userToken);
  }

  logout() {
    this.localStorage.removeItem(this.userToken);
    this.router.navigate([frontRoutes.login])
  }
}
