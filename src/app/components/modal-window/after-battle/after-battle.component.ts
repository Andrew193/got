import { Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DynamicComponentConfig, HasFooterHost } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { RewardService } from '../../../services/reward/reward.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { Currency } from '../../../services/users/users.interfaces';
import { Coin } from '../../../models/reward-based.model';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';
import { MatDialogClose } from '@angular/material/dialog';

export type AfterBattleData = {
  reward: Currency;
  headerMessage: string;
  headerClass: string;
};

@Component({
  selector: 'app-after-battle',
  imports: [RewardCoinComponent, MatDialogClose],
  templateUrl: './after-battle.component.html',
  styleUrl: './after-battle.component.scss',
})
export class AfterBattleComponent implements Partial<HasFooterHost>, OnInit, OnDestroy {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true }) footerHost!: ViewContainerRef;

  data = inject<DynamicComponentConfig<AfterBattleData>>(DYNAMIC_COMPONENT_DATA);
  rewardService = inject(RewardService);
  currencyHelperService = inject(CurrencyHelperService);
  rewards: Coin[] = [];

  ngOnInit() {
    this.rewards = this.currencyHelperService.convertCurrencyToCoin(
      this.data.reward || this.rewardService.mostResentRewardCurrency,
    );
  }

  ngOnDestroy() {
    this.rewardService.resetMostResentRewardCurrency();
  }
}
