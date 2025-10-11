import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { IronBankHelperService } from './helper/iron-bank-helper.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../services/users/users.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RewardCoinComponent } from '../../components/views/reward-coin/reward-coin.component';
import { FormErrorsContainerComponent } from '../../components/form/form-errors-container/form-errors-container.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DepositComponent } from './deposit/deposit.component';
import { Cur } from '../../models/iron-bank.model';
import { NumberInputComponent } from '../../components/data-inputs/number-input/number-input.component';
import { CurrencyHelperService } from '../../services/users/currency/helper/currency-helper.service';
import { DepositFacadeService } from '../../services/facades/deposit/deposit.service';
import { finalize } from 'rxjs';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-iron-bank',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    DecimalPipe,
    RewardCoinComponent,
    FormErrorsContainerComponent,
    MatButtonModule,
    MatIconModule,
    DepositComponent,
    AsyncPipe,
    NumberInputComponent,
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

  ngOnInit() {
    this.userService.$user.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(_ => {
      _ && (this.user = _);
    });
  }

  getUserCurrencyInCoins() {
    return this.currencyHelperService.convertCurrencyToCoin(this.user.currency);
  }

  getMax(user: User, key: Lowercase<Cur>) {
    return user.currency[key];
  }

  exchangeCurrency(newCurrency: number) {
    this.userService.updateCurrency(
      this.helper.getCurrencyForExchange(this.user.currency, newCurrency),
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
    return (this.helper.form.value.from?.toLowerCase() || 'copper') as Lowercase<Cur>;
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
