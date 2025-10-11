import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  inject,
  input,
  model,
  OnInit,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { frontRoutes } from '../../constants';
import { NotificationType } from '../../services/notifications/notifications.service';
import { NotificationMarkerComponent } from '../../directives/notification-marker/notification-marker.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight/highlight.directive';
import { NgTemplateOutlet } from '@angular/common';
import { NumbersService, NumbersService2 } from '../../services/numbers/numbers.service';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { MatDivider, MatList, MatListItem } from '@angular/material/list';
import { MatLine } from '@angular/material/core';

export type Route = {
  name: string;
  url: string;
  src: string;
};

type Activity = {
  name: string;
  src: string;
  click?: () => void;
  notification?: NotificationType;
};

@Component({
  selector: 'app-test-2',
  template: ` <div style="background-color: #750000">Test 3 {{ test() }}</div> `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'test',
})
export class Test2Component implements OnInit {
  test = input('');

  constructor() {}

  ngOnInit() {
    console.log(this.test());
  }
}

@Component({
  selector: 'app-test',
  template: `
    <div style="background-color: #750000">
      Test 2
      <ng-content />
    </div>
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestComponent {
  constructor() {}
}

@Component({
  selector: 'app-user',
  providers: [
    {
      provide: NumbersService2,
      useExisting: NumbersService,
    },
  ],
  template: `
    <div style="background-color: #70ff70">
      Test
      <ng-content />
    </div>
    <input [(ngModel)]="value" />
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements AfterContentInit {
  test = model.required<{ test: string }>();
  content = contentChildren('secondC', { descendants: true });

  ngAfterContentInit() {
    console.log(this.content());
  }

  get value() {
    return this.test().test;
  }

  set value(newValue) {
    this.test.update(() => ({ test: newValue }));
  }

  constructor() {
    effect(() => {
      console.log(this.test(), 'child');
    });
  }
}

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
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements AfterViewInit {
  nav = inject(NavigationService);

  directive = viewChild<HighlightDirective>('directive');

  ngAfterViewInit() {
    const _dir = this.directive();

    if (_dir) {
      _dir.onMouseEnter();
    }
  }

  isShowDailyReward = false;

  pageRoutes: Route[] = [
    { name: 'Tavern', url: frontRoutes.taverna, src: 'taverna.png' },
    { name: 'Barracks', url: '#', src: 'barracks.png' },
    {
      name: 'Training ground',
      url: frontRoutes.training,
      src: 'weightlifting.png',
    },
    { name: 'Banquet Hall', url: '#', src: 'banquet.png' },
    { name: 'Great Tree', url: '#', src: 'tree.png' },
    { name: 'Watchtower', url: '#', src: 'knight.png' },
    { name: 'Beyond the Wall', url: frontRoutes.battleField, src: 'wall.png' },
  ];

  public showDailyReward = () => {
    this.isShowDailyReward = !this.isShowDailyReward;
  };

  activities: Activity[] = [
    {
      name: 'Gift',
      src: 'icons/food',
      click: this.nav.goToGiftLand.bind(this.nav),
      notification: NotificationType.gift_store,
    },
    { name: 'Kraster Exchange', src: 'icons/towers' },
    { name: 'Summon Tree', src: 'icons/tree', click: this.nav.goToSummonTree.bind(this.nav) },
    { name: 'Watchtower Store', src: 'icons/raven' },
    { name: 'Arena Store', src: 'icons/arena-icon' },
    { name: 'Wall Store', src: 'icons/maps' },
    {
      name: 'Daily Reward',
      src: 'UI_Avatar_Unit_Alvar',
      click: this.showDailyReward.bind(this.nav),
      notification: NotificationType.daily_reward,
    },
    {
      name: 'Iron Bank',
      src: 'gold',
      click: this.nav.goToIronBank.bind(this.nav),
      notification: NotificationType.deposit,
    },
    { name: 'Craftsmen', src: 'silver' },
    {
      name: 'Daily Boss',
      src: 'UI_Avatar_Unit_PolarBear',
      click: this.nav.goToDailyBoss.bind(this.nav),
    },
  ];
}
