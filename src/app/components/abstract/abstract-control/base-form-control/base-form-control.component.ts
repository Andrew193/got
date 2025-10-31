import { ChangeDetectorRef, Component, inject, input, Input } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { DataInputsService } from '../../../../services/facades/data-inputs/data-inputs.service';

@Component({
  selector: 'app-base-form-control',
  imports: [FormsModule],
  templateUrl: './base-form-control.component.html',
  styleUrl: './base-form-control.component.scss',
})
export class BaseFormControlComponent {
  dataInputsService = inject(DataInputsService);
  cd = inject(ChangeDetectorRef);

  @Input() label = 'Label';
  @Input() placeholder = 'Placeholder';
  controlName = input.required<string>();
  showLabel = input(true);

  @Input() action?: (alias: string, formGroup: FormGroup) => void = () => {};
}
