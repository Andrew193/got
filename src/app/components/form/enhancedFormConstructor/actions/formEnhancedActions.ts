import { FormGroup } from '@angular/forms';
import { AbstractActions } from './abstractActions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_CONFIG } from '../../../../constants';

export class FormEnhancedActions<T> extends AbstractActions<T> {
  constructor(
    protected formGroup: FormGroup,
    protected _snackBar: MatSnackBar,
  ) {
    super();
  }

  override saveAction(): void {
    if (this.formGroup.invalid) {
      this._snackBar.open('Your form is invalid. Validate it first!', '', SNACKBAR_CONFIG);
    } else {
      super.saveAction(this.formGroup.getRawValue());
    }
  }
}
