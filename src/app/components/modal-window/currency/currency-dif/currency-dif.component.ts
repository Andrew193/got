import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Coin } from '../../../../models/reward-based.model';
import { RewardCoinComponent } from '../../../views/reward-coin/reward-coin.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CurrencyHelperService } from '../../../../services/users/currency/helper/currency-helper.service';

@Component({
  selector: 'app-currency-dif',
  imports: [RewardCoinComponent, MatIconButton, MatIcon],
  templateUrl: './currency-dif.component.html',
  styleUrl: './currency-dif.component.scss',
})
export class CurrencyDifComponent {
  private snackBarRef = inject(MatSnackBarRef);
  currencyHelperService = inject(CurrencyHelperService);

  data = inject(MAT_SNACK_BAR_DATA);

  protected oldCoins: Coin[] = [];
  protected newCoins: Coin[] = [];
  protected differenceInCoins: Coin[] = [];

  constructor() {
    this.oldCoins = this.currencyHelperService.convertCurrencyToCoin(this.data.old);
    this.newCoins = this.currencyHelperService.convertCurrencyToCoin(this.data.new);

    this.oldCoins.forEach(oldCoin => {
      const newCoin = this.newCoins.find(newCoin => newCoin.class === oldCoin.class) as Coin;

      this.differenceInCoins = [
        ...this.differenceInCoins,
        {
          ...newCoin,
          amount: newCoin.amount - oldCoin.amount,
        },
      ];
    });
  }

  protected close() {
    this.snackBarRef.dismissWithAction();
  }
}
