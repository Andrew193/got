import { inject, Injectable } from '@angular/core';
import { DepositService } from '../../users/currency/currency.service';
import { UsersService } from '../../users/users.service';
import { DepositConfig } from '../../../models/iron-bank.model';
import { map, switchMap } from 'rxjs';
import { Currency, DepositCurrency } from '../../users/users.interfaces';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { DepositModalComponent } from '../../../components/modal-window/deposit/modal-deposit.component';
import { ModalWindowService } from '../../modal/modal-window.service';
import { IronBankDepositHelperService } from '../../../pages/iron-bank/helper/deposit-helper.service';

@Injectable({
  providedIn: 'root',
})
export class DepositFacadeService {
  private depositService = inject(DepositService);
  private ironBankDepositHelperService = inject(IronBankDepositHelperService);
  private modalWindowService = inject(ModalWindowService);
  private userService = inject(UsersService);

  $deposit = this.depositService._data;

  depositAvailable = this.$deposit.pipe(map(value => value.depositDay === 0));

  depositCurrency(config: DepositConfig) {
    return this.depositService.submitDeposit(config.currency, config.days).pipe(
      map(value => (Array.isArray(value) ? value[0] : value)),
      switchMap(value => {
        const parsed = Object.fromEntries(Object.entries(value).map(el => [el[0], el[1] * -1]));

        return this.userService.updateCurrency(parsed as DepositCurrency, { returnObs: true });
      }),
    );
  }

  getDeposit(currency: Currency) {
    return this.depositService
      .withdrawDeposit()
      .pipe(switchMap(() => this.userService.updateCurrency(currency, { returnObs: true })));
  }

  showDepositModal(depositConfig: DepositConfig = this.getCurrentDepositConfig()) {
    const modalConfig = this.modalWindowService.getModalConfig('', '', '', {
      open: true,
      strategy: ModalStrategiesTypes.component,
      component: DepositModalComponent,
      data: depositConfig,
    });

    this.modalWindowService.openModal(modalConfig);
  }

  getCurrentDepositConfig() {
    const depositCurrency = this.depositService.getStaticData();

    return this.ironBankDepositHelperService.getDepositConfig(
      depositCurrency,
      depositCurrency.duration,
    );
  }
}
