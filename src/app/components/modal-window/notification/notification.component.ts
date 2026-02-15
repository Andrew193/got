import { Component, DestroyRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ImageComponent } from '../../views/image/image.component';
import { RewardsCalendarComponent } from '../../common/rewards-calendar/rewards-calendar.component';
import { DayReward } from '../../daily-reward/daily-reward.component';
import { DailyRewardService } from '../../../services/daily-reward/daily-reward.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationActivity } from '../../../models/notification.model';
import { NotificationHelperService } from './meta/notification-helper.service';
import { DynamicComponentConfig, HasFooterHost } from '../modal-interfaces';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';
import { AsyncPipe, PercentPipe } from '@angular/common';
import { TimeService } from '../../../services/time/time.service';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { MAX_REWARD_TIME } from '../../../constants';

@Component({
  selector: 'app-notification',
  imports: [ImageComponent, RewardsCalendarComponent, RewardCoinComponent, AsyncPipe, PercentPipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit, Partial<HasFooterHost> {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true }) footerHost!: ViewContainerRef;
  destroyRef = inject(DestroyRef);

  dailyRewardService = inject(DailyRewardService);
  helper = inject(NotificationHelperService);
  timeService = inject(TimeService);
  data = inject<DynamicComponentConfig<{}>>(DYNAMIC_COMPONENT_DATA);
  convertToHoursOrMilliseconds = TimeService.convertToHoursOrMilliseconds;

  constructor() {
    this.steps = this.dailyRewardService.getWeekReward(10, 5);
    this.activities = this.helper.getActivities();
  }

  steps: DayReward[] = [];
  stepsRewardConfig = this.helper.getStepsRewardConfig();

  //Activities
  activities;

  flipActivityCover(index: number) {
    this.activities = this.helper.flipActivity(index);
  }

  activityCover(event: MouseEvent, activity: NotificationActivity) {
    event.stopPropagation();
    this.data.close();
    activity.action && activity.action();
  }

  //Hooks
  ngOnInit() {
    this.helper.userService.$user.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(model => {
      model && this.helper.configStepsRewardConfig(model);
    });
  }

  protected readonly MAX_REWARD_TIME = MAX_REWARD_TIME;
}
