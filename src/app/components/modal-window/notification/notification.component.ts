import {Component, DestroyRef, inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ImageComponent} from "../../views/image/image.component";
import {RewardsCalendarComponent} from "../../common/rewards-calendar/rewards-calendar.component";
import {DayReward} from "../../daily-reward/daily-reward.component";
import {DailyRewardService} from "../../../services/daily-reward/daily-reward.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {StepsReward} from "../../../models/notification.model";
import {NotificationHelperService} from "./meta/notification-helper.service";
import {HasFooterHost} from "../modal-interfaces";
import {RewardCoinComponent} from "../../views/reward-coin/reward-coin.component";
import {AsyncPipe, DecimalPipe} from "@angular/common";
import {TimeService} from "../../../services/time/time.service";

@Component({
  selector: 'app-notification',
  imports: [
    ImageComponent,
    RewardsCalendarComponent,
    RewardCoinComponent,
    AsyncPipe,
    DecimalPipe,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit, HasFooterHost {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;
  destroyRef = inject(DestroyRef);

  dailyRewardService = inject(DailyRewardService);
  helper = inject(NotificationHelperService);
  timeService = inject(TimeService);

  steps: DayReward[] = [];
  stepsRewardConfig: StepsReward = this.helper.getStepsRewardConfig();

  constructor() {
    this.steps = this.dailyRewardService.getWeekReward(10, 5)
  }

  ngOnInit(): void {
    this.helper.userService.$user
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((model) => {
        model && (this.stepsRewardConfig = this.helper.configStepsRewardConfig(model));
    })
  }
}
