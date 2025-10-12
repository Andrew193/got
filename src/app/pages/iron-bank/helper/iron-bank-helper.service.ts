import { inject, Injectable } from '@angular/core';
import { Cur } from '../../../models/iron-bank.model';
import { IronBankDepositHelperService } from './deposit-helper.service';
import { IronBankExchangerHelperService } from './exchanger-helper.service';

@Injectable({
  providedIn: 'root',
})
export class IronBankHelperService {
  deposit = inject(IronBankDepositHelperService);
  exchanger = inject(IronBankExchangerHelperService);

  readonly uiErrorsNames = {
    amount: 'Amount',
    gold: 'Gold',
    copper: 'Copper',
    silver: 'Silver',
    days: 'Duration',
    from: 'From',
    to: 'To',
  };

  constructor() {
    this.exchanger.init();
  }

  depositOptions() {
    return this.deposit.depositOptions;
  }

  depositForm() {
    return this.deposit.form;
  }

  exchangerForm() {
    return this.exchanger.form;
  }

  exchangerResult() {
    return this.exchanger.result;
  }

  exchangerRateLabel() {
    return this.exchanger.rateLabel;
  }

  exchangerAllowedToOptions = (from: Cur | null) => {
    return this.exchanger.allowedToOptions(from);
  };
}
