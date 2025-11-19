import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { DailyRewardService } from '../daily-reward/daily-reward.service';
import { GiftService } from '../gift-related/gift/gift.service';
import { ModalWindowService } from '../modal/modal-window.service';
import { ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';
import { NotificationComponent } from '../../components/modal-window/notification/notification.component';
import { TODAY } from '../../constants';
import { NotificationConfigMap } from '../../models/notification.model';
import { InitInterface } from '../../models/interfaces/init.interface';
import { InitTaskObs } from '../../models/init.model';
import { ConfigInterface } from '../../models/interfaces/config.interface';
import { GetConfig } from '../../models/common.model';
import { DepositService } from '../users/currency/deposit.service';
import { DailyBossApiService } from '../facades/daily-boss/daily-boss-api.service';

export enum NotificationType {
  daily_reward,
  gift_store,
  deposit,
  daily_boss,
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService implements InitInterface {
  private dailyRewardService = inject(DailyRewardService);
  private giftService = inject(GiftService);
  private dailyBossService = inject(DailyBossApiService);
  private depositService = inject(DepositService);

  private modalWindowService = inject(ModalWindowService);

  private initNotificationConfig = new Map()
    .set(NotificationType.daily_reward, false)
    .set(NotificationType.daily_boss, false)
    .set(NotificationType.gift_store, false);

  private notifications: BehaviorSubject<NotificationConfigMap> =
    new BehaviorSubject<NotificationConfigMap>(new Map(this.initNotificationConfig));

  readonly $notifications = this.notifications.asObservable();

  init() {
    this.drop();

    try {
      const services: { api: ConfigInterface<GetConfig>; type: NotificationType }[] = [
        { api: this.dailyRewardService, type: NotificationType.daily_reward },
        { api: this.giftService, type: NotificationType.gift_store },
        { api: this.dailyBossService, type: NotificationType.daily_boss },
        { api: this.depositService, type: NotificationType.deposit },
      ];

      services.forEach(el => {
        el.api
          .getConfig(config => {
            if (config['lastLogin'] && config['lastLogin'] !== TODAY) {
              this.notificationsValue(el.type, true);
            } else if (config['depositDay']) {
              this.notificationsValue(el.type, true);
            } else {
              this.notificationsValue(el.type, false);
            }
          })
          .subscribe();
      });

      this.showPossibleActivities();

      return of({ ok: true, message: 'Notifications has been inited' } satisfies InitTaskObs);
    } catch (e) {
      return of({ ok: false, message: 'Failed to init notifications' } satisfies InitTaskObs);
    }
  }

  notificationsValue(key?: NotificationType, value?: boolean) {
    if (key !== undefined && value !== undefined) {
      const nValue = this.notificationsValue();

      nValue.set(key, value);

      this.notifications.next(structuredClone(nValue));
    }

    return this.notifications.getValue();
  }

  getNotification(key: NotificationType, notificationMap: NotificationConfigMap | undefined) {
    debugger;

    return notificationMap ? notificationMap.get(key) : false;
  }

  private showPossibleActivities() {
    const config = this.modalWindowService.getModalConfig('', '', '', {
      open: true,
      callback: () => {},
      strategy: ModalStrategiesTypes.component,
      component: NotificationComponent,
    });

    this.modalWindowService.openModal(config);
  }

  drop() {
    this.notifications.next(this.initNotificationConfig);
  }
}
