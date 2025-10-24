import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { CONTROL_TYPE } from '../form-constructor.models';
import { Id } from '../../../../models/common.model';

@Component({
  selector: 'app-enhanced-form-constructor',
  standalone: true,
  imports: [formEnhancedImports],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
})
export class EnhancedFormConstructorComponent extends AbstractEnhancedFormComponent<Id> {
  @Input() override allFields = [
    {
      alias: 'id',
      placeholder: 'ID',
      mainControl: {
        type: CONTROL_TYPE.INPUT,
        getControl: () => new FormControl<string>(''),
      },
    },
    {
      alias: 'firstName',
      placeholder: 'First Name',
      mainControl: {
        type: CONTROL_TYPE.INPUT,
        getControl: () =>
          new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
      },
    },
  ];

  constructor(
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
  ) {
    super(fb, localStorageService);

    this.formName = 'enhanced_form';
  }
}
