import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { map, of, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalFiltersService {
  private _filterByValue(originalOptions: string[]): (value: string) => string[] {
    return (value: string) => {
      const filterValue = value.toLowerCase();

      return originalOptions.filter(option => option.toLowerCase().includes(filterValue));
    };
  }

  filterOptionsByValueCover = (
    originalOptions: string[],
    control: AbstractControl<string, string> | null,
  ) => {
    const filter = this._filterByValue(originalOptions);

    return control
      ? control.valueChanges.pipe(
          startWith(''),
          map(value => filter(value || '')),
        )
      : of([]);
  };
}
