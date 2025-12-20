import { inject, Injectable } from '@angular/core';
import { DailyReward } from '../../models/reward-based.model';
import { IdEntity } from '../../models/common.model';
import { API_ENDPOINTS } from '../../constants';
import { DailyRewardHelperService } from './daily-reward-helper.service';
import { BaseConfigApiService } from '../abstract/base-config-api/base-config-api.service';

@Injectable({
  providedIn: 'root',
})
export class DailyRewardService extends BaseConfigApiService<DailyReward> {
  helper = inject(DailyRewardHelperService);

  getWeekReward = this.helper.getWeekReward;
  rewardCoins = this.helper.rewardCoins;
  monthReward = this.helper.monthReward;

  override url = `/${API_ENDPOINTS.daily}`;
  override iniConfig = {
    day: 0,
    totalDays: 0,
    lastLogin: '01/01/1970',
  };

  claimDailyReward(reward: DailyReward, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(reward, { url: this.url, callback }).subscribe();
  }
}
