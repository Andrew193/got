import {Injectable} from '@angular/core';
import {FormArray, FormControl, FormGroup} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {
  }

  isFormInvalid(form: FormGroup, callback: any) {
    if (callback) {
      callback()
    }
    return form.invalid && (form.touched || form.dirty)
  }

  validateAllFormFields(formGroup: FormGroup | FormArray) {
    const formGroupToValidate = formGroup;
    Object.keys(formGroupToValidate.controls).forEach(field => {
      const control = formGroupToValidate.get(field);

      if (control instanceof FormControl) {
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity({onlySelf: true});
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
            arrayControl.updateValueAndValidity({onlySelf: true});
          }
        }
      }
    });
    return formGroupToValidate;
  }

  validateFormAndSubmit(form: FormGroup<any>, updateCallback: any, createCallback: any, id: boolean) {
    this.validateAllFormFields(form);

    if (form.valid) {
      form.disable();
      if (id) {
        updateCallback();
      } else {
        createCallback();
      }
    }
  }
}
