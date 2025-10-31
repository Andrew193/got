import { ChangeDetectionStrategy, Component, effect, input, OnInit } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {
  ControlContainer,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ViewProviderComponent } from '../../abstract/abstract-control/view-provider/view-provider.component';

@Component({
  selector: 'app-number-input',
  imports: [MatFormField, MatInput, MatLabel, MatFormField, ReactiveFormsModule],
  templateUrl: './number-input.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './number-input.component.scss',
})
export class NumberInputComponent extends ViewProviderComponent implements OnInit {
  max = input<number>(999999);
  private baseValidators: ValidatorFn[] = [];

  constructor() {
    super();

    effect(() => {
      const m = this.max();
      const maxValidator = Validators.max(m);

      this.formControl.setValidators([...this.baseValidators, maxValidator]);
      this.formControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit() {
    const initial = this.formControl.validator;

    this.baseValidators = initial ? [initial] : [];
  }
}
