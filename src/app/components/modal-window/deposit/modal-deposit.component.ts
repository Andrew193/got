import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import {
  DepositHintComponent,
  DifferenceMode,
} from '../../../pages/iron-bank/deposit/hint/deposit-hint.component';
import { IronBankHelperService } from '../../../pages/iron-bank/helper/iron-bank-helper.service';
import { DepositCurrency } from '../../../services/users/users.interfaces';
import { DepositConfig } from '../../../models/iron-bank.model';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { MatDivider } from '@angular/material/divider';
import { DepositFacadeService } from '../../../services/facades/deposit/deposit.service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { TimeService } from '../../../services/time/time.service';
import { Coin } from '../../../models/reward-based.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-deposit',
  imports: [DepositHintComponent, MatDivider, AsyncPipe],
  templateUrl: './modal-deposit.component.html',
  styleUrl: './modal-deposit.component.scss',
})
export class DepositModalComponent implements HasFooterHost {
  dialogRef = inject(MatDialogRef<DepositModalComponent>);

  timeService = inject(TimeService);
  depositFacadeService = inject(DepositFacadeService);
  currencyHelperService = inject(CurrencyHelperService);
  helper = inject(IronBankHelperService);

  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  _data = inject<DepositConfig>(DYNAMIC_COMPONENT_DATA);
  deposit: Observable<DepositCurrency> = this.depositFacadeService.$deposit;
  newCoins: Coin[] = [];

  getCoins() {
    return this.currencyHelperService.getCoins(this._data.currency);
  }

  getRatesCoins() {
    return this.currencyHelperService.getCoins(this.rates);
  }

  get rates() {
    return this.helper.deposit.getRates();
  }

  getDepositDay(date: number) {
    return this.timeService.format(date);
  }

  remainingDepositTime(date: number, duration: number) {
    return this.timeService.getRemainingTime(date, duration);
  }

  differenceMode(toggler: boolean) {
    return toggler ? DifferenceMode.arrow : DifferenceMode.hourglass;
  }

  getDeposit() {
    this.depositFacadeService
      .getDeposit(this.currencyHelperService.convertCoinToCurrency(this.newCoins))
      .subscribe(this.dialogRef.close);
  }

  setNewCoins(coins: Coin[]) {
    this.newCoins = coins.slice();
  }
}
