import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AppEntity, Control, CONTROL_TYPE, FormMatrix } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { SELECT_SEARCH_PREFIX } from '../../../../constants';

export class FormEnhancedOperations<T> {
  //_snackBar = inject(MatSnackBar);

  constructor(
    public allFields: AppEntity<T>[],
    protected formName: string,
    public mtx: FormMatrix<T>,
    protected fb: FormBuilder,
    protected localStorageService: LocalStorageService,
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

      //this._snackBar.open('Error saving form template configuration, the form name is not set!')
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

  createNewRowGroup = (row: (T & Record<string, any>) | null = null): FormGroup => {
    const rowGroup = this.fb.group({});

    if (this.allFields) {
      this.allFields.forEach(c =>
        this.addControlsToFormGroup(c.alias, c.rowControl, rowGroup, row),
      );
      rowGroup.markAllAsTouched();

      return rowGroup;
    }

    throw new Error('Your columns are not defined!');
  };

  private addSelectSearchControl(alias: string, control: Control, formGroup: FormGroup) {
    control.type === CONTROL_TYPE.SELECT &&
      formGroup.addControl(alias + SELECT_SEARCH_PREFIX, new FormControl<String>(''));
  }
}
