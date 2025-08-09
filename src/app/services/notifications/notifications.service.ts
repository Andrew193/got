import {inject, Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DailyRewardService} from "../daily-reward/daily-reward.service";
import moment from "moment/moment";
import {DATE_FORMAT} from "../../constants";

export enum NotificationType {
  daily_reward
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private dailyRewardService = inject(DailyRewardService);

  private initNotificationConfig = new Map(Object.entries({
    [NotificationType.daily_reward]: false,
  }))

  private notifications: BehaviorSubject<Map<string, boolean>> = new BehaviorSubject(this.initNotificationConfig);
  $notifications = this.notifications.asObservable();

  constructor() { }

  init() {
    this.dailyRewardService.getDailyRewardConfig((config, userId) => {
      const today = moment().format(DATE_FORMAT);

      if(config.lastLogin !== today) {
        console.log('t')
        this.notificationsValue(NotificationType.daily_reward, true);
      }
    });
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
}
