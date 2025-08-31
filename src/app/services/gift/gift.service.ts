import {Injectable} from '@angular/core';
import {ApiService} from "../abstract/api/api.service";
import {GiftConfig} from "../../models/gift.model";
import {IdEntity} from "../../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class GiftService extends ApiService<GiftConfig> {
  private url = "/giftTrip";

  getConfig(callback: (config: GiftConfig, userId: string) => void) {
    this.http.get<GiftConfig[]>(this.url, {
      params: {
        userId: this.userId
      }
    }).pipe(this.basicResponseTapParser(callback)).subscribe();
  }

  claimGiftReward(giftConfig: GiftConfig, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(giftConfig, {url: this.url, callback});
  }
}
