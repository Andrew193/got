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
import { HeroesFacadeService } from '../../services/facades/heroes/heroes.service';
import { OutsideClickDirective } from '../../directives/outside-click/outside-click.directive';
import { StatsComponent } from '../views/stats/stats.component';
import { DailyRewardService } from '../../services/daily-reward/daily-reward.service';
import { Unit } from '../../models/units-related/unit.model';
import { UsersService } from '../../services/users/users.service';
import { TODAY } from '../../constants';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RewardsCalendarComponent } from '../common/rewards-calendar/rewards-calendar.component';
import { DailyReward } from '../../models/reward-based.model';
import { SkillsRenderComponent } from '../views/skills-render/skills-render.component';
import { TileUnit } from '../../models/field.model';
import { Store } from '@ngrx/store';
import { selectIsHeroPreview } from '../../store/reducers/daily-reward.reducer';
import { AsyncPipe } from '@angular/common';
import { toggleHeroPreview } from '../../store/actions/daily-reward.actions';

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
    OutsideClickDirective,
    StatsComponent,
    RewardsCalendarComponent,
    SkillsRenderComponent,
    AsyncPipe,
  ],
  templateUrl: './daily-reward.component.html',
  styleUrl: './daily-reward.component.scss',
})
export class DailyRewardComponent implements OnInit, AfterViewInit, OnDestroy {
  store = inject(Store);
  isHeroPreview = this.store.select(selectIsHeroPreview);

  @Input() closePopup: () => void = () => {};
  @ViewChild('heroInFrame') heroInFrame: any;

  notificationService = inject(NotificationsService);
  destroyRef = inject(DestroyRef);
  rewardHero!: Unit;
  tileRewardHero!: TileUnit;
  month: DayReward[] = [];
  dailyRewardConfig: DailyReward = {
    id: '',
    userId: '',
    day: 0,
    totalDays: 0,
    lastLogin: '',
  };

  constructor(
    public heroService: HeroesFacadeService,
    protected dailyRewardService: DailyRewardService,
    public usersService: UsersService,
    private render2: Renderer2,
  ) {
    this.month = this.dailyRewardService.monthReward(this.dailyRewardConfig.totalDays, 7);
    document.body.style.overflow = 'hidden';
  }

  claimed = (i: number) => i + 1 <= (this.dailyRewardConfig.day || 0);
  rewardClass = (i: number) => (+this.dailyRewardConfig.day === i ? 'today' : '');

  showHeroPreview() {
    this.store.dispatch(toggleHeroPreview());
  }

  ngOnInit(): void {
    this.rewardHero = this.heroService.getPriest();
    this.tileRewardHero = this.heroService.getTileUnit(this.rewardHero);

    this.dailyRewardService._data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(config => {
      this.dailyRewardConfig = {
        ...(config || this.dailyRewardConfig),
        userId: config.userId,
      };
      this.month = this.dailyRewardService.monthReward(this.dailyRewardConfig.totalDays, 7);
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
