import { Component, inject } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { BaseFormControlComponent } from '../base-form-control/base-form-control.component';

@Component({
  selector: 'app-view-provider',
  template: '',
})
export class ViewProviderComponent extends BaseFormControlComponent {
  private parent = inject(FormGroupDirective, { host: true });

  get formControl(): FormControl {
    return this.parentForm.get(this.controlName()) as FormControl;
  }

  get parentForm() {
    return this.parent.form;
  }
}
