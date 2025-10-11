import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PercentPipe, NgClass } from '@angular/common';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RewardCoinComponent } from '../../../../components/views/reward-coin/reward-coin.component';
import { Coin } from '../../../../models/reward-based.model';
import { Currency } from '../../../../services/users/users.interfaces';
import { IronBankDepositHelperService } from '../../helper/deposit-helper.service';
import { CurrencyHelperService } from '../../../../services/users/currency/helper/currency-helper.service';

export enum DifferenceMode {
  none,
  arrow = 'arrow_forward',
  hourglass = 'wifi_protected_setup',
}

@Component({
  selector: 'app-deposit-hint',
  standalone: true,
  imports: [RewardCoinComponent, PercentPipe, MatIcon, MatFabButton, NgClass],
  templateUrl: './deposit-hint.component.html',
  styleUrl: './deposit-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositHintComponent {
  private readonly ironBankService = inject(IronBankDepositHelperService);
  private readonly currencyHelperService = inject(CurrencyHelperService);

  protected readonly modes = DifferenceMode;

  newCoins = output<Coin[]>();
  hintContainerClass = input<string | string[] | Record<string, boolean>>('');
  coins = input.required<Coin[]>();
  convertToPercentage = input<boolean>(false);

  renderRates = input<boolean>(true);
  rates = input<Currency>({ copper: 0, silver: 0, gold: 0 });

  differenceMode = input<DifferenceMode>(DifferenceMode.none);

  readonly hasDifference = computed(() => this.differenceMode() !== this.modes.none);

  protected readonly boostedCoins = computed<Coin[] | null>(() => {
    if (!this.hasDifference()) return null;

    const currency = this.currencyHelperService.convertCoinToCurrency(this.coins());
    const after = this.ironBankService.getCurrencyAfterDeposit(currency, this.rates());
    const toReturn = this.currencyHelperService.convertCurrencyToCoin(after);

    this.newCoins.emit(toReturn);

    return toReturn;
  });
}
