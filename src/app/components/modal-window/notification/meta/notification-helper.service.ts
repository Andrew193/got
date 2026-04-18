import { inject, Injectable, signal } from '@angular/core';
import { NotificationActivity, StepsReward } from '../../../../models/notification.model';
import { Currency, User } from '../../../../services/users/users.interfaces';
import { DayReward } from '../../../daily-reward/daily-reward.component';
import { catchError, concatMap, EMPTY, finalize, map, of } from 'rxjs';
import { UsersService } from '../../../../services/users/users.service';
import { NotificationActivities } from './notification-constants';
import { MAX_REWARD_TIME, TODAY, USER_TOKEN } from '../../../../constants';
import { TimeService } from '../../../../services/time/time.service';
import { BaseLoyaltyBonus } from '../../../../services/daily-reward/daily-reward-constants';
import { NumbersService } from '../../../../services/numbers/numbers.service';
import { Coin } from '../../../../models/reward-based.model';
import { Cur } from '../../../../models/iron-bank.model';
import { LobbyService } from '../../../../services/lobby/lobby.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationHelperService {
  userService = inject(UsersService);
  numbersService = inject(NumbersService);
  lobbyService = inject(LobbyService);

  private activities: NotificationActivity[] = (() =>
    NotificationActivities(this.lobbyService.nav, this.lobbyService))();
  convertToHoursOrMilliseconds = TimeService.convertToHoursOrMilliseconds;

  private labels: Record<number, string> = {
    0: '2 hours',
    1: '4 hours',
    2: '8 hours',
    3: '12 hours',
    4: '24 hours',
  };

  isCollectingAll = signal<boolean>(false);

  private readonly baseStepsRewardConfig = signal<StepsReward>({
    time: 0,
    claimedRewards: [],
  });

  hasNextCycleRewards(): boolean {
    return this.convertToHoursOrMilliseconds(this.baseStepsRewardConfig().time) > MAX_REWARD_TIME;
  }

  collectAllRewards(steps: DayReward[]): void {
    const config = this.baseStepsRewardConfig();
    const totalHours = this.convertToHoursOrMilliseconds(config.time);
    const fullCycles = Math.floor(totalHours / MAX_REWARD_TIME);

    if (fullCycles < 1) {
      return;
    }

    const chain = Object.values(this.labels).map(l => +l.split(' ')[0]);

    // Суммируем награды всех циклов: оставшиеся шаги текущего + все шаги (fullCycles - 1) полных циклов
    const totalReward: Currency = { copper: 0, silver: 0, gold: 0 };

    const remainingCurrentCycle = this.checkAvailableRewards(config);

    remainingCurrentCycle.forEach(hour => {
      const idx = chain.indexOf(hour);
      const reward = steps[idx];

      totalReward.copper += reward.copperCoin || 0;
      totalReward.silver += reward.silverCoin || 0;
      totalReward.gold += reward.goldCoin || 0;
    });

    for (let i = 0; i < fullCycles - 1; i++) {
      steps.forEach(reward => {
        totalReward.copper += reward.copperCoin || 0;
        totalReward.silver += reward.silverCoin || 0;
        totalReward.gold += reward.goldCoin || 0;
      });
    }

    this.isCollectingAll.set(true);

    this.userService
      .updateCurrency(totalReward)
      .pipe(
        concatMap(() => this.userService.updateOnline({ collectAll: { cycles: fullCycles } })),
        catchError(() => EMPTY),
        finalize(() => {
          this.isCollectingAll.set(false);
          const user = this.userService.localStorage.getItem(USER_TOKEN) as User;

          if (user) {
            this.configStepsRewardConfig(user);
          }
        }),
      )
      .subscribe();
  }

  checkAvailableRewards(config: any) {
    const hours = this.convertToHoursOrMilliseconds(config.time);

    return Object.values(this.labels)
      .map(label => +label.split(' ')[0])
      .filter(step => hours >= step && !config.claimedRewards.includes(step));
  }

  configStepsRewardConfig(model: User) {
    this.baseStepsRewardConfig.set({
      time: model.online.onlineTime,
      claimedRewards: model.online.claimedRewards,
    });

    return this.getStepsRewardConfig();
  }

  getStepsRewardConfig() {
    return this.baseStepsRewardConfig;
  }

  getLabels() {
    return this.labels;
  }

  getActivities() {
    return this.activities;
  }

  flipActivity(i: number) {
    this.activities = this.activities.map((el, index) =>
      index === i ? { ...el, flipped: !el.flipped } : el,
    );

    return this.activities;
  }

  public claimed = (i: number) => {
    return !!this.baseStepsRewardConfig().claimedRewards[i];
  };

  public rewardClass = (i: number) => {
    return this.baseStepsRewardConfig().claimedRewards.length === i ? 'today' : '';
  };

  get canGetLoyaltyBonus() {
    return this.userService.$user.pipe(
      map(user => (user ? user.online.lastLoyaltyBonus !== TODAY : false)),
    );
  }

  loyaltyRewardBoostedBy(playedDays: number) {
    return this.numbersService.roundToStep(1 + (playedDays || 0) / 35, 0.01);
  }

  public claimReward = (reward: DayReward, i: number) => {
    const onlineTime = this.convertToHoursOrMilliseconds(this.baseStepsRewardConfig().time);
    const labels = this.getLabels();

    const currentHour = +labels[i].split(' ')[0];

    if (onlineTime >= currentHour) {
      const getReward = this.userService.updateCurrency({
        copper: reward.copperCoin || 0,
        silver: reward.silverCoin || 0,
        gold: reward.goldCoin || 0,
      });

      getReward
        .pipe(
          concatMap(res =>
            of(res).pipe(concatMap(() => this.userService.updateOnline({ claimed: currentHour }))),
          ),
        )
        .subscribe();
    }
  };

  getLoyaltyBonus(reward: Coin[]) {
    const totalReward: Currency = { copper: 0, gold: 0, silver: 0 };

    reward.forEach(part => {
      const key = part.class as Lowercase<Cur>;

      totalReward[key] += part.amount || 0;
    });

    const getReward = this.userService.updateCurrency(totalReward);

    getReward
      .pipe(
        concatMap(res =>
          of(res).pipe(concatMap(() => this.userService.updateOnline({ lastLoyaltyBonus: TODAY }))),
        ),
      )
      .subscribe();
  }

  boostedLoyaltyBonus(playedDays: number) {
    return BaseLoyaltyBonus.map(reward => {
      return {
        ...reward,
        amount: this.numbersService.roundToStep(
          reward.amount * this.loyaltyRewardBoostedBy(playedDays),
          1,
        ),
      };
    });
  }
}
