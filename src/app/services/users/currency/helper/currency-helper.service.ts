import { Injectable } from '@angular/core';
import { Currency, DepositCurrency } from '../../users.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CurrencyHelperService {
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
      depositDay: 1,
      duration: days,
      gold: deposit.gold,
      silver: deposit.silver,
    };
  }
}
