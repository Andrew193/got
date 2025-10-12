import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormErrorsContainerComponent } from '../../../components/form/form-errors-container/form-errors-container.component';
import { MatFabButton } from '@angular/material/button';
import { NumberInputComponent } from '../../../components/data-inputs/number-input/number-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RewardCoinComponent } from '../../../components/views/reward-coin/reward-coin.component';
import { Coin } from '../../../models/reward-based.model';
import { AllowedToOptions, Cur, ExchangerForm } from '../../../models/iron-bank.model';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-exchanger',
  imports: [
    DecimalPipe,
    FormErrorsContainerComponent,
    MatFabButton,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatSelect,
    NumberInputComponent,
    ReactiveFormsModule,
    RewardCoinComponent,
  ],
  templateUrl: './exchanger.component.html',
  styleUrl: './exchanger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangerComponent {
  form = model.required<FormGroup<ExchangerForm>>();

  coins = input.required<Coin[]>();
  currencies = input.required<Cur[]>();
  rateLabel = input.required<string>();
  result = input.required<number>();
  uiErrorsNames = input.required<Record<string, string>>();
  amountMax = input.required<number>();
  allowedToOptions = input.required<AllowedToOptions>();

  exchangeCurrency = output<number>();
}
