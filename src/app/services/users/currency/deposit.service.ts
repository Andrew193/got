import { inject, Injectable } from '@angular/core';
import { Currency, DepositCurrency } from '../users.interfaces';
import { API_ENDPOINTS } from '../../../constants';
import { CurrencyHelperService } from './helper/currency-helper.service';
import { map } from 'rxjs';
import { BaseConfigApiService } from '../../abstract/base-config-api/base-config-api.service';

@Injectable({
  providedIn: 'root',
})
export class DepositService extends BaseConfigApiService<DepositCurrency> {
  helper = inject(CurrencyHelperService);

  override url = `/${API_ENDPOINTS.deposits}`;
  override iniConfig = this.helper.initialDepositCurrency;

  submitDeposit(deposit: Currency, days: number) {
    const newDeposit = this.helper.makeNewDeposit(deposit, days);

    return this.putPostCover(
      { ...newDeposit, id: this.data.getValue().id, userId: this.userId },
      {
        returnObs: true,
        url: this.url,
        callback: () => {},
      },
    );
  }

  withdrawDeposit() {
    const deposit = this.data.getValue();

    return this.putPostCover(
      { ...this.helper.initialDepositCurrency, id: deposit.id, userId: this.userId },
      {
        returnObs: true,
        url: this.url,
        callback: () => {},
      },
    ).pipe(map(() => deposit));
  }
}
