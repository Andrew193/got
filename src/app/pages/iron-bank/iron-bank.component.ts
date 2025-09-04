import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {IronBankHelperService} from "./helper/iron-bank-helper.service";
import { ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {MatOption} from "@angular/material/autocomplete";
import {DecimalPipe, JsonPipe} from "@angular/common";
import {UsersService} from "../../services/users/users.service";
import {User} from "../../services/users/users.interfaces";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RewardService} from "../../services/reward/reward.service";
import {RewardCoinComponent} from "../../components/views/reward-coin/reward-coin.component";
import {
  FormErrorsContainerComponent
} from "../../components/form/form-errors-container/form-errors-container.component";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {SliderComponent} from "../../components/data-inputs/slider/slider.component";
import {NumberInputComponent} from "../../components/data-inputs/number-input/number-input.component";

@Component({
  selector: 'app-iron-bank',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    DecimalPipe,
    RewardCoinComponent,
    FormErrorsContainerComponent,
    MatButtonModule,
    MatIconModule,
    SliderComponent,
    JsonPipe,
    NumberInputComponent,
  ],
  templateUrl: './iron-bank.component.html',
  styleUrl: './iron-bank.component.scss'
})
export class IronBankComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  user!: User;

  helper = inject(IronBankHelperService);
  userService = inject(UsersService);
  rewardService = inject(RewardService);

  ngOnInit() {
    this.userService.$user.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => {
        _ && (this.user = _);
    })
  }

  getUserCurrencyInCoins() {
    return this.rewardService.convertUserCurrencyToCoin(this.user.currency);
  }

  getMax(user: User, key: string) {
    return user.currency[key as 'cooper' | 'silver' | 'gold']
  }

  exchangeCurrency(newCurrency: number) {
    const amount = this.helper.form.value.amount || 0;
    const from = this.helper.form.value.from;
    const to = this.helper.form.value.to;
    const currentCurrency = this.user.currency;

    const afterMinus = {
      cooper: (currentCurrency.cooper - (from === 'COOPER' ? amount : 0)) + (to === 'COOPER' ? newCurrency : 0),
      silver: (currentCurrency.silver - (from === 'SILVER' ? amount : 0)) + (to === 'SILVER' ? newCurrency : 0),
      gold: (currentCurrency.gold - (from === 'GOLD' ? amount : 0)) + (to === 'GOLD' ? newCurrency : 0),
    }

    this.userService.updateCurrency(afterMinus, {hardSet: true});
  }
}
