import { inject, Injectable } from '@angular/core';
import { NotificationActivity, StepsReward } from '../../../../models/notification.model';
import { Currency, User } from '../../../../services/users/users.interfaces';
import { DayReward } from '../../../daily-reward/daily-reward.component';
import { concatMap, map, of } from 'rxjs';
import { UsersService } from '../../../../services/users/users.service';
import { NotificationActivities } from './notification-constants';
import { TODAY } from '../../../../constants';
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
  timeService = inject(TimeService);
  numbersService = inject(NumbersService);
  lobbyService = inject(LobbyService);

  private activities: NotificationActivity[] = (() =>
    NotificationActivities(this.lobbyService.nav, this.lobbyService))();

  private labels: Record<number, string> = {
    0: '2 hours',
    1: '4 hours',
    2: '8 hours',
    3: '12 hours',
    4: '24 hours',
  };

  private baseStepsRewardConfig: StepsReward = {
    time: 0,
    claimedRewards: [],
  };

  checkAvailableRewards(config: any) {
    const hours = this.timeService.convertToHours(config.time);

    return Object.values(this.labels)
      .map(label => +label.split(' ')[0])
      .filter(step => hours >= step && !config.claimedRewards.includes(step));
  }

  configStepsRewardConfig(model: User): StepsReward {
    this.baseStepsRewardConfig = {
      time: model.online.onlineTime,
      claimedRewards: model.online.claimedRewards,
    };

    return this.getStepsRewardConfig();
  }

  getStepsRewardConfig() {
    return { ...this.baseStepsRewardConfig };
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
    return !!this.baseStepsRewardConfig.claimedRewards[i];
  };

  public rewardClass = (i: number) => {
    return this.baseStepsRewardConfig.claimedRewards.length === i ? 'today' : '';
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
    const onlineTime = this.timeService.convertToHours(this.baseStepsRewardConfig.time);
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
