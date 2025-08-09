import {AfterViewInit, Component, inject, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ModalModule} from "ngx-bootstrap/modal";
import {HeroesService} from "../../services/heroes/heroes.service";
import {OutsideClickDirective} from "../../directives/outside-click/outside-click.directive";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {StatsComponent} from "../stats/stats.component";
import {DailyRewardService} from "../../services/daily-reward/daily-reward.service";
import moment from "moment";
import {Unit} from "../../models/unit.model";
import {ContextMenuTriggerDirective} from "../../directives/context-menu-trigger/context-menu-trigger.directive";
import {DailyReward} from "../../interface";
import {UsersService} from "../../services/users/users.service";
import {Skill} from "../../models/skill.model";
import {trackBySkill} from "../../helpers";
import {DATE_FORMAT} from "../../constants";
import {NotificationsService, NotificationType} from "../../services/notifications/notifications.service";
import {RewardCoinComponent} from "../reward-coin/reward-coin.component";

interface DayReward {
  copperCoin: number,
  silverCoin?: number,
  goldCoin?: number,
  summonScroll?: number,
  summonCard?: number,
  heroShard?: number,
}

@Component({
  selector: 'daily-reward',
  imports: [CommonModule, ModalModule, OutsideClickDirective, TooltipModule, StatsComponent, RewardCoinComponent, ContextMenuTriggerDirective],
  templateUrl: './daily-reward.component.html',
  styleUrl: './daily-reward.component.scss'
})
export class DailyRewardComponent implements OnInit, AfterViewInit, OnDestroy {
  notificationService = inject(NotificationsService);

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

  rewardCoins(reward: DayReward, day: number) {
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


  trackByMonthIndex(index: number) {
    return index;
  }

  showHeroPreview() {
    this.isHeroPreview = !this.isHeroPreview;
  }

  ngOnInit(): void {
    this.rewardHero = this.heroService.getPriest();
    this.dailyRewardService.getDailyRewardConfig((config, userId) => {
      this.dailyRewardConfig = {...(config || this.dailyRewardConfig), userId};
      this.month = this.monthReward;
    });
  }

  claimReward(reward: DayReward) {
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

  ngAfterViewInit(): void {
    this.render2.setStyle(this.heroInFrame.nativeElement, 'background', `url(${this.rewardHero?.fullImgSrc})`)
  }

  getWeekReward(copperCoinM = 1, silverCoin = 1, vipPointsM = 1, summonCardM = 1, summonScrollM = 1, dayM = 1): DayReward[] {
    return [
      {copperCoin: +(10000 * copperCoinM * dayM).toPrecision(3)},
      {copperCoin: +(15000 * (copperCoinM + 0.4 * dayM)).toPrecision(3)},
      {
        copperCoin: +(20000 * (copperCoinM + 0.2 * dayM)).toPrecision(3),
        silverCoin: +(150 * silverCoin * dayM).toPrecision(3)
      },
      {
        copperCoin: +(25000 * (copperCoinM + 0.7 * dayM)).toPrecision(3),
        goldCoin: +(75 * (silverCoin + 0.3 * dayM)).toPrecision(3)
      },
      {
        copperCoin: +(35000 * (copperCoinM + 1.2 * dayM)).toPrecision(3),
        summonCard: +(1 * summonCardM * dayM).toPrecision(3)
      },
      {
        copperCoin: +(45000 * (copperCoinM + 1.4 * dayM)).toPrecision(3),
        summonScroll: +(1 * summonScrollM * dayM).toPrecision(3)
      },
      {copperCoin: +(55000 * (copperCoinM + 1.7 * dayM)).toPrecision(3), heroShard: 25}
    ]
  }

  get monthReward(): DayReward[] {
    const rewards = [];
    for (let i = 0; i < 4; i++) {
      rewards.push(...this.getWeekReward(i + 1, i + 1, i + 1, i + 1, i + 1, this.dailyRewardConfig.totalDays || 1))
    }
    return rewards;
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

  protected readonly trackBySkill = trackBySkill;
}
