import { Component, inject, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { DecimalPipe } from '@angular/common';
import { CURRENCY_NAMES, USER_TOKEN } from '../../../constants';
import { UsersService } from '../../../services/users/users.service';
import { User } from '../../../services/users/users.interfaces';
import { BossRewardCurrency } from '../../../models/reward-based.model';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { NotificationMarkerComponent } from '../../../directives/notification-marker/notification-marker.component';
import {
  NotificationsService,
  NotificationType,
} from '../../../services/notifications/notifications.service';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import {
  ModalWindowBodyMessages,
  ModalWindowButtons,
  ModalWindowService,
} from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../modal-window/modal-interfaces';

@Component({
  selector: 'app-header',
  imports: [
    DecimalPipe,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NotificationMarkerComponent,
    MatDivider,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  notificationsService = inject(NotificationsService);
  usersService = inject(UsersService);
  localStorageService = inject(LocalStorageService);
  modalService = inject(ModalWindowService);
  readonly dialog = inject(MatDialog);

  user!: User;
  headerNotificationType = NotificationType.header;

  ngOnInit() {
    this.user = this.localStorageService.getItem(USER_TOKEN);

    this.localStorageService.updateLocalStorage$.subscribe(() => {
      this.user = this.localStorageService.getItem(USER_TOKEN);
    });
  }

  get currency() {
    return this.user.currency;
  }

  getDisplayCurrency(): Record<'alias' | 'amount', BossRewardCurrency | number>[] {
    const currency = this.currency;

    return [
      {
        alias: CURRENCY_NAMES.copper,
        amount: currency.copper,
      },
      {
        alias: CURRENCY_NAMES.silver,
        amount: currency.silver,
      },
      {
        alias: CURRENCY_NAMES.gold,
        amount: currency.gold,
      },
    ];
  }

  openLogoutDialog() {
    this.modalService.openModal(
      this.modalService.getModalConfig(
        '',
        ModalWindowBodyMessages.confirm_logout,
        {
          closeBtnLabel: ModalWindowButtons.yes,
          declineBtnLabel: ModalWindowButtons.no,
        },
        {
          strategy: ModalStrategiesTypes.base,
          callback: (response: boolean) => {
            response && this.usersService.logout();
          },
        },
      ),
    );
  }

  showPossibleActivities() {
    this.notificationsService.showPossibleActivities();
  }
}
