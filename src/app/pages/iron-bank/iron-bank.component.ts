import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { IronBankHelperService } from './helper/iron-bank-helper.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../services/users/users.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DepositComponent } from './deposit/deposit.component';
import { AllowedToOptions, Cur } from '../../models/iron-bank.model';
import { CurrencyHelperService } from '../../services/users/currency/helper/currency-helper.service';
import { DepositFacadeService } from '../../services/facades/deposit/deposit.service';
import { finalize } from 'rxjs';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { ExchangerComponent } from './exchanger/exchanger.component';
import { CURRENCY_NAMES } from '../../constants';

@Component({
  selector: 'app-iron-bank',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    DepositComponent,
    AsyncPipe,
    ExchangerComponent,
  ],
  templateUrl: './iron-bank.component.html',
  styleUrl: './iron-bank.component.scss',
})
export class IronBankComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  user!: User;

  helper = inject(IronBankHelperService);
  nav = inject(NavigationService);
  depositFacade = inject(DepositFacadeService);
  userService = inject(UsersService);
  currencyHelperService = inject(CurrencyHelperService);

  depositForm = this.helper.depositForm();
  exchangerForm = this.helper.exchangerForm();

  rateLabel = this.helper.exchangerRateLabel();
  result = this.helper.exchangerResult();
  exchangerAllowedToOptions: AllowedToOptions = this.helper.exchangerAllowedToOptions;
  currencies = this.helper.exchanger.currencies;

  ngOnInit() {
    this.userService.$user.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(_ => {
      _ && (this.user = _);
    });
  }

  getUserCurrencyInCoins() {
    return this.currencyHelperService.convertCurrencyToCoin(this.user.currency);
  }

  getMax(user: User, key: Lowercase<Cur>) {
    return user ? user.currency[key] : 0;
  }

  exchangeCurrency(newCurrency: number) {
    this.userService.updateCurrency(
      this.helper.exchanger.getCurrencyForExchange(this.user.currency, newCurrency),
      { hardSet: true },
    );
  }

  depositCurrency() {
    const depositConfig = this.helper.deposit.getDepositConfig();

    this.depositFacade
      .depositCurrency(depositConfig)
      .pipe(
        finalize(() => {
          this.depositFacade.showDepositModal(depositConfig);
          this.depositForm.reset();
        }),
      )
      .subscribe();
  }

  showCurrentDeposit() {
    this.depositFacade.showDepositModal();
  }

  get depositOptions() {
    return this.helper.depositOptions();
  }

  get uiErrorsNames() {
    return this.helper.uiErrorsNames;
  }

  get key() {
    return (this.exchangerForm.value.from?.toLowerCase() ||
      CURRENCY_NAMES.copper) as Lowercase<Cur>;
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
