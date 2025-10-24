import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AppEntity, Control, CONTROL_TYPE, FormMatrix } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { SELECT_SEARCH_PREFIX, SNACKBAR_CONFIG } from '../../../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';

export class FormEnhancedOperations<T> {
  constructor(
    public allFields: AppEntity<T>[],
    protected formName: string,
    public mtx: FormMatrix<T>,
    protected fb: FormBuilder,
    protected localStorageService: LocalStorageService,
    protected _snackBar: MatSnackBar,
  ) {}

  public dropField(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.saveFormTemplate();
  }

  public getSortedActiveFormElements = (field?: string, term?: string): Observable<string[]> => {
    return of(
      this.allFields
        .map(f => f.placeholder || '')
        .filter(item => item.toLowerCase().includes((term || '').toLowerCase())),
    );
  };

  public saveFormTemplate(nameSuffix = '', json = '') {
    if (this.formName) {
      json = json || this.serializeFormMatrix(this.mtx);
      this.localStorageService.setItem(this.formName + nameSuffix, json);
    } else {
      const errorMsg = 'Error saving form template configuration, the form name is not set!';

      this._snackBar.open(
        'Error saving form template configuration, the form name is not set!',
        '',
        SNACKBAR_CONFIG,
      );
      throw Error(errorMsg);
    }
  }

  private serializeFormMatrix<T>(formMatrix: FormMatrix<T>): string {
    return JSON.stringify({
      tiles: Array.from(formMatrix.tiles.entries()),
      mtx: formMatrix.mtx,
    });
  }

  addControlsToFormGroup(
    alias: string,
    control: Control | undefined,
    formGroup: FormGroup,
    detail: (T & Record<string, any>) | null = null,
  ) {
    if (control) {
      const formControl = control.getControl();

      if (formControl) {
        detail && formControl.setValue(detail[alias]);
        formControl && formGroup.addControl(alias, formControl);
        this.addSelectSearchControl(alias, control, formGroup);
      }
    }
  }

  private addSelectSearchControl(alias: string, control: Control, formGroup: FormGroup) {
    control.type === CONTROL_TYPE.SELECT &&
      formGroup.addControl(alias + SELECT_SEARCH_PREFIX, new FormControl<String>(''));
  }
}
