import { inject, Injectable } from '@angular/core';
import { ApiService } from '../abstract/api/api.service';
import { DailyReward } from '../../models/reward-based.model';
import { IdEntity } from '../../models/common.model';
import { API_ENDPOINTS } from '../../constants';
import { ConfigInterface } from '../../models/interfaces/config.interface';
import { DailyRewardHelperService } from './daily-reward-helper.service';

@Injectable({
  providedIn: 'root',
})
export class DailyRewardService
  extends ApiService<DailyReward>
  implements ConfigInterface<DailyReward>
{
  helper = inject(DailyRewardHelperService);

  getWeekReward = this.helper.getWeekReward;
  rewardCoins = this.helper.rewardCoins;
  monthReward = this.helper.monthReward;

  private url = `/${API_ENDPOINTS.daily}`;

  getConfig(callback: (config: DailyReward) => void) {
    return this.http
      .get<DailyReward[]>(this.url, {
        params: {
          userId: this.userId,
        },
      })
      .pipe(this.basicResponseTapParser(callback));
  }

  initConfigForNewUser(userId: string) {
    return this.http.post<DailyReward>(this.url, {
      userId,
      day: 0,
      totalDays: 0,
      lastLogin: '01/01/1970',
    });
  }

  claimDailyReward(reward: DailyReward, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(reward, { url: this.url, callback, returnObs: false });
  }
}
