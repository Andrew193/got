import {AfterViewInit, Component, forwardRef} from '@angular/core';
import {FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {AsyncPipe, NgForOf} from "@angular/common";
import {
  BaseSelectFormControlComponent
} from "../../abstract/abstract-control/base-select-form-control/base-select-form-control.component";

@Component({
  selector: 'autocomplete-mat-input',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatInput, MatAutocompleteTrigger, AsyncPipe, MatAutocomplete, MatOption, NgForOf, MatLabel, MatFormField],
  templateUrl: './autocomplete-mat-input.component.html',
  styleUrl: './autocomplete-mat-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteMatInputComponent),
      multi: true,
    },
  ]
})
export class AutocompleteMatInputComponent extends BaseSelectFormControlComponent implements AfterViewInit {
  constructor() {
    super();
  }

  ngAfterViewInit(): void {
  }

}
