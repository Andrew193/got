import { Injectable } from '@angular/core';
import { DailyBossConfig } from '../../../models/daily-boss.model';
import { API_ENDPOINTS } from '../../../constants';
import { IdEntity } from '../../../models/common.model';
import { BaseConfigApiService } from '../../abstract/base-config-api/base-config-api.service';

@Injectable({
  providedIn: 'root',
})
export class DailyBossApiService extends BaseConfigApiService<DailyBossConfig> {
  override url = `/${API_ENDPOINTS.dailyBoss}`;

  claimDailyBossReward(
    dailyBossConfig: Partial<DailyBossConfig>,
    callback: (newConfig: IdEntity) => void,
  ) {
    this.putPostCover(
      { ...this.getStaticData(), ...dailyBossConfig },
      { url: this.url, callback, returnObs: false },
    );
  }
}
