import { inject, Injectable } from '@angular/core';
import { DisplayReward, RewardBox, RewardService } from '../../reward/reward.service';
import { DisplayRewardActions } from '../../../store/actions/display-reward.actions';
import { Store } from '@ngrx/store';
import { DisplayRewardNames } from '../../../store/store.interfaces';
import { LoaderService } from '../../resolver-loader/loader.service';
import { CURRENCY_NAMES, frontRoutes, USER_TOKEN } from '../../../constants';
import { SummonTreeCard } from '../../../models/summon-tree/summon-tree.model';
import { UsersService } from '../../users/users.service';
import { HeroProgressService } from '../hero-progress/hero-progress.service';
import { HeroesSrcMap } from '../heroes/heroes.service';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { aggregateRewards, calculateNetCurrency } from './summon-tree.helpers';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { User } from '../../users/users.interfaces';

@Injectable()
export class SummonTreeService {
  store = inject(Store);
  loaderService = inject(LoaderService);
  rewardService = inject(RewardService);
  usersService = inject(UsersService);
  heroProgressService = inject(HeroProgressService);
  localStorage = inject(LocalStorageService);
  snackBar = inject(MatSnackBar);

  rewards: DisplayReward[] = [];
  contextName = DisplayRewardNames.summon;

  loader = this.loaderService.getPageLoader(frontRoutes.summonTree);

  items: RewardBox[] = [
    { name: this.rewardService.rewardNames.copper, probability: 0.7 },
    { name: this.rewardService.rewardNames.silver, probability: 0.45 },
    { name: this.rewardService.rewardNames.shards, probability: 0.2 },
    { name: this.rewardService.rewardNames.gold, probability: 0.05 },
  ];

  cartPrices: SummonTreeCard[] = [
    { price: 3, amount: 1, currency: CURRENCY_NAMES.silver },
    { price: 27, amount: 5, currency: CURRENCY_NAMES.silver },
    { price: 24, amount: 10, currency: CURRENCY_NAMES.silver },
  ];

  private lastCard: SummonTreeCard | null = null;
  private rewardGranted = false;

  getReward = (card: SummonTreeCard) => {
    this.lastCard = card;
    this.rewardGranted = false;
    this.rewards =
      card.amount === 1
        ? [this.rewardService.getReward(1, this.items)]
        : this.rewardService.getReward(card.amount, this.items);

    this.store.dispatch(
      DisplayRewardActions.setDisplayRewardState({ name: this.contextName, data: this.rewards }),
    );
  };

  onAllRevealed(revealed: boolean): void {
    if (!revealed || this.rewardGranted || !this.lastCard) {
      return;
    }

    this.rewardGranted = true;
    this.grantRewards();
  }

  private grantRewards(): void {
    const user = this.localStorage.getItem(USER_TOKEN) as User;

    if (!user) {
      return;
    }

    const aggregated = aggregateRewards(this.rewards);
    const result = calculateNetCurrency(
      user.currency,
      this.lastCard!.price,
      aggregated.currency,
      this.lastCard!.currency,
    );

    if (!result.valid) {
      this.snackBar.open(result.error, 'Close', { duration: 4000 });

      return;
    }

    this.usersService.updateCurrency(result.net, { hardSet: true }).subscribe({
      error: err => console.error(err),
    });

    aggregated.shards.forEach(entry => {
      const heroName = (Object.keys(HeroesSrcMap) as HeroesNamesCodes[]).find(
        key => HeroesSrcMap[key].imgSrc === entry.heroImgSrc,
      );

      if (heroName) {
        this.heroProgressService.addShards(user.id, heroName, entry.amount).subscribe({
          error: err => console.error(err),
        });
      }
    });
  }
}
