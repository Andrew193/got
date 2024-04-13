import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {Router} from "@angular/router";
import {frontRoutes} from "../../app.routes";

export interface User {
  id: string,
  login: string,
  password: string
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  url = "/users";
  userToken = "user"

  constructor(private http: HttpClient,
              private router: Router,
              private localStorage: LocalStorageService) {
  }

  createUser(user: User, callback = (user: User) => {
  }) {
    this.http.post<User>(this.url, user).pipe(tap({
      next: (user) => {
        callback(user);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  login(user: User, callback = (user: User) => {
  }) {
    this.http.get<User>(this.url, {
      params: {
        login: user.login,
        password: user.password
      }
    }).pipe(tap({
      next: (user) => {
        callback(user);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  isAuth() {
    return !!this.localStorage.getItem(this.userToken);
  }

  logout() {
    this.localStorage.removeItem(this.userToken);
    this.router.navigate([frontRoutes.login])
  }
}
