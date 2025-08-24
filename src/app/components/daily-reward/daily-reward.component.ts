import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ModalModule} from "ngx-bootstrap/modal";
import {HeroesService} from "../../services/heroes/heroes.service";
import {OutsideClickDirective} from "../../directives/outside-click/outside-click.directive";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {StatsComponent} from "../views/stats/stats.component";
import {DailyRewardService} from "../../services/daily-reward/daily-reward.service";
import moment from "moment";
import {Unit} from "../../models/unit.model";
import {DailyReward} from "../../interface";
import {UsersService} from "../../services/users/users.service";
import {trackByIndex, trackBySkill} from "../../helpers";
import {DATE_FORMAT} from "../../constants";
import {NotificationsService, NotificationType} from "../../services/notifications/notifications.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RewardsCalendarComponent} from "../common/rewards-calendar/rewards-calendar.component";
import {EffectsHighlighterComponent} from "../common/effects-highlighter/effects-highlighter.component";

export interface DayReward {
  copperCoin: number,
  silverCoin?: number,
  goldCoin?: number,
  summonScroll?: number,
  summonCard?: number,
  heroShard?: number,
}

@Component({
  selector: 'daily-reward',
  imports: [CommonModule, ModalModule, OutsideClickDirective, TooltipModule, StatsComponent, RewardsCalendarComponent, EffectsHighlighterComponent],
  templateUrl: './daily-reward.component.html',
  styleUrl: './daily-reward.component.scss'
})
export class DailyRewardComponent implements OnInit, AfterViewInit, OnDestroy {
  notificationService = inject(NotificationsService);
  destroyRef = inject(DestroyRef);

  @Input() closePopup: () => void = () => {
  };
  @ViewChild('heroInFrame') heroInFrame: any;
  isHeroPreview: boolean = false;
  rewardHero: Unit;
  month: DayReward[] = [];
  dailyRewardConfig: DailyReward = {
    id: "",
    userId: "",
    day: 0,
    totalDays: 0,
    lastLogin: ""
  };

  daysCoins = new Map<number, any[]>();

  constructor(public heroService: HeroesService,
              private dailyRewardService: DailyRewardService,
              public usersService: UsersService,
              private render2: Renderer2) {
    this.rewardHero = this.heroService.getBasicUserConfig() as Unit;
    this.month = this.monthReward;
    document.body.style.overflow = "hidden";
  }

  claimed = (i: number) => i + 1 <= (this.dailyRewardConfig.day || 0)
  rewardClass = (i: number) => (+(this.dailyRewardConfig.day || 1) === i) ? 'today' : ''

  rewardCoins = (reward: DayReward, day: number) => {
    const coins = [];
    if (reward.copperCoin) coins.push({ class: 'copper', imgSrc: 'assets/resourses/imgs/copper.png', alt: 'copperCoin', amount: reward.copperCoin });
    if (reward.silverCoin) coins.push({ class: 'silver', imgSrc: 'assets/resourses/imgs/silver.png', alt: 'silverCoin', amount: reward.silverCoin });
    if (reward.goldCoin) coins.push({ class: 'gold', imgSrc: 'assets/resourses/imgs/gold.png', alt: 'goldCoin', amount: reward.goldCoin });
    if (reward.summonScroll) coins.push({ class: 'summon-scroll', imgSrc: 'assets/resourses/imgs/icons/card_scroll.png', alt: 'summonScroll', amount: reward.summonScroll });
    if (reward.summonCard) coins.push({ class: 'summon-card', imgSrc: 'assets/resourses/imgs/icons/hero_shard.png', alt: 'summonCard', amount: reward.summonCard });
    if (reward.heroShard) coins.push({ class: 'hero-shard', imgSrc: 'assets/resourses/imgs/icons/hero_puzzle.png', alt: 'heroShard', amount: reward.heroShard });

    this.daysCoins.has(day) ? this.daysCoins.get(day) : this.daysCoins.set(day, coins);
    return this.daysCoins.get(day);
  }

  showHeroPreview() {
    this.isHeroPreview = !this.isHeroPreview;
  }

  ngOnInit(): void {
    this.rewardHero = this.heroService.getPriest();

    this.dailyRewardService._data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((config) => {
        console.log(config);
      this.dailyRewardConfig = {...(config || this.dailyRewardConfig), userId: config.userId};
      this.month = this.monthReward;
    })
  }

  claimReward(reward: DayReward) {
    return () => {
      if (this.dailyRewardConfig.lastLogin !== moment().format(DATE_FORMAT)) {
        this.dailyRewardService.claimDailyReward({
          ...this.dailyRewardConfig,
          day: this.dailyRewardConfig.day + 1,
          totalDays: this.dailyRewardConfig.totalDays + 1,
          lastLogin: moment().format(DATE_FORMAT)
        }, (newConfig) => {
          this.usersService.updateCurrency({
            cooper: reward.copperCoin || 0,
            silver: reward.silverCoin || 0,
            gold: reward.goldCoin || 0
          })
          this.dailyRewardConfig = newConfig as DailyReward;
          this.notificationService.notificationsValue(NotificationType.daily_reward, false);
        })
      }
    }
  }

  ngAfterViewInit(): void {
    this.render2.setStyle(this.heroInFrame.nativeElement, 'background', `url(${this.rewardHero?.fullImgSrc})`);
  }

  private baseWeek(dayM = 1): DayReward[] {
    return [
      { copperCoin: 10000 * dayM },
      { copperCoin: 15000 * dayM },
      { copperCoin: 20000 * dayM, silverCoin: 150 * dayM },
      { copperCoin: 25000 * dayM, goldCoin: 75 * dayM },
      { copperCoin: 35000 * dayM, summonCard: 1 * dayM },
      { copperCoin: 45000 * dayM, summonScroll: 1 * dayM },
      { copperCoin: 55000 * dayM, heroShard: 25 },
    ];
  }

  private roundToStep(v: number, step = 100): number {
    return Math.round(v / step) * step;
  }

  getWeekReward(weekIndex0: number, totalDays: number): DayReward[] {
    const streakSteps = Math.floor((Math.max(totalDays, 1) - 1) / 7);
    const streakMultiplier = Math.min(1 + 0.15 * streakSteps, 3);

    const weekRamp = 1 + weekIndex0 * 1.12; // 0%, 12%, 24%, 36%

    const m = streakMultiplier * weekRamp;

    return this.baseWeek(1).map(r => ({
      copperCoin : r.copperCoin  ? this.roundToStep(r.copperCoin * m, 1000) : undefined,
      silverCoin : r.silverCoin  ? this.roundToStep(r.silverCoin * m, 10)   : undefined,
      goldCoin   : r.goldCoin    ? this.roundToStep(r.goldCoin   * m, 5)    : undefined,
      summonScroll: r.summonScroll,
      summonCard  : r.summonCard,
      heroShard   : r.heroShard,
    })) as DayReward[];
  }

  get monthReward(): DayReward[] {
    const rewards: DayReward[] = [];
    const total = this.dailyRewardConfig.totalDays || 1;
    for (let week = 0; week < 4; week++) {
      rewards.push(...this.getWeekReward(week, total));
    }
    return rewards;
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

  protected readonly trackBySkill = trackBySkill;
  protected readonly trackByIndex = trackByIndex;
}
