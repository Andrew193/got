import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { LogRecord } from '../../../../models/logger.model';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { AutocompleteMatInputComponent } from '../../../data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';

@Component({
  selector: 'app-enhanced-form-constructor',
  standalone: true,
  imports: [formEnhancedImports, AutocompleteMatInputComponent],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
})
export class EnhancedFormConstructorComponent extends AbstractEnhancedFormComponent<LogRecord> {
  @Input() override allFields = [
    {
      alias: 'id',
      placeholder: 'ID',
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
