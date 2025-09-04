import {ChangeDetectionStrategy, Component, effect, input} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {ControlContainer, FormGroupDirective, ReactiveFormsModule, Validators} from "@angular/forms";
import {ViewProviderComponent} from "../../abstract/abstract-control/view-provider/view-provider.component";

@Component({
  selector: 'app-number-input',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    ReactiveFormsModule
  ],
  templateUrl: './number-input.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './number-input.component.scss'
})
export class NumberInputComponent extends ViewProviderComponent {
  max = input<number>(999999);

  constructor() {
    super();
    effect(() => {
        const m = this.max();

        // Сохраняем любые уже заданные валидаторы (например, из родителя)
        const existing = this.control.validator ? [this.control.validator] : [];
        const composed = Validators.compose([...existing, Validators.max(m)]);
        this.control.setValidators(composed);

        // Пересчитываем статус, но без лишних эмитов
        this.control.updateValueAndValidity({ emitEvent: false });

      console.log(this.control)
      });
  }

}
