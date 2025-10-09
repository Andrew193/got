import { Component, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base-form-control',
  imports: [FormsModule],
  templateUrl: './base-form-control.component.html',
  styleUrl: './base-form-control.component.scss',
})
export class BaseFormControlComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Placeholder';
  @Input() form!: FormGroup;

  public control: FormControl = new FormControl('');

  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(v => this.onChange(v));
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}
