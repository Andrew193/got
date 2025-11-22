import { Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost, ModalBase } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { RewardService } from '../../../services/reward/reward.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { Coin } from '../../../models/reward-based.model';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';

@Component({
  selector: 'app-after-battle',
  imports: [RewardCoinComponent],
  templateUrl: './after-battle.component.html',
  styleUrl: './after-battle.component.scss',
})
export class AfterBattleComponent implements Partial<HasFooterHost>, OnInit, OnDestroy {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true }) footerHost!: ViewContainerRef;

  data = inject<ModalBase & { close: () => void }>(DYNAMIC_COMPONENT_DATA);
  rewardService = inject(RewardService);
  currencyHelperService = inject(CurrencyHelperService);
  rewards: Coin[] = [];

  ngOnInit() {
    this.rewards = this.currencyHelperService.convertCurrencyToCoin(
      this.rewardService.mostResentRewardCurrency,
    );
  }

  ngOnDestroy() {
    this.rewardService.resetMostResentRewardCurrency();
  }
}
