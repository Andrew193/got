import { Component, inject, input, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { DataInputsService } from '../../../../services/facades/data-inputs/data-inputs.service';

@Component({
  selector: 'app-base-form-control',
  imports: [FormsModule],
  templateUrl: './base-form-control.component.html',
  styleUrl: './base-form-control.component.scss',
})
export class BaseFormControlComponent implements ControlValueAccessor {
  dataInputsService = inject(DataInputsService);

  @Input() label = 'Label';
  @Input() placeholder = 'Placeholder';
  @Input() form!: FormGroup;
  controlName = input.required<string>();

  @Input() action?: (alias: string, formGroup: FormGroup) => void = () => {};

  public control: FormControl = new FormControl('');

  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(v => {
      this.onChange(v);
      this.action && this.action(this.controlName(), this.form);
    });
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
