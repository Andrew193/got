import {Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {User, UsersService} from "../users/users.service";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {tap} from "rxjs";
import {DailyReward, IdEntity} from "../../interface";
import {ApiService} from "../abstract/api/api.service";

@Injectable({
  providedIn: 'root'
})
export class DailyRewardService extends ApiService {
  url = "/dailyReward";

  constructor(http: HttpClient,
              private userService: UsersService,
              private localStorageService: LocalStorageService) {
    super(http)
  }

  getDailyRewardConfig(callback: (config: DailyReward, userId: string) => void) {
    const user = this.localStorageService.getItem(this.userService.userToken) as User;

    this.http.get<DailyReward[]>(this.url, {
      params: {
        userId: user.id
      }
    }).pipe(tap({
      next: (dailyRewardConfig) => {
        callback(dailyRewardConfig[0], user.id);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  claimDailyReward(reward: DailyReward, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(reward, {url: this.url, callback});
  }
}
