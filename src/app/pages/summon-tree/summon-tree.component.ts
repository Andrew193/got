import { Component, inject } from '@angular/core';
import { DisplayReward, RewardService } from '../../services/reward/reward.service';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { RewardComponentInterface } from '../../models/reward-based.model';
import { DecimalPipe } from '@angular/common';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { DisplayRewardNames } from '../../store/store.interfaces';
import { setDisplayRewardState } from '../../store/actions/display-reward.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-summon-tree',
  imports: [DisplayRewardComponent, ImageComponent, DecimalPipe],
  templateUrl: './summon-tree.component.html',
  styleUrl: './summon-tree.component.scss',
})
export class SummonTreeComponent implements RewardComponentInterface {
  store = inject(Store);
  contextName = DisplayRewardNames.summon;

  nav = inject(NavigationService);

  constructor(public rewardService: RewardService) {}

  rewards: DisplayReward[] = [];

  items = [
    { name: this.rewardService.rewardNames.copper, probability: 0.7 },
    { name: this.rewardService.rewardNames.silver, probability: 0.45 },
    { name: this.rewardService.rewardNames.shards, probability: 0.2 },
    { name: this.rewardService.rewardNames.gold, probability: 0.01 },
  ];

  getReward(amountOfRewards = 1) {
    this.rewards =
      amountOfRewards === 1
        ? [this.rewardService.getReward(1, this.items)]
        : this.rewardService.getReward(10, this.items);

    this.store.dispatch(setDisplayRewardState({ name: this.contextName, data: this.rewards }));
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
