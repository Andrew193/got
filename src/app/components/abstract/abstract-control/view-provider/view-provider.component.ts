import { Component, inject, input } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-view-provider',
  template: '',
})
export class ViewProviderComponent {
  controlName = input.required<string>();
  label = input<string>('Label');

  private parent = inject(FormGroupDirective, { host: true });

  get control(): FormControl<number> {
    return this.parentForm.get(this.controlName()) as FormControl<number>;
  }

  get parentForm() {
    return this.parent.form;
  }
}
