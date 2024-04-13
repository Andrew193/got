import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User, UsersService} from "../users/users.service";
import {LocalStorageService} from "../localStorage/local-storage.service";
import {tap} from "rxjs";

export interface DailyReward {
  id: string,
  userId: string,
  day: number,
  totalDays: number,
  lastLogin: string
}

@Injectable({
  providedIn: 'root'
})
export class DailyRewardService {
  url = "/dailyReward";

  constructor(private http: HttpClient,
              private userService: UsersService,
              private localStorageService: LocalStorageService) {
  }

  getDailyRewardConfig(callback: (config: DailyReward) => void) {
    const [user] = this.localStorageService.getItem(this.userService.userToken) as User[];

    this.http.get<DailyReward[]>(this.url, {
      params: {
        userId: user.id
      }
    }).pipe(tap({
      next: (dailyRewardConfig) => {
        callback(dailyRewardConfig[0]);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }

  claimDailyReward(reward: DailyReward, callback: (newConfig: DailyReward) => void) {
    this.http.put<DailyReward>(this.url + `/${reward.id}`, reward).pipe(tap({
      next: (dailyRewardConfig) => {
        callback(dailyRewardConfig);
      },
      error: (error) => {
        console.log(error)
      }
    })).subscribe();
  }
}
