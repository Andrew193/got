import {Injectable} from '@angular/core';
import {tap} from "rxjs";
import {DailyReward, IdEntity} from "../../interface";
import {ApiService} from "../abstract/api/api.service";

@Injectable({
  providedIn: 'root'
})
export class DailyRewardService extends ApiService<DailyReward> {
  private url = "/dailyReward";

  getConfig(callback: (config: DailyReward, userId: string) => void) {
    this.http.get<DailyReward[]>(this.url, {
      params: {
        userId: this.userId
      }
    }).pipe(this.basicResponseTapParser(callback)).subscribe();
  }

  claimDailyReward(reward: DailyReward, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(reward, {url: this.url, callback});
  }
}
