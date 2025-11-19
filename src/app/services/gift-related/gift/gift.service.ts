import { Injectable } from '@angular/core';
import { ApiService } from '../../abstract/api/api.service';
import { GiftConfig } from '../../../models/gift.model';
import { IdEntity } from '../../../models/common.model';
import { API_ENDPOINTS } from '../../../constants';
import { ConfigInterface } from '../../../models/interfaces/config.interface';

@Injectable({
  providedIn: 'root',
})
export class GiftService extends ApiService<GiftConfig> implements ConfigInterface<GiftConfig> {
  private url = `/${API_ENDPOINTS.gift}`;

  getConfig(callback: (config: GiftConfig) => void) {
    return this.http
      .get<GiftConfig[]>(this.url, {
        params: {
          userId: this.userId,
        },
      })
      .pipe(this.basicResponseTapParser(callback));
  }

  initConfigForNewUser(userId: string) {
    return this.http.post<GiftConfig>(this.url, {
      lastLogin: '01/01/1970',
      userId,
    });
  }

  claimGiftReward(giftConfig: GiftConfig, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(giftConfig, { url: this.url, callback, returnObs: false });
  }
}
