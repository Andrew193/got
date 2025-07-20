import {Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {User, UsersService} from "../users/users.service";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {tap} from "rxjs";
import {ApiService} from "../abstract/api/api.service";
import {GiftConfig, IdEntity} from "../../interface";

@Injectable({
  providedIn: 'root'
})
export class GiftService extends ApiService {
  url = "/giftTrip";

  constructor(http: HttpClient,
              private userService: UsersService,
              private localStorageService: LocalStorageService) {
    super(http);
  }

  getGiftRewardConfig(callback: (config: GiftConfig, userId: string) => void) {
    const user = this.localStorageService.getItem(this.userService.userToken) as User;

    this.http.get<GiftConfig[]>(this.url, {
      params: {
        userId: user.id
      }
    }).pipe(tap({
      next: (giftConfig) => {
        callback(giftConfig[0], user.id);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  claimGiftReward(giftConfig: GiftConfig, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(giftConfig, {url: this.url, callback});
  }
}
