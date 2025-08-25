import {Injectable} from '@angular/core';
import {DailyReward, IdEntity} from "../../interface";
import {ApiService} from "../abstract/api/api.service";
import {DayReward} from "../../components/daily-reward/daily-reward.component";

@Injectable({
  providedIn: 'root'
})
export class DailyRewardService extends ApiService<DailyReward> {
  daysCoins = new Map<number, any[]>();

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

  private url = "/dailyReward";

  getConfig(callback: (config: DailyReward, userId: string) => void) {
    this.http.get<DailyReward[]>(this.url, {
      params: {
        userId: this.userId
      }
    }).pipe(this.basicResponseTapParser(callback)).subscribe();
  }

  claimDailyReward(reward: DailyReward, callback: (newConfig: IdEntity) => void) {
    this.putPostCover(reward, {url: this.url, callback});
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

    return this.baseWeek(1).slice(0, totalDays).map(r => ({
      copperCoin : r.copperCoin  ? this.roundToStep(r.copperCoin * m, 1000) : undefined,
      silverCoin : r.silverCoin  ? this.roundToStep(r.silverCoin * m, 10)   : undefined,
      goldCoin   : r.goldCoin    ? this.roundToStep(r.goldCoin   * m, 5)    : undefined,
      summonScroll: r.summonScroll,
      summonCard  : r.summonCard,
      heroShard   : r.heroShard,
    })) as DayReward[];
  }

  monthReward(totalDays: number): DayReward[] {
    const rewards: DayReward[] = [];
    const total = totalDays || 1;
    for (let week = 0; week < 4; week++) {
      rewards.push(...this.getWeekReward(week, total));
    }
    return rewards;
  }
}
