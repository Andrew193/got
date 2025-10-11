import { Component, Input } from '@angular/core';
import { UiError } from '../form-errors-container/form-errors-container.component';

@Component({
  selector: 'app-error-field',
  templateUrl: './error-field.component.html',
  styleUrl: './error-field.component.scss',
})
export class ErrorFieldComponent {
  @Input({ required: true }) fieldToValidate!: UiError;

  get field() {
    return this.fieldToValidate.meta;
  }

  get fieldName() {
    return this.fieldToValidate.name;
  }

  get fieldAdditionalText() {
    return this.fieldToValidate.additionalText;
  }

  get fieldMaxLength() {
    return this.field?.errors?.['maxlength'];
  }

  get fieldMinLength() {
    return this.field?.errors?.['minlength'];
  }

  get fieldRequired() {
    return this.field?.errors?.['required'];
  }

  get fieldCustomError() {
    return this.field?.errors?.['error'];
  }

  get fieldMin() {
    return this.field?.errors?.['min'];
  }

  get fieldMax() {
    return this.field?.errors?.['max'];
  }
}
