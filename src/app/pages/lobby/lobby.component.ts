import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  model,
  OnInit,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { frontRoutes } from '../../constants';
import { NotificationType } from '../../services/notifications/notifications.service';
import { NotificationMarkerComponent } from '../../directives/notification-marker/notification-marker.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight/highlight.directive';
import { TestDirective } from '../../directives/test/test.directive';
import { NgTemplateOutlet } from '@angular/common';
import { NumbersService, NumbersService2 } from '../../services/numbers/numbers.service';

export interface route {
  name: string;
  url: string;
  src: string;
}

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
