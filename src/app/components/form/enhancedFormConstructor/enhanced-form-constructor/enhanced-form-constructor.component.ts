import { Component, model } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { AppEntity } from '../form-constructor.models';

@Component({
  selector: 'app-enhanced-form-constructor',
  standalone: true,
  imports: [formEnhancedImports],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
})
export class EnhancedFormConstructorComponent<T> extends AbstractEnhancedFormComponent<T> {
  override allFields = model.required<AppEntity<T>[]>();

  constructor(
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
  ) {
    super(fb, localStorageService);

    this.formName = 'enhanced_form';

    // Experimental
    // let initialRun = true;
    // effect(() => {
    //   const allFields = this.allFields();
    //
    //   if (!initialRun) {
    //     this.saveFormConstructorState();
    //     this.tileOps.saveFormTemplate();
    //     super.ngOnInit();
    //   }
    //
    //   initialRun = false;
    // });
  }
}
