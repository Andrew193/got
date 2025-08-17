import {inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DailyRewardService} from "../daily-reward/daily-reward.service";
import moment from "moment/moment";
import {DATE_FORMAT} from "../../constants";
import {GiftService} from "../gift/gift.service";
import {ModalWindowService} from "../modal/modal-window.service";
import {ModalStrategiesTypes} from "../../components/modal-window/modal-interfaces";

export enum NotificationType {
  daily_reward,
  gift_store
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private dailyRewardService = inject(DailyRewardService);
  private giftService = inject(GiftService);
  private modalWindowService = inject(ModalWindowService);

  private initNotificationConfig = new Map(Object.entries({
    [NotificationType.daily_reward]: false,
    [NotificationType.gift_store]: false,
  }))

  private notifications: BehaviorSubject<Map<string, boolean>> = new BehaviorSubject(this.initNotificationConfig);
  readonly $notifications = this.notifications.asObservable();

  private readonly today = moment().format(DATE_FORMAT)

  constructor() { }

  init() {
    const services = [
      {api: this.dailyRewardService, type: NotificationType.daily_reward},
      {api: this.giftService, type: NotificationType.gift_store}
    ];

    services.forEach((el) => {
      el.api.getConfig((config) => {
        console.log(config)
        if(config.lastLogin !== this.today) {
          this.notificationsValue(el.type, true);
        }
      });
    })

    this.showPossibleActivities();
  }

  notificationsValue(key?: number, value?: boolean) {
    if(key !== undefined && value !== undefined) {
      const nValue = this.notificationsValue();
      nValue.set(key.toString(), value);

      this.notifications.next(structuredClone(nValue));
    }
    return this.notifications.getValue();
  }

  getNotification(key: number, notificationMap: Map<string, boolean>) {
    return notificationMap.get(key.toString());
  }

  private showPossibleActivities() {
    const config = this.modalWindowService.getModalConfig('', 'test', 'Ok',
      {
        open: true,
        callback: () => {},
        strategy: ModalStrategiesTypes.base
      });

   // this.modalWindowService.openModal(config);
  }
}
