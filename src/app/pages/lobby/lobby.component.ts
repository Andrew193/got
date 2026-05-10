import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { NotificationMarkerComponent } from '../../directives/notification-marker/notification-marker.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { MatDivider, MatList, MatListItem } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { selectDailyRewardFlag } from '../../store/selectors/lobby.selectors';
import { LobbyService } from '../../services/lobby/lobby.service';
import { ShortcutService } from '../../services/facades/shortcut/shortcut.service';
import { BasicStoresHolderComponent } from '../../components/views/basic-stores-holder/basic-stores-holder.component';
import { ContainerLabelComponent } from '../../components/views/container-label/container-label.component';
import { NotificationType } from '../../services/notifications/notifications.service';

export type Route = {
  name: string;
  url: string;
  src: string;
  closed?: boolean;
  notification?: NotificationType;
  click?: () => void;
};

@Component({
  selector: 'app-lobby',
  imports: [
    DailyRewardComponent,
    NotificationMarkerComponent,
    ImageComponent,
    NgTemplateOutlet,
    RouterLink,
    MatList,
    MatListItem,
    MatDivider,
    MatLine,
    AsyncPipe,
    BasicStoresHolderComponent,
    ContainerLabelComponent,
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit {
  shortcutService = inject(ShortcutService);
  destroyRef = inject(DestroyRef);

  helper = inject(LobbyService);
  nav = inject(NavigationService);
  store = inject(Store);

  readonly showDailyReward$ = this.store.select(selectDailyRewardFlag);

  showDailyReward = this.helper.showDailyReward;
  activities = this.helper.activities;
  pageRoutes = this.helper.pageRoutes;

  ngOnInit() {
    this.shortcutService.init(this.helper.notation, { destroyRef: this.destroyRef });
  }
}
