import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User, UsersService} from "../users/users.service";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {tap} from "rxjs";

export interface GiftConfig {
  id: string,
  userId: string,
  lastVist: string
}

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  url = "http://localhost:3000/giftTrip";

  constructor(private http: HttpClient,
              private userService: UsersService,
              private localStorageService: LocalStorageService) {
  }

  getGiftRewardConfig(callback: (config: GiftConfig) => void) {
    const [user] = this.localStorageService.getItem(this.userService.userToken) as User[];

    this.http.get<GiftConfig[]>(this.url, {
      params: {
        userId: user.id
      }
    }).pipe(tap({
      next: (giftConfig) => {
        callback(giftConfig[0]);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  claimGiftReward(giftConfig: GiftConfig, callback: (newConfig: GiftConfig) => void) {
    this.http.put<GiftConfig>(this.url + `/${giftConfig.id}`, giftConfig).pipe(tap({
      next: (giftConfigConfig) => {
        callback(giftConfigConfig);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }
}
