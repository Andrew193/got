import {Component, input} from '@angular/core';
import {NgForOf} from "@angular/common";
import {trackByIndex} from "../../../helpers";
import {RewardCoinComponent} from "../../views/reward-coin/reward-coin.component";
import {DayReward} from "../../daily-reward/daily-reward.component";

@Component({
  selector: 'app-rewards-calendar',
  imports: [
    NgForOf,
    RewardCoinComponent
  ],
  templateUrl: './rewards-calendar.component.html',
  styleUrl: './rewards-calendar.component.scss'
})
export class RewardsCalendarComponent {
  chainMode = input<boolean>(false);
  rewardPool = input.required<DayReward[]>();
  claimed = input.required<(i: number) => boolean>();
  claimReward = input.required<(reward: DayReward) => void>();
  rewardCoins = input.required<(reward: DayReward, day: number) => any[] | undefined>();
  rewardBackLabels = input<Record<number, string>>();

  rewardClass = input<(i: number) => string>((i) => '');
  protected readonly trackByIndex = trackByIndex;

  getLabel = (i: number) => {
    const _rewardBackLabels = this.rewardBackLabels();

    return !!_rewardBackLabels ? _rewardBackLabels[i] : `День ${i + 1}`;
  }
}
