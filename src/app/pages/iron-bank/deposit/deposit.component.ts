import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { FormErrorsContainerComponent } from '../../../components/form/form-errors-container/form-errors-container.component';
import { MatFabButton } from '@angular/material/button';
import { NumberInputComponent } from '../../../components/data-inputs/number-input/number-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SliderComponent } from '../../../components/data-inputs/slider/slider.component';
import { MatIcon } from '@angular/material/icon';
import { DepositForm, DepositInput } from '../../../models/iron-bank.model';
import { DepositHintComponent } from './hint/deposit-hint.component';
import { IronBankHelperService } from '../helper/iron-bank-helper.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';

@Component({
  selector: 'app-deposit',
  imports: [
    FormErrorsContainerComponent,
    MatFabButton,
    MatIcon,
    NumberInputComponent,
    ReactiveFormsModule,
    SliderComponent,
    DepositHintComponent,
  ],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositComponent {
  currencyHelperService = inject(CurrencyHelperService);
  helper = inject(IronBankHelperService);

  form = model.required<FormGroup<DepositForm>>();
  copperMax = input.required<number>();
  silverMax = input.required<number>();
  goldMax = input.required<number>();
  depositOptions = input.required<readonly number[]>();
  uiErrorsNames = input.required<Record<string, string>>();
  depositCurrency = output<boolean>();

  inputsConfig = computed<DepositInput[]>(() => [
    { max: this.copperMax(), label: 'Copper:', type: 'copper' },
    { max: this.copperMax(), label: 'Silver:', type: 'silver' },
    { max: this.copperMax(), label: 'Gold:', type: 'gold' },
  ]);

  getCoins() {
    return this.currencyHelperService.getCoins(this.form().value);
  }

  get rates() {
    return this.helper.deposit.getRates();
  }
}
