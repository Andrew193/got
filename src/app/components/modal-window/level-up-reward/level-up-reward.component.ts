import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DynamicComponentConfig } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { Currency } from '../../../services/users/users.interfaces';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { Coin } from '../../../models/reward-based.model';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';

export interface LevelUpRewardData {
  newLevel: number;
  currencyReward: Currency;
  shardRecipients: { heroName: HeroesNamesCodes; heroImgSrc: string }[] | null;
}

@Component({
  selector: 'app-level-up-reward',
  imports: [RewardCoinComponent],
  templateUrl: './level-up-reward.component.html',
  styleUrl: './level-up-reward.component.scss',
})
export class LevelUpRewardComponent implements OnInit {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true }) footerHost!: ViewContainerRef;

  data = inject<DynamicComponentConfig<LevelUpRewardData>>(DYNAMIC_COMPONENT_DATA);
  private currencyHelperService = inject(CurrencyHelperService);

  rewards: Coin[] = [];

  get newLevel() {
    return this.data.newLevel;
  }

  get shardRecipients() {
    return this.data.shardRecipients;
  }

  ngOnInit() {
    this.rewards = this.currencyHelperService.convertCurrencyToCoin(this.data.currencyReward);
  }
}
