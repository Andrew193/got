import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../abstract/api/api.service';
import { Currency, DepositCurrency } from '../users.interfaces';
import { API_ENDPOINTS } from '../../../constants';
import { ConfigInterface } from '../../../models/interfaces/config.interface';
import { CurrencyHelperService } from './helper/currency-helper.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepositService
  extends ApiService<DepositCurrency>
  implements ConfigInterface<DepositCurrency>
{
  helper = inject(CurrencyHelperService);

  private url = `/${API_ENDPOINTS.deposits}`;

  initConfigForNewUser(userId: string) {
    return this.http.post<DepositCurrency>(this.url, {
      ...this.helper.initialDepositCurrency,
      userId,
    });
  }

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

  getConfig(callback: (config: DepositCurrency) => void) {
    return this.http
      .get<DepositCurrency[]>(this.url, {
        params: {
          userId: this.userId,
        },
      })
      .pipe(this.basicResponseTapParser(callback));
  }
}
