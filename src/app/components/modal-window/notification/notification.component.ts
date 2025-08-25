import {Component, inject, ViewChild, ViewContainerRef} from '@angular/core';
import {ImageComponent} from "../../views/image/image.component";
import {RewardsCalendarComponent} from "../../common/rewards-calendar/rewards-calendar.component";
import {DayReward} from "../../daily-reward/daily-reward.component";
import {DailyRewardService} from "../../../services/daily-reward/daily-reward.service";

@Component({
  selector: 'app-notification',
  imports: [
    ImageComponent,
    RewardsCalendarComponent
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  dailyRewardService = inject(DailyRewardService);
  labels = {
    0: '2 hours',
    1: '4 hours',
    2: '8 hours',
    3: '12 hours',
    4: '24 hours',
  }

  steps: DayReward[] = [];
  stepsRewardConfig: {step: number} = {
    step: 0
  }

  constructor() {
    this.steps = this.dailyRewardService.getWeekReward(10, 5)
  }

  claimReward = (reward: DayReward) => {
    this.stepsRewardConfig.step = this.stepsRewardConfig.step + 1;
  }

  claimed = (i: number) => i + 1 <= (this.stepsRewardConfig.step || 0)
  rewardClass = (i: number) => 'today' ;
}
