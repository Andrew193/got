import {Component, Input} from '@angular/core';
import {AbstractControl, FormControl} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'error-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-field.component.html',
  styleUrl: './error-field.component.scss'
})
export class ErrorFieldComponent {
  @Input() fieldToValidate: { meta: AbstractControl<any, any> | null, name: string, htmlName?: string, additionalText?: string }

  constructor() {
    this.fieldToValidate = {meta: new FormControl(null), name: "start", htmlName: "", additionalText: ""}
  }

  get field() { return this.fieldToValidate.meta; }

  get fieldName() { return this.fieldToValidate.name; }

  get fieldAdditionalText() { return this.fieldToValidate.additionalText; }

  get fieldMaxLength() { return this.field?.errors?.['maxlength']; }

  get fieldMinLength() { return this.field?.errors?.['minlength']; }

  get fieldRequired() { return this.field?.errors?.['required']; }

  get fieldMin() { return this.field?.errors?.['min']; }

  get fieldMax() { return this.field?.errors?.['max']; }

}
