import { FormGroup } from '@angular/forms';
import { Id } from '../../../../models/common.model';
import { AbstractActions } from './abstractActions';

export class FormEnhancedActions<T extends Id> extends AbstractActions<T> {
  //_snackBar = inject(MatSnackBar);

  constructor(protected formGroup: FormGroup) {
    super();
  }

  override saveAction(): void {
    if (this.formGroup.invalid) {
      //this._snackBar.open('Your form is invalid. Validate it first!');
    } else {
      super.saveAction(this.formGroup.getRawValue());
    }
  }
}
