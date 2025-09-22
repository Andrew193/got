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

  private parentForm = inject(FormGroupDirective);

  get control(): FormControl<number> {
    return this.parentForm.form.get(this.controlName()) as FormControl<number>;
  }
}
