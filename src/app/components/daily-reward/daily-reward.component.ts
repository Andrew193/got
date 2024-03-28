import {AfterViewInit, Component, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ModalModule} from "ngx-bootstrap/modal";
import {HeroesService} from "../../services/heroes/heroes.service";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {StatsComponent} from "../stats/stats.component";
import {DailyReward, DailyRewardService} from "../../services/daily-reward/daily-reward.service";
import moment from "moment";
import {Unit} from "../../interface";

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
  standalone: true,
  imports: [CommonModule, ModalModule, OutsideClickDirective, TooltipModule, StatsComponent],
  templateUrl: './daily-reward.component.html',
  styleUrl: './daily-reward.component.scss'
})
export class DailyRewardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() closePopup: () => void = () => {
  };
  @ViewChild('heroInFrame') heroInFrame: any;
  isHeroPreview: boolean = false;
  rewardHero: Unit;
  month;
  dailyRewardConfig: DailyReward = {
    id: "",
    userId: "",
    day: 0,
    totalDays: 0,
    lastLogin: ""
  };

  constructor(public heroService: HeroesService,
              private dailyRewardService: DailyRewardService,
              private render2: Renderer2) {
    this.rewardHero = this.heroService.getBasicUserConfig() as Unit;
    this.month = this.monthReward;
    document.body.style.overflow = "hidden";
  }

  showHeroPreview() {
    this.isHeroPreview = !this.isHeroPreview;
  }

  ngOnInit(): void {
    this.rewardHero = this.heroService.getNightKing();
    this.dailyRewardService.getDailyRewardConfig((config) => {
      this.dailyRewardConfig = config;
      this.month = this.monthReward;
    });
  }

  claimReward() {
    if(this.dailyRewardConfig.lastLogin !== moment().format("MM/DD/YYYY")) {
      this.dailyRewardService.claimDailyReward({
        ...this.dailyRewardConfig,
        day: this.dailyRewardConfig.day + 1,
        totalDays: this.dailyRewardConfig.totalDays + 1,
        lastLogin: moment().format("MM/DD/YYYY")
      }, (newConfig) => {
        this.dailyRewardConfig = newConfig;
      })
    }
  }

  ngAfterViewInit(): void {
    this.render2.setStyle(this.heroInFrame.nativeElement, 'background', `url(${this.rewardHero?.fullImgSrc})`)
  }

  getWeekReward(copperCoinM = 1, silverCoin = 1, vipPointsM = 1, summonCardM = 1, summonScrollM = 1, dayM = 1): DayReward[] {
    return [
      {copperCoin: +(15000 * copperCoinM * dayM).toPrecision(3)},
      {copperCoin: +(20000 * (copperCoinM + 0.4 * dayM)).toPrecision(3)},
      {
        copperCoin: +(25000 * (copperCoinM + 0.2 * dayM)).toPrecision(3),
        silverCoin: +(1000 * silverCoin * dayM).toPrecision(3)
      },
      {
        copperCoin: +(35000 * (copperCoinM + 0.7 * dayM)).toPrecision(3),
        goldCoin: +(250 * (silverCoin + 0.3 * dayM)).toPrecision(3)
      },
      {
        copperCoin: +(45000 * (copperCoinM + 1.2 * dayM)).toPrecision(3),
        summonCard: +(1 * summonCardM * dayM).toPrecision(3)
      },
      {
        copperCoin: +(55000 * (copperCoinM + 1.4 * dayM)).toPrecision(3),
        summonScroll: +(1 * summonScrollM * dayM).toPrecision(3)
      },
      {copperCoin: +(75000 * (copperCoinM + 1.7 * dayM)).toPrecision(3), heroShard: 25}
    ]
  }

  get monthReward(): DayReward[] {
    const rewards = [];
    for (let i = 0; i < 4; i++) {
      rewards.push(...this.getWeekReward(i + 1, i + 1, i + 1, i + 1, i + 1, this.dailyRewardConfig.totalDays))
    }
    return rewards;
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

}
