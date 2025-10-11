import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  isFormInvalid(form: FormGroup, callback: () => void) {
    if (callback) {
      callback();
    }

    return form.invalid && (form.touched || form.dirty);
  }

  validateAllFormFields(formGroup: FormGroup | FormArray) {
    const formGroupToValidate = formGroup;

    Object.keys(formGroupToValidate.controls).forEach(field => {
      const control = formGroupToValidate.get(field);

      if (control instanceof FormControl) {
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof FormArray) {
        const formArray = control as FormArray;

        for (const arrayControl of formArray.controls) {
          if (arrayControl instanceof FormGroup || arrayControl instanceof FormArray) {
            this.validateAllFormFields(arrayControl);
          } else {
            arrayControl.markAsDirty();
            arrayControl.markAsTouched();
            arrayControl.updateValueAndValidity({ onlySelf: true });
          }
        }
      }
    });

    return formGroupToValidate;
  }

  validateFormAndSubmit<T>(
    form: FormGroup<any>,
    updateCallback: Observable<(T | undefined)[]>,
    createCallback: Observable<T>,
    isUpdate: boolean,
  ) {
    this.validateAllFormFields(form);

    if (form.valid) {
      form.disable();
      if (isUpdate) {
        updateCallback.subscribe();
      } else {
        createCallback.subscribe();
      }
    }
  }

  depositFormValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const value = formGroup.getRawValue() as {
        copper: number;
        silver: number;
        gold: number;
        days?: number;
      };

      delete value.days;

      const ok = Object.values(value).some(el => el > 0);

      return ok ? null : { error: 'Choose your deposit. Cooper, silver or gold must be filled.' };
    };
  }

  zeroOrMin(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = Number(control.value ?? 0);

      if (Number.isNaN(v)) return { required: true };

      if (v < 0) return { required: true };

      return v === 0 || v >= min ? null : { min: { min, actual: v } };
    };
  }
}
