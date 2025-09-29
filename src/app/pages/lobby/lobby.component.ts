import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  model,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { frontRoutes } from '../../constants';
import { trackByRoute } from '../../helpers';
import { NotificationType } from '../../services/notifications/notifications.service';
import { NotificationMarkerComponent } from '../../directives/notification-marker/notification-marker.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight/highlight.directive';
import { TestDirective } from '../../directives/test/test.directive';
import { NgTemplateOutlet } from '@angular/common';

export interface route {
  name: string;
  url: string;
  src: string;
}

@Component({
  selector: 'app-user',
  template: `
    <div>Test</div>
    <input [(ngModel)]="value" />
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  test = model.required<{ test: string }>();

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
    RouterModule,
    NotificationMarkerComponent,
    ImageComponent,
    ReactiveFormsModule,
    FormsModule,
    HighlightDirective,
    TestDirective,
    NgTemplateOutlet,
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements AfterViewInit {
  directive = viewChild<HighlightDirective>('directive');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngAfterViewInit() {
    const _dir = this.directive();

    if (_dir) {
      _dir.onMouseEnter();
    }

    this.route.data.subscribe(console.log);
  }

  isShowDailyReward = false;

  pageRoutes: route[] = [
    { name: 'Таверна', url: frontRoutes.taverna, src: 'taverna.png' },
    { name: 'Казармы', url: '#', src: 'barracks.png' },
    {
      name: 'Тренировочный Лагерь',
      url: frontRoutes.training,
      src: 'weightlifting.png',
    },
    { name: 'Банкетный Зал', url: '#', src: 'banquet.png' },
    { name: 'Великое Древо', url: '#', src: 'tree.png' },
    { name: 'Сторожка', url: '#', src: 'knight.png' },
    { name: 'За Стену', url: frontRoutes.battleField, src: 'wall.png' },
  ];

  public openIronBank = () => {
    this.router.navigateByUrl(frontRoutes.ironBank);
  };

  public openSummonTree = () => {
    this.router.navigateByUrl(frontRoutes.summonTree);
  };

  public openGiftLand = () => {
    this.router.navigateByUrl(frontRoutes.giftStore);
  };

  public openDailyBoss = () => {
    this.router.navigateByUrl(frontRoutes.dailyBoss);
  };

  public showDailyReward = () => {
    this.isShowDailyReward = !this.isShowDailyReward;
  };

  public closePopup = () => {
    this.showDailyReward();
  };

  protected readonly trackByRoute = trackByRoute;

  activities = [
    {
      name: 'Поставки из Дара',
      src: 'icons/food',
      click: this.openGiftLand,
      notification: NotificationType.gift_store,
    },
    { name: 'Обмен с Кpастером', src: 'icons/towers' },
    { name: 'Награды Древа', src: 'icons/tree', click: this.openSummonTree },
    { name: 'Магазин Сторожки', src: 'icons/raven' },
    { name: 'Магазин Арены', src: 'icons/arena-icon' },
    { name: 'Награды за Стеной', src: 'icons/maps' },
    {
      name: 'Награды Входа',
      src: 'UI_Avatar_Unit_Alvar',
      click: this.showDailyReward,
      notification: NotificationType.daily_reward,
    },
    { name: 'Железный Банк', src: 'gold', click: this.openIronBank },
    { name: 'Ремесленики', src: 'silver' },
    {
      name: 'Ежедневный Босс',
      src: 'UI_Avatar_Unit_PolarBear',
      click: this.openDailyBoss,
    },
  ];
}
