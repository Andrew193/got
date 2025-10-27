import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { AppEntity } from '../form-constructor.models';

@Component({
  selector: 'app-enhanced-form-constructor',
  imports: [formEnhancedImports],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnhancedFormConstructorComponent<T> extends AbstractEnhancedFormComponent<T> {
  override allFields = model.required<AppEntity<T>[]>();

  constructor(
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
  ) {
    super(fb, localStorageService);

    let initialRun = true;

    effect(() => {
      const allFields = this.allFields();

      if (!initialRun) {
        const onOffControl = this.apCtxMenuActions.apFormGroup.get(
          this.apCtxMenuActions.onOffAlias,
        );
        const onOffValues = onOffControl?.value as string[];

        if (onOffValues) {
          const remainingSelection = onOffValues.filter(el => {
            const inArray = allFields.find(_ => _.placeholder === el);

            return !!inArray;
          });

          this.apCtxMenuActions.setOnOffField(remainingSelection);
        }

        this.tileOps.allFields = allFields;
        this.setFieldsToMtxTiles(allFields);
        this.addAllFieldsToFormGroup();
        this.tileOps.saveFormTemplate();
      }

      initialRun = false;
    });
  }
}
