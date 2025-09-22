import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../../services/validation/validation.service';
import { FormArray, FormGroup, FormsModule } from '@angular/forms';
import { ErrorFieldComponent } from '../error-field/error-field.component';
import { trackByIndex } from '../../../helpers';

@Component({
  selector: 'app-form-errors-container',
  imports: [CommonModule, FormsModule, ErrorFieldComponent],
  templateUrl: './form-errors-container.component.html',
  styleUrl: './form-errors-container.component.scss',
})
export class FormErrorsContainerComponent implements OnInit {
  @Input() form: FormGroup = new FormGroup({});
  @Input() uiErrorsNames: any = {};

  requiredErrors: any[] = [];
  showErrors = false;
  errors: any[] = [];

  constructor(public validationService: ValidationService) {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe(value => {
      this.checkErrors();
    });
  }

  public checkErrors = () => {
    this.requiredErrors = [];
    const errors = this.getFormValidationErrors();

    this.updateErrors(errors);

    this.errors = errors;
  };

  getFormValidationErrors(formGroup?: FormGroup, i?: number) {
    let errors: any[] = [];
    const getValidationErrorsRecursionCover = (innerIndex?: number) => {
      Object.entries(formGroup?.controls || this.form.controls).forEach(([key, control]) => {
        if (control instanceof FormArray) {
          const formArray = control as FormArray;

          for (const arrayControl of formArray.controls) {
            const index = formArray.controls.indexOf(arrayControl);

            errors = [...errors, ...this.getFormValidationErrors(arrayControl as FormGroup, index)];
          }
        } else if (control instanceof FormGroup) {
          errors = [...errors, ...this.getFormValidationErrors(control, i)];
        }

        addError(formGroup || this.form, key, this.uiErrorsNames, i || innerIndex);
      });
    };

    const addError = (
      form: FormGroup,
      key: string,
      uiErrorsNames: Record<string, any>,
      i?: number,
    ) => {
      // @ts-ignore
      const controlErrors = form.get(key).errors;

      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(() => {
          const formControl = form.get(key);

          if (formControl?.touched && formControl?.errors?.['required']) {
            this.requiredErrors.push(formControl);
          }

          errors.push({
            meta: formControl,
            name: uiErrorsNames[key] || uiErrorsNames[key + 'Label'],
            additionalText: i !== undefined ? `Table row ( ${i + 1} )` : '',
          });
        });
      }
    };

    getValidationErrorsRecursionCover(i);

    return errors;
  }

  updateErrors(errors: any) {
    const hideErrors = errors.every((error: any) => error.meta.touched === false);

    if (!errors.length || hideErrors) {
      this.showErrors = false;
    } else {
      this.showErrors = true;
    }
  }

  get isRequiredErrors() {
    return this.requiredErrors.length;
  }

  protected readonly trackByIndex = trackByIndex;
}
