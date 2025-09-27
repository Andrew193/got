import { Component, inject, input } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-view-provider',
  imports: [],
  template: '',
})
export class ViewProviderComponent {
  controlName = input.required<string>();
  label = input<string>('');

  private parent = inject(FormGroupDirective);

  get control(): FormControl<number> {
    return this.parentForm.get(this.controlName()) as FormControl<number>;
  }

  get parentForm() {
    return this.parent.form;
  }
}
