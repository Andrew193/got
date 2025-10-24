import { Injectable } from '@angular/core';
import { Currency, DepositCurrency } from '../../users.interfaces';
import { Coin, CoinNames, RewardValues } from '../../../../models/reward-based.model';
import {
  basicRewardNames,
  DisplayReward,
  RewardNames,
  RewardService,
} from '../../../reward/reward.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyHelperService {
  readonly rewardNames: RewardNames = basicRewardNames;

  private _initialDepositCurrency: DepositCurrency = {
    copper: 0,
    depositDay: 0,
    duration: 0,
    gold: 0,
    silver: 0,
  };

  get initialDepositCurrency() {
    return this._initialDepositCurrency;
  }

  makeNewDeposit(deposit: Currency, days: number): DepositCurrency {
    return {
      copper: deposit.copper,
      depositDay: Date.now(),
      duration: days,
      gold: deposit.gold,
      silver: deposit.silver,
    };
  }

  getSaveCurrency(currency: Partial<Currency>): Currency {
    return {
      copper: currency.copper || 0,
      gold: currency.gold || 0,
      silver: currency.silver || 0,
    };
  }

  private getCoin(amount: number, name: CoinNames): Coin {
    return {
      alt: name,
      amount: amount,
      class: name,
      imgSrc: `assets/resourses/imgs/${name}.png`,
    };
  }

  getCoins(currency: Partial<Currency>) {
    return this.convertCurrencyToCoin(this.getSaveCurrency(currency));
  }

  convertCoinToCurrency(coins: Coin[]): Currency {
    return coins.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.class]: curr.amount,
      }),
      { copper: 0, silver: 0, gold: 0 } satisfies Currency,
    );
  }

  convertCurrencyToCoin(currency: Currency): Coin[] {
    return [
      this.getCoin(currency.gold, this.rewardNames.gold.toLowerCase() as CoinNames),
      this.getCoin(currency.silver, this.rewardNames.silver.toLowerCase() as CoinNames),
      this.getCoin(currency.copper, this.rewardNames.copper.toLowerCase() as CoinNames),
    ];
  }

  convertCurrencyToDisplayReward(currency: Currency): DisplayReward[] {
    const coins = this.convertCurrencyToCoin(currency);

    return coins.map(coin => {
      const reward = RewardService.getDisplayRewardBase(
        {
          name: (coin.class[0].toUpperCase() + coin.class.slice(1)) as RewardValues,
          probability: 0,
        },
        coin.amount,
        { src: coin.imgSrc },
      );

      return reward satisfies DisplayReward;
    });
  }
}
