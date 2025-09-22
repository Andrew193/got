import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseFormControlComponent } from '../base-form-control/base-form-control.component';

@Component({
  selector: 'app-base-select-form-control',
  imports: [],
  templateUrl: './base-select-form-control.component.html',
  styleUrl: './base-select-form-control.component.scss',
})
export class BaseSelectFormControlComponent extends BaseFormControlComponent {
  @Input() filteredOptions: Observable<string[]> = new Observable<string[]>();

  constructor() {
    super();
  }
}
