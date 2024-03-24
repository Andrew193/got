import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {DisplayReward, RewardService} from "../../services/reward/reward.service";
import {Router} from "@angular/router";
import {frontRoutes} from "../../app.routes";

@Component({
    selector: 'app-summon-tree',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './summon-tree.component.html',
    styleUrl: './summon-tree.component.scss'
})
export class SummonTreeComponent {
    rewards: DisplayReward[] = [];
    constructor(private rewardService: RewardService,
                private route: Router) {
    }

    items = [
        {name: this.rewardService.rewardNames.copper, probability: 0.70},
        {name: this.rewardService.rewardNames.silver, probability: 0.45},
        {name: this.rewardService.rewardNames.shards, probability: 0.20},
        {name: this.rewardService.rewardNames.gold, probability: 0.01},
    ];

    getReward(amountOfRewards = 1) {
        this.rewards = [];
        for (let i = 0; i < amountOfRewards; i++) {
            this.rewards = [...this.rewards, this.rewardService.getLootForReward(this.rewardService.openBox(this.items))];
        }
    }

    goToMainPage() {
        this.route.navigate([frontRoutes.base])
    }
}
