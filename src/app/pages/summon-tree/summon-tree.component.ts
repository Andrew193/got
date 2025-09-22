import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DisplayReward,
  RewardService,
} from '../../services/reward/reward.service';
import { Router } from '@angular/router';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { frontRoutes } from '../../constants';
import { RewardComponentInterface } from '../../models/reward-based.model';

@Component({
  selector: 'app-summon-tree',
  imports: [CommonModule, DisplayRewardComponent, ImageComponent],
  templateUrl: './summon-tree.component.html',
  styleUrl: './summon-tree.component.scss',
})
export class SummonTreeComponent implements RewardComponentInterface {
  constructor(
    public rewardService: RewardService,
    private route: Router
  ) {}

  rewards: DisplayReward[] = [];

  items = [
    { name: this.rewardService.rewardNames.cooper, probability: 0.7 },
    { name: this.rewardService.rewardNames.silver, probability: 0.45 },
    { name: this.rewardService.rewardNames.shards, probability: 0.2 },
    { name: this.rewardService.rewardNames.gold, probability: 0.01 },
  ];

  getReward(amountOfRewards = 1) {
    console.log([...this.rewardService.getReward(amountOfRewards, this.items)]);
    this.rewards = [
      ...this.rewardService.getReward(amountOfRewards, this.items),
    ];
  }

  goToMainPage() {
    this.route.navigate([frontRoutes.base]);
  }
}
