import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {DisplayReward, RewardService} from "../../services/reward/reward.service";
import {Router} from "@angular/router";
import {frontRoutes} from "../../app.routes";
import {RewardComponent} from "../../interface";
import {DisplayRewardComponent} from "../display-reward/display-reward.component";

@Component({
  selector: 'app-summon-tree',
  standalone: true,
  imports: [CommonModule, DisplayRewardComponent],
  templateUrl: './summon-tree.component.html',
  styleUrl: './summon-tree.component.scss'
})
export class SummonTreeComponent implements RewardComponent {
  constructor(public rewardService: RewardService,
              private route: Router) {
  }

  rewards: DisplayReward[] = [];

  items = [
    {name: this.rewardService.rewardNames.copper, probability: 0.70},
    {name: this.rewardService.rewardNames.silver, probability: 0.45},
    {name: this.rewardService.rewardNames.shards, probability: 0.20},
    {name: this.rewardService.rewardNames.gold, probability: 0.01},
  ];

  getReward(amountOfRewards = 1) {
    this.rewards = this.rewardService.getReward(amountOfRewards, this.items);
  }

  goToMainPage() {
    this.route.navigate([frontRoutes.base])
  }
}
