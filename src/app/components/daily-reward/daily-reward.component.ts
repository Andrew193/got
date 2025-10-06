import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HeroesService } from '../../services/heroes/heroes.service';
import { OutsideClickDirective } from '../../directives/outside-click/outside-click.directive';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { StatsComponent } from '../views/stats/stats.component';
import { DailyRewardService } from '../../services/daily-reward/daily-reward.service';
import { Unit } from '../../models/unit.model';
import { UsersService } from '../../services/users/users.service';
import { TODAY } from '../../constants';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RewardsCalendarComponent } from '../common/rewards-calendar/rewards-calendar.component';
import { EffectsHighlighterComponent } from '../common/effects-highlighter/effects-highlighter.component';
import { DailyReward } from '../../models/reward-based.model';

export interface DayReward {
  copperCoin: number;
  silverCoin?: number;
  goldCoin?: number;
  summonScroll?: number;
  summonCard?: number;
  heroShard?: number;
}

@Component({
  selector: 'app-daily-reward',
  imports: [
    ModalModule,
    OutsideClickDirective,
    TooltipModule,
    StatsComponent,
    RewardsCalendarComponent,
    EffectsHighlighterComponent,
  ],
  templateUrl: './daily-reward.component.html',
  styleUrl: './daily-reward.component.scss',
})
export class DailyRewardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() closePopup: () => void = () => {};
  @ViewChild('heroInFrame') heroInFrame: any;

  notificationService = inject(NotificationsService);
  destroyRef = inject(DestroyRef);
  isHeroPreview = false;
  rewardHero: Unit;
  month: DayReward[] = [];
  dailyRewardConfig: DailyReward = {
    id: '',
    userId: '',
    day: 0,
    totalDays: 0,
    lastLogin: '',
  };

  constructor(
    public heroService: HeroesService,
    protected dailyRewardService: DailyRewardService,
    public usersService: UsersService,
    private render2: Renderer2,
  ) {
    this.rewardHero = this.heroService.getBasicUserConfig() as Unit;
    this.month = this.dailyRewardService.monthReward(this.dailyRewardConfig.totalDays || 1);
    document.body.style.overflow = 'hidden';
  }

  claimed = (i: number) => i + 1 <= (this.dailyRewardConfig.day || 0);
  rewardClass = (i: number) => (+this.dailyRewardConfig.day === i ? 'today' : '');

  showHeroPreview() {
    this.isHeroPreview = !this.isHeroPreview;
  }

  ngOnInit(): void {
    this.rewardHero = this.heroService.getPriest();

    this.dailyRewardService._data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(config => {
      this.dailyRewardConfig = {
        ...(config || this.dailyRewardConfig),
        userId: config.userId,
      };
      this.month = this.dailyRewardService.monthReward(this.dailyRewardConfig.totalDays || 1);
    });
  }

  claimReward = (reward: DayReward) => {
    if (this.dailyRewardConfig.lastLogin !== TODAY) {
      this.dailyRewardService.claimDailyReward(
        {
          ...this.dailyRewardConfig,
          day: this.dailyRewardConfig.day + 1 === 28 ? 0 : this.dailyRewardConfig.day + 1,
          totalDays: this.dailyRewardConfig.totalDays + 1,
          lastLogin: TODAY,
        },
        newConfig => {
          this.usersService.updateCurrency({
            copper: reward.copperCoin || 0,
            silver: reward.silverCoin || 0,
            gold: reward.goldCoin || 0,
          });
          this.dailyRewardConfig = newConfig as DailyReward;
          this.notificationService.notificationsValue(NotificationType.daily_reward, false);
        },
      );
    }
  };

  ngAfterViewInit(): void {
    this.render2.setStyle(
      this.heroInFrame.nativeElement,
      'background',
      `url(${this.rewardHero?.fullImgSrc})`,
    );
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
