import { inject, Injectable } from '@angular/core';
import { Cur, DepositConfig, DepositForm } from '../../../models/iron-bank.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation/validation.service';
import { Currency } from '../../../services/users/users.interfaces';
import { NumbersService } from '../../../services/numbers/numbers.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { CURRENCY_NAMES } from '../../../constants';

@Injectable({
  providedIn: 'root',
})
export class IronBankDepositHelperService {
  numbersService = inject(NumbersService);
  currencyHelperService = inject(CurrencyHelperService);
  private validation = inject(ValidationService);

  form = new FormGroup<DepositForm>(
    {
      days: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      [CURRENCY_NAMES.copper]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
        validators: [this.validation.zeroOrMin(10000)],
      }),
      [CURRENCY_NAMES.silver]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
        validators: [this.validation.zeroOrMin(1000)],
      }),
      [CURRENCY_NAMES.gold]: new FormControl(0, {
        nonNullable: true,
        updateOn: 'blur',
        validators: [this.validation.zeroOrMin(100)],
      }),
    },
    [this.validation.depositFormValidator()],
  );

  private DURATION_MULTIPLIERS: Record<number, number> = {
    0: 1.0,
    1: 1.3,
    2: 1.5,
    3: 2.5,
    4: 5.6,
  };

  readonly depositOptions = [3, 10, 25, 120, 365] as const;

  private depositRates: Currency = {
    [CURRENCY_NAMES.copper]: 0.05,
    [CURRENCY_NAMES.gold]: 0.01,
    [CURRENCY_NAMES.silver]: 0.02,
  };

  private getRate(cur: Lowercase<Cur>, days: number): number {
    return this.depositRates[cur] * this.DURATION_MULTIPLIERS[days];
  }

  getRates(days = 0): Currency {
    return {
      [CURRENCY_NAMES.copper]: this.getRate(CURRENCY_NAMES.copper, this.form.value.days || days),
      [CURRENCY_NAMES.silver]: this.getRate(CURRENCY_NAMES.silver, this.form.value.days || days),
      [CURRENCY_NAMES.gold]: this.getRate(CURRENCY_NAMES.gold, this.form.value.days || days),
    };
  }

  getDepositConfig(currency?: Currency, days?: number): DepositConfig {
    return {
      currency: this.currencyHelperService.getSaveCurrency(currency || this.form.value),
      days: days || this.depositOptions[this.form.value.days || 0],
    };
  }

  getCurrencyAfterDeposit(currency: Currency, rates = this.getRates()): Currency {
    return {
      [CURRENCY_NAMES.copper]:
        currency[CURRENCY_NAMES.copper] +
        this.numbersService.roundDown(
          currency[CURRENCY_NAMES.copper] * rates[CURRENCY_NAMES.copper],
          0,
        ),
      [CURRENCY_NAMES.gold]:
        currency[CURRENCY_NAMES.gold] +
        this.numbersService.roundDown(
          currency[CURRENCY_NAMES.gold] * rates[CURRENCY_NAMES.gold],
          0,
        ),
      [CURRENCY_NAMES.silver]:
        currency[CURRENCY_NAMES.silver] +
        this.numbersService.roundDown(
          currency[CURRENCY_NAMES.silver] * rates[CURRENCY_NAMES.silver],
          0,
        ),
    };
  }
}
