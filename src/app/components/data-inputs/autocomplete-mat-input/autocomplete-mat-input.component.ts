import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { BaseSelectFormControlComponent } from '../../abstract/abstract-control/base-select-form-control/base-select-form-control.component';

@Component({
  selector: 'app-autocomplete-mat-input',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInput,
    MatAutocompleteTrigger,
    AsyncPipe,
    MatAutocomplete,
    MatOption,
    MatLabel,
    MatFormField,
  ],
  templateUrl: './autocomplete-mat-input.component.html',
  styleUrl: './autocomplete-mat-input.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteMatInputComponent extends BaseSelectFormControlComponent {}
