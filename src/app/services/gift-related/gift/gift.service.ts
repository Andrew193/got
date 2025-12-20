import { Injectable } from '@angular/core';
import { GiftConfig } from '../../../models/gift.model';
import { IdEntity } from '../../../models/common.model';
import { API_ENDPOINTS } from '../../../constants';
import { BaseConfigApiService } from '../../abstract/base-config-api/base-config-api.service';

@Injectable({
  providedIn: 'root',
})
export class GiftService extends BaseConfigApiService<GiftConfig> {
  override url = `/${API_ENDPOINTS.gift}`;

  claimGiftReward(giftConfig: GiftConfig, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(giftConfig, { url: this.url, callback }).subscribe();
  }
}
