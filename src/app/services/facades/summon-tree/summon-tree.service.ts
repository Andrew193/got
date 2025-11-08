import { inject, Injectable } from '@angular/core';
import { DisplayReward, Reward, RewardService } from '../../reward/reward.service';
import { DisplayRewardActions } from '../../../store/actions/display-reward.actions';
import { Store } from '@ngrx/store';
import { DisplayRewardNames } from '../../../store/store.interfaces';
import { LoaderService } from '../../resolver-loader/loader.service';
import { frontRoutes } from '../../../constants';
import { SummonTreeCard } from '../../../models/summon-tree/summon-tree.model';

@Injectable({
  providedIn: 'root',
})
export class SummonTreeService {
  store = inject(Store);
  loaderService = inject(LoaderService);
  rewardService = inject(RewardService);

  rewards: DisplayReward[] = [];
  contextName = DisplayRewardNames.summon;

  loader = this.loaderService.getPageLoader(frontRoutes.summonTree);

  items: Reward[] = [
    { name: this.rewardService.rewardNames.copper, probability: 0.7 },
    { name: this.rewardService.rewardNames.silver, probability: 0.45 },
    { name: this.rewardService.rewardNames.shards, probability: 0.2 },
    { name: this.rewardService.rewardNames.gold, probability: 0.05 },
  ];

  cartPrices: SummonTreeCard[] = [
    { price: 300, amount: 1 },
    { price: 2850, amount: 5 },
    { price: 2700, amount: 10 },
  ];

  getReward = (amountOfRewards = 1) => {
    this.rewards =
      amountOfRewards === 1
        ? [this.rewardService.getReward(1, this.items)]
        : this.rewardService.getReward(amountOfRewards, this.items);

    this.store.dispatch(
      DisplayRewardActions.setDisplayRewardState({ name: this.contextName, data: this.rewards }),
    );
  };
}
