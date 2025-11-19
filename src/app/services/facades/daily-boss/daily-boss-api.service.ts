import { Injectable } from '@angular/core';
import { ApiService } from '../../abstract/api/api.service';
import { ConfigInterface } from '../../../models/interfaces/config.interface';
import { DailyBossConfig } from '../../../models/daily-boss.model';
import { API_ENDPOINTS } from '../../../constants';
import { IdEntity } from '../../../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class DailyBossApiService
  extends ApiService<DailyBossConfig>
  implements ConfigInterface<DailyBossConfig>
{
  private url = `/${API_ENDPOINTS.dailyBoss}`;

  getConfig(callback: (config: DailyBossConfig) => void) {
    return this.http
      .get<DailyBossConfig[]>(this.url, {
        params: {
          userId: this.userId,
        },
      })
      .pipe(this.basicResponseTapParser(callback));
  }

  initConfigForNewUser(userId: string) {
    return this.http.post<DailyBossConfig>(this.url, {
      lastLogin: '01/01/1970',
      userId,
    });
  }

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
